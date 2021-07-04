//Drag & Drop Interface
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

//Project Type
enum ProjectType {
    ACTIVE,
    FINISHED,
}
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectType
    ) {}
}

//Project State Management

type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(fn: Listener<T>) {
        this.listeners.push(fn);
    }
}

class ProjectState extends State<Project> {
    private project: Project[] = [];
    private static instance: ProjectState;

    get allProjects() {
        return this.project;
    }

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }

        this.instance = new ProjectState();

        return this.instance;
    }

    addProject(title: string, description: string, people: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            people,
            ProjectType.ACTIVE
        );

        this.project.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectType) {
        const project = this.project.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        this.listeners.forEach(fn => fn(this.project.slice()));
    }
}

const projectState = ProjectState.getInstance();

//?Validation Logic
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable): boolean {
    let isValid = true;

    // Validate Required
    if (validatableInput.required) {
        isValid =
            isValid && validatableInput.value.toString().trim().length !== 0;
    }

    //Validate Min Length
    if (
        validatableInput.minLength != null &&
        typeof validatableInput.value === "string"
    ) {
        isValid =
            isValid &&
            validatableInput.value.length >= validatableInput.minLength;
    }

    //Validate Max Length
    if (
        validatableInput.maxLength != null &&
        typeof validatableInput.value === "string"
    ) {
        isValid =
            isValid &&
            validatableInput.value.length <= validatableInput.maxLength;
    }

    //Validate Max
    if (
        validatableInput.max != null &&
        typeof validatableInput.value === "number"
    ) {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }

    //Validate Min
    if (
        validatableInput.min != null &&
        typeof validatableInput.value === "number"
    ) {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }

    return isValid;
}

//?AutoBind Decorator
function AutoBind(_target: any, _name: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };

    return adjustedDescriptor;
}
//Component Base Class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateEl: HTMLTemplateElement;
    targetEl: T;
    element: U;

    constructor(
        templateId: string,
        targetId: string,
        insertAtStart: boolean,
        elementId?: string
    ) {
        this.templateEl = document.getElementById(
            templateId
        )! as HTMLTemplateElement;

        this.targetEl = <T>document.getElementById(targetId)!;

        const importedHTML = document.importNode(this.templateEl.content, true);

        this.element = importedHTML.firstElementChild as U;
        if (elementId) {
            this.element.id = elementId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean) {
        this.targetEl.insertAdjacentElement(
            insertAtBeginning ? "afterbegin" : "beforeend",
            this.element
        );
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

//Project Item Class
class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable
{
    private project: Project;

    get persons() {
        if (this.project.people === 1) {
            return `1 person assigned`;
        } else {
            return `${this.project.people} persons assigned`;
        }
    }

    constructor(targetId: string, project: Project) {
        super("single-project", targetId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    @AutoBind
    dragStartHandler(e: DragEvent) {
        e.dataTransfer!.setData("text/plain", this.project.id);
        e.dataTransfer!.effectAllowed = "move";
    }

    dragEndHandler(_e: DragEvent) {
        console.log("Drag End");
    }

    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }

    renderContent() {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.persons;
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}
// Project-List Class
class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
{
    assignedProject: Project[];
    constructor(private type: "active" | "finished") {
        super("project-list", "app", false, `${type}-projects`);

        this.assignedProject = [];

        this.configure();
        this.renderContent();
    }
    @AutoBind
    dragLeaveHandler(_e: DragEvent) {
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.remove("droppable");
    }

    @AutoBind
    dragOverHandler(e: DragEvent) {
        if (e.dataTransfer && e.dataTransfer.types[0] === "text/plain") {
            e.preventDefault();
            const listEl = this.element.querySelector("ul")!;
            listEl.classList.add("droppable");
        }
    }

    @AutoBind
    dropHandler(e: DragEvent) {
        const projectId = e.dataTransfer!.getData("text/plain");
        projectState.moveProject(
            projectId,
            this.type === "active" ? ProjectType.ACTIVE : ProjectType.FINISHED
        );
    }

    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(item => {
                if (this.type === "active") {
                    return item.status === ProjectType.ACTIVE;
                }

                return item.status === ProjectType.FINISHED;
            });

            this.assignedProject = relevantProjects;
            this.renderProjects();
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector(
            "h2"
        )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }

    private renderProjects() {
        const listEl = document.getElementById(
            `${this.type}-projects-list`
        ) as HTMLUListElement;
        listEl.innerHTML = "";
        for (const project of this.assignedProject) {
            new ProjectItem(this.element.querySelector("ul")!.id, project);
        }
    }
}

//Project-Input Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInp: HTMLInputElement;
    descriptionInp: HTMLInputElement;
    peopleInp: HTMLInputElement;
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInp = this.element.querySelector(
            "#title"
        ) as HTMLInputElement;
        this.descriptionInp = this.element.querySelector(
            "#description"
        ) as HTMLInputElement;
        this.peopleInp = this.element.querySelector(
            "#people"
        ) as HTMLInputElement;

        this.configure();
    }
    renderContent() {}

    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInp.value;
        const enteredDesc = this.descriptionInp.value;
        const enteredPeople = this.peopleInp.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,
        };

        const descValidatable: Validatable = {
            value: enteredDesc,
            required: true,
            minLength: 5,
        };

        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 10,
        };

        if (
            !validate(titleValidatable) ||
            !validate(descValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert("invalid Input!! Please Try again");
            return;
        } else {
            return [enteredTitle, enteredDesc, +enteredPeople];
        }
    }

    private clearInputs() {
        this.element.reset();
    }

    @AutoBind
    private submitHandler(e: Event) {
        e.preventDefault();
        const userInput = this.gatherUserInput();

        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            this.clearInputs();
            projectState.addProject(title, description, people);
        }
    }
}

const projectInput = new ProjectInput();
const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");
