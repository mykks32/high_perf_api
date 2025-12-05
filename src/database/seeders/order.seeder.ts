import {AppDataSource} from "../data-source"; // Adjust path
import {Order} from "../../entities/order.entity";
import {faker} from '@faker-js/faker';
import {Logger} from "../../logger";


export class OrderSeeder {
    private orderRepo = AppDataSource.getRepository(Order);
    private readonly totalRecords = 10000;
    private readonly chunkSize = 1000;
    private readonly logger = new Logger(OrderSeeder.name); // Initialize Logger

    private readonly statuses: Array<'pending' | 'completed' | 'cancelled'> = ['pending', 'completed', 'cancelled'];

    private generateOrder(): Partial<Order> {
        return {
            userId: faker.string.uuid(),
            productName: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            totalAmount: parseFloat(faker.commerce.price({min: 10, max: 1000, dec: 2})),
            status: this.statuses[Math.floor(Math.random() * this.statuses.length)],
            createdAt: faker.date.past({years: 1, refDate: new Date()}),
            updatedAt: new Date(),
        };
    }

    private generateOrdersBatch(count: number): Partial<Order>[] {
        const batch: Partial<Order>[] = [];
        for (let i = 0; i < count; i++) {
            batch.push(this.generateOrder());
        }
        return batch;
    }

    public async run() {
        try {
            await AppDataSource.initialize();
            this.logger.info("Database connected. Seeding 10,000 orders...");

            for (let i = 0; i < this.totalRecords; i += this.chunkSize) {
                const batchCount = Math.min(this.chunkSize, this.totalRecords - i);
                const batch = this.generateOrdersBatch(batchCount);
                await this.orderRepo.insert(batch);
                this.logger.info(`Inserted ${i + batchCount} orders`);
            }

            this.logger.info("Seeding completed!");
            await AppDataSource.destroy();
        } catch (err) {
            this.logger.error("Seeding failed:", err);
            process.exit(1);
        }
    }
}

// Run the seeder
new OrderSeeder().run();
