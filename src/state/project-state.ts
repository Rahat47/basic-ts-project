import { Project, ProjectType } from "../models/project.js";

//Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(fn: Listener<T>) {
        this.listeners.push(fn);
    }
}

export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance();
