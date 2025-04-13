export interface Product {
    _id: string;
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    sold: number;
    ratingAverage: number;
    ratingCount: number;
    category: { name: string };
    subcategory: { name: string };
    brand: { name: string; owner?: { name?: string } };
    sizes: string[];
    colors: string[];
    images: string[];
    coverImage?: string;
    createdAt?: string;
    updatedAt?: string;
}