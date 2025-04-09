export interface WishlistProduct {
    _id: string;
    name: string;
    description: string;
    colors: string[];
    sizes: string[];
    price: number;
    quantity: number;
    sold: number;
    ratingAverage: number;
    ratingCount: number;
    coverImage: string;
    images: string[];
    brand: {
        _id: string;
        name: string;
        owner: {
            _id: string;
            name: string;
        };
        id: string;
    };
    category: {
        _id: string;
        name: string;
        id: string;
    };
    subcategory: {
        _id: string;
        name: string;
        category: {
            _id: string;
            name: string;
            id: string;
        };
        id: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
    id?: string;
}
