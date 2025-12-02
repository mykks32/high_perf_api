import {OrderRepository} from "../repositories/order.repository";
import {IOrder} from "../interfaces/order.interface";

export class OrderService {
    private repo = new OrderRepository();

    async getOrders(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.findAll(skip, limit);
        return { data, page, limit, total };
    }

    async getOrderById(id: string) {
        const order = await this.repo.findById(id);
        if (!order) return null;
        return order;
    }

    async createOrders(data: Partial<IOrder>[]) {
        return await this.repo.saveOrders(data);
    }

    async searchOrders(q: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.search(q, skip, limit);
        return { data, page, limit, total };
    }

    async getStats() {
        const raw = await this.repo.getStats();
        return {
            totalOrders: Number(raw.totalOrders),
            totalRevenue: Number(raw.totalRevenue),
            pendingOrders: Number(raw.pendingOrders),
            completedOrders: Number(raw.completedOrders),
            cancelledOrders: Number(raw.cancelledOrders),
            avgOrderValue: Number(raw.avgOrderValue),
        };
    }
}