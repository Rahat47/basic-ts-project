import AutoBind from "../decorators/autobind";
import { Draggable } from "../models/drag-drop";
import { Project } from "../models/project";
import Component from "./base-component";

//Project Item Class
export default class ProjectItem
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
