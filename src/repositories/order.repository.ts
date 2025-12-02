import { Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { AppDataSource } from "../database/data-source";
import { IOrder } from "../interfaces/order.interface";

export class OrderRepository {
    private repo: Repository<Order>;

    constructor() {
        this.repo = AppDataSource.getRepository(Order);
    }

    async findAll(skip: number, take: number): Promise<[Order[], number]> {
        return this.repo.createQueryBuilder("order")
            .skip(skip)
            .take(take)
            .getManyAndCount();
    }

    async findById(id: string): Promise<Order | null> {
        return this.repo.findOneBy({ id });
    }

    async saveOrders(data: Partial<IOrder>[]): Promise<Order[]> {
        const orders = this.repo.create(data);
        return this.repo.save(orders);
    }

    async search(q: string, skip: number, take: number): Promise<[Order[], number]> {
        const baseQuery = this.repo.createQueryBuilder("order")
            .where("order.productName ILIKE :q", { q: `%${q}%` })
            .orWhere("order.description ILIKE :q", { q: `%${q}%` })
            .orderBy("order.createdAt", "DESC");

        const total = await baseQuery.clone().getCount();
        const data = await baseQuery.skip(skip).take(take).getMany();

        return [data, total];
    }

    async getStats() {
        return this.repo.createQueryBuilder("order")
            .select("COUNT(*)", "totalOrders")
            .addSelect("SUM(order.totalAmount)", "totalRevenue")
            .addSelect(`SUM(CASE WHEN order.status = 'pending' THEN 1 ELSE 0 END)`, "pendingOrders")
            .addSelect(`SUM(CASE WHEN order.status = 'completed' THEN 1 ELSE 0 END)`, "completedOrders")
            .addSelect(`SUM(CASE WHEN order.status = 'cancelled' THEN 1 ELSE 0 END)`, "cancelledOrders")
            .addSelect("AVG(order.totalAmount)", "avgOrderValue")
            .getRawOne();
    }
}