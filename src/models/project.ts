//Project Type
export enum ProjectType {
    ACTIVE,
    FINISHED,
}
export class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectType
    ) {}
}
