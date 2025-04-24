export interface Product {
    _id: string;
    name: string;
    coverImage: string;
    price: number;
    description: string;
    brand: {
        _id: string;
        name: string;
        owner: {
            _id: string;
            name: string;
        };
    };
    category: {
        _id: string;
        name: string;
    };
    subcategory: {
        _id: string;
        name: string;
        category: {
            _id: string;
            name: string;
        };
    };
    availableQuantity: number;
}

export interface CartItem {
    _id: string;
    product: Product | string;
    quantity: number;
    price: number;
}

export interface CartResponse {
    _id: string;
    cartItems: CartItem[];
    user: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    totalPrice: number;
}