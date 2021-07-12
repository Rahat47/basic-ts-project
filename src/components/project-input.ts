import { AutoBind } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import { Validatable, validate } from "../utils/validation";
import { Component } from "./base-component";

//Project-Input Class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
