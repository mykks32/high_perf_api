import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from "typeorm";

@Entity("data_records")
@Index(["source", "createdAt"])
@Index("idx_data_record_status", ["status"])
export class DataRecord {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    source: string;

    @Column("float")
    value: number;

    @Column("json", { nullable: true })
    payload: object;

    @Column({ default: "pending" })
    status: "pending" | "processed";

    @CreateDateColumn()
    createdAt: Date;
}
