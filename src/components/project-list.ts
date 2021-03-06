import AutoBind from "../decorators/autobind";
import { DragTarget } from "../models/drag-drop";
import { Project, ProjectType } from "../models/project";
import { projectState } from "../state/project-state";
import Component from "./base-component";
import ProjectItem from "./project-item";

// Project-List Class
export default class ProjectList
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
