import "reflect-metadata";
import { plainToClass } from "class-transformer";
import ProjectInput from "./components/project-input";
import ProjectList from "./components/project-list";
import Product from "./models/product.model";

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");

const products = [
    { title: "Book", price: 12.88 },
    { title: "Car Toy", price: 120.88 },
];

const loadedProducts = plainToClass(Product, products);

// const prod = new Product("Test", 999);

console.log(loadedProducts);
