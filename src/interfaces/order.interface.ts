import { OrderStatus } from '../types/order.type';

export interface IOrder {
    id: string;
    userId: string;
    productName: string;
    description: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedOrders {
    data: IOrder[];
    page: number;
    limit: number;
    total: number;
}