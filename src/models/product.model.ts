export default class Product {
    title: string;
    price: number;

    constructor(t: string, p: number) {
        this.title = t;
        this.price = p;
    }

    getInfo() {
        return [this.title, `$${this.price}`];
    }
}
