import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Bin } from '../../bins/entities/bin.entity';
import { Organisation } from '../../organisations/entities/organisation.entity';
import { Rack } from '../../racks/entities/rack.entity';

@Entity()
export class Warehouse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    address: string;

    @ManyToOne(() => Organisation, (organisation) => organisation.warehouses, {
        onDelete: 'CASCADE'
    })
    organisation: Organisation;

    @OneToMany(() => Rack, rack => rack.warehouse)
    racks: Rack[];
}
