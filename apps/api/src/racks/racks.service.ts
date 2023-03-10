import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { WarehousesService } from '../warehouses/warehouses.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { Rack } from './entities/rack.entity';

@Injectable()
export class RacksService {
  constructor(
    @InjectRepository(Rack)
    private readonly rackRepository: Repository<Rack>,
    private warehouseService: WarehousesService,
    private dataSource: DataSource
  ) {};

  async create(createRackDto: CreateRackDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rack = new Rack();
      rack.name = createRackDto.name;
      rack.description = createRackDto.description;
      
      const warehouse = await this.warehouseService.findOne(createRackDto.warehouseId);
      rack.warehouse = warehouse;
      
      const newRack = await queryRunner.manager.save(rack);
      await queryRunner.commitTransaction();
      return this.findOne(newRack.id);
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.rackRepository.find({
      relations: ["warehouse", "bins"]
    });
  }

  async findOne(id: number) {
    try {
      return await this.rackRepository.findOneOrFail({
        where: {
          id: id
        },
        relations: {
          warehouse: true,
          bins: {
            batchLineItems: {
              product: true,
              bin: {
                rack: {
                  warehouse: true
                }
              }
            }
          }
        }
      });
    } catch (err) {
      throw new NotFoundException(`Rack with id: ${id} not found`);
    }
  }

  async findAllByOrganisationId(id: number) {
    return await this.rackRepository.find({
      where: {
        warehouse: {
          organisation: {
            id: id
          }
        }
      },
      relations: ["warehouse", "bins"]
    });
  }

  async update(id: number, updateRackDto: UpdateRackDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Rack, id, updateRackDto);

      if (updateRackDto.name) {
        const rack = await this.findOne(id);
        const batchLineItems = rack.bins.flatMap(bin => {
          return bin.batchLineItems;
        });

        for (const batchLineItem of batchLineItems) {
          batchLineItem.code = "B-" + batchLineItem.bin.name + "-R-" + updateRackDto.name + "-W-" + batchLineItem.bin.rack.warehouse.name;
          queryRunner.manager.save(batchLineItem);
        }
      }

      await queryRunner.commitTransaction();
      return await this.findOne(id);
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    return await this.rackRepository.delete(id);
  }
}
