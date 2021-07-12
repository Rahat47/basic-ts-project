//Component Base Class
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
