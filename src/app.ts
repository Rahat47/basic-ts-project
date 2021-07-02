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

// Project-List Class
class ProjectList {
    templateEl: HTMLTemplateElement;
    targetEl: HTMLDivElement;
    element: HTMLElement;
    constructor(private type: "active" | "finished") {
        this.templateEl = document.getElementById(
            "project-list"
        )! as HTMLTemplateElement;

        this.targetEl = <HTMLDivElement>document.getElementById("app")!;

        const importedHTML = document.importNode(this.templateEl.content, true);

        this.element = importedHTML.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        this.attach();
        this.renderContent();
    }
    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector(
            "h2"
        )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }

    private attach() {
        this.targetEl.insertAdjacentElement("beforeend", this.element);
    }
}

//Project-Input Class
class ProjectInput {
    templateEl: HTMLTemplateElement;
    targetEl: HTMLDivElement;
    element: HTMLFormElement;
    titleInp: HTMLInputElement;
    descriptionInp: HTMLInputElement;
    peopleInp: HTMLInputElement;
    constructor() {
        this.templateEl = document.getElementById(
            "project-input"
        )! as HTMLTemplateElement;

        this.targetEl = <HTMLDivElement>document.getElementById("app")!;

        const importedHTML = document.importNode(this.templateEl.content, true);

        this.element = importedHTML.firstElementChild as HTMLFormElement;
        this.element.id = "user-input";

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
        this.attach();
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
            minLength: 10,
        };

        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5,
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
            console.log({ title, description, people });
        }
    }

    private configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }

    private attach() {
        this.targetEl.insertAdjacentElement("afterbegin", this.element);
    }
}

const projectInput = new ProjectInput();
const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");
