export interface GetOrdersDTO {
    page?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'cancelled';
    search?: string;
}
