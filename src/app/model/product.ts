import { Category } from "./category";

interface Product {
    id: number,
    name: string,
    price: number,
    category: Category
}

export type { Product }