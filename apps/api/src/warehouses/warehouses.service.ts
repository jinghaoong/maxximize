import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrganisationsService } from '../organisations/organisations.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(@InjectRepository(Warehouse)
  private readonly warehouseRepository: Repository<Warehouse>,
  private organisationService: OrganisationsService,
  private dataSource: DataSource) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const warehouse = new Warehouse();
      warehouse.name = createWarehouseDto.name;
      warehouse.address = createWarehouseDto.address;
      warehouse.description = createWarehouseDto.description;

      const organisation = await this.organisationService.findOne(createWarehouseDto.organisationId);
      warehouse.organisation = organisation;
      
      const createdWarehouse = queryRunner.manager.save(warehouse);
      await queryRunner.commitTransaction();
      return createdWarehouse;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const warehouses = await this.warehouseRepository.find({
      relations: ["organisation", "racks.bins.batchLineItems.product", "racks"]
    });
    if (warehouses === undefined || warehouses.length === 0) {
      throw new NotFoundException("No warehouse(s) found!");
    } else {
      return warehouses;
    }
  }

  async findAllByOrgId(organisationId: number): Promise<Warehouse[]> {
    return await this.warehouseRepository.find({
      where: {
        organisation: {
          id: organisationId
        }
      },
      relations: ["organisation", "racks.bins.batchLineItems.product", "racks"]
    });
  }

  async findOne(id: number) {
    const warehouse = await this.warehouseRepository.findOne({
      where: {
        id: id
      },
      relations: {
        organisation: true,
        racks: {
          bins: {
            batchLineItems: {
              product: true,
              bin: {
                rack: true
              }
            }
          }
        }
      }
    });
    if (warehouse) {
      return warehouse;
    } else {
      throw new NotFoundException(`No warehouse with id ${id} found!`);
    }
  }

  async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Warehouse, id, updateWarehouseDto);
      const warehouse = await this.findOne(id);

      if (updateWarehouseDto.name) {
        const batchLineItems = warehouse.racks.flatMap(rack => {
          return rack.bins.flatMap(bin => {
            return bin.batchLineItems;
          })
        });

        for (const batchLineItem of batchLineItems) {
          batchLineItem.code = "B-" + batchLineItem.bin.name + "-R-" + batchLineItem.bin.rack.name + "-W-" + updateWarehouseDto.name;
          queryRunner.manager.save(batchLineItem);
        }
      }
      await queryRunner.commitTransaction();
      return await this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  remove(id: number) {
    return this.warehouseRepository.delete(id);
  }
}
