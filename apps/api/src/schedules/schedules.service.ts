import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BatchesService } from '../batches/batches.service';
import { LineItem } from '../line-Items/LineItem';
import { ProductionLine } from '../production-lines/entities/production-line.entity';
import { ProductionLinesService } from '../production-lines/production-lines.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { ScheduleType } from './enums/scheduleType.enum';
import { Batch } from '../batches/entities/batch.entity';
import { AllocateScheduleDto } from './dto/allocate-schedule.dto';
import { ProductionOrder } from '../production-orders/entities/production-order.entity';
import { ProductionOrderStatus } from '../production-orders/enums/production-order-status.enum';
import { ProductionRequest } from '../production-requests/entities/production-request.entity';
import { ProdRequestStatus } from '../production-requests/enums/prodRequestStatus.enum';
import { BatchLineItem } from '../batch-line-items/entities/batch-line-item.entity';
import { PurchaseOrderStatus } from '../purchase-orders/enums/purchaseOrderStatus.enum';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { ReservationLineItem } from '../reservation-line-items/entities/reservation-line-item.entity';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @Inject(forwardRef(() => ProductionLinesService))
    private productionLineService: ProductionLinesService,
    @Inject(forwardRef(() => PurchaseOrdersService))
    private purchaseOrderService: PurchaseOrdersService,
    private datasource: DataSource,
    @Inject(forwardRef(() => BatchesService))
    private batchesService: BatchesService
  ) {}
  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const { start, end, status, productionLineId } = createScheduleDto;
    let productionLineToBeAdded: ProductionLine;
    let newSchedule: Schedule;
    //need to update the nextAvailableDateTime in the production Line so wrap it in transaction
    await this.datasource.manager.transaction(
      async (transactionalEntityManager) => {
        if (productionLineId) {
          productionLineToBeAdded =
            await transactionalEntityManager.findOneByOrFail(ProductionLine, {
              id: productionLineId,
            });
        }
        newSchedule = transactionalEntityManager.create(Schedule, {
          start,
          end,
          status,
          productionLineId: productionLineToBeAdded.id ?? null,
          //REMOVE THIS (Required for testing)
          // finalGoodId: finalGoodId
        });
        return transactionalEntityManager.save(newSchedule);
      }
    );
    return newSchedule;
  }

  findAll() {
    return this.scheduleRepository.find({
      relations: {
        //REMOVE THIS (Required for testing)
        // finalGood: true,
        productionLine: true,
        completedGoods: true,
        scheduleLineItems: {
          prodLineItem: {
            rawMaterial: true,
            batchLineItem: true
          }
        },
        productionOrder: {
          bom: {
            finalGood: true,
          },
          prodRequest: true,
        },
      },
    });
  }

  findAllByOrg(orgId: number) {
    return this.scheduleRepository.find({
      where: {
        productionOrder: {
          organisationId: orgId
        }
      }, relations: {
        productionLine: true
      }
    })
  }

  async findOne(id: number) {
    try {
      const schedule = await this.scheduleRepository.findOne({where: {
        id
      }, relations: {
        //REMOVE THIS (Required for testing)
        // finalGood: true,
        productionLine: true,
        completedGoods: true,
        scheduleLineItems: {
          prodLineItem: {
            rawMaterial: true,
            batchLineItem: true
          }
        },
        productionOrder: {
          bom: {
            finalGood:true
          },
          prodRequest: true
        }
      }})
      return schedule
    } catch (error) {
      throw new NotFoundException(`schedule with id: ${id} cannot be found!`);
    }
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    const keyValuePairs = Object.entries(updateScheduleDto);
    const scheduleToUpdate = await this.findOne(id);
    for (const [key, value] of keyValuePairs) {
      if (key === 'productionLineId') {
        await this.productionLineService.findOne(value);
      }
      scheduleToUpdate[key] = value;
    }
    return this.scheduleRepository.save(scheduleToUpdate);
  }

  async remove(id: number) {
    //dont anyhow remove schedules
    const scheduleToRemove = await this.findOne(id);
    return this.scheduleRepository.remove(scheduleToRemove);
  }

  async getProductionYield(id: number) {
    const schedules = await this.findAllByOrg(id)
    let totalExpected: number = 0
    let totalActual: number = 0
    const date = new Date()
    for (const schedule of schedules) {
      if (schedule.end.getMonth() == date.getMonth() && schedule.end.getFullYear() == date.getFullYear() && schedule.status == ScheduleType.ALLOCATED){
        totalExpected += schedule.expectedQuantity
        totalActual += schedule.actualQuantity
      }
    }
    if (totalExpected > 0){
      return totalActual/totalExpected;
    } else {
      return 0;
    }
    
  }

  async getProductionThroughput(id: number) {
    const schedules = await this.findAllByOrg(id)
    let actualQuantity: number = 0
    let hoursElapsed: number = 0
    const date = new Date()
    for (const schedule of schedules) {
      if (schedule.end.getMonth() == date.getMonth() && schedule.end.getFullYear() == date.getFullYear() && schedule.status == ScheduleType.ALLOCATED){
        actualQuantity += schedule.actualQuantity
        const hours = (schedule.end.getTime() - schedule.start.getTime()) / 3600000
        hoursElapsed += hours
      }
    }
    if (hoursElapsed > 0){
      return actualQuantity/hoursElapsed;
    } else {
      return 0;
    }
    
  }

  async allocate(allocateScheduleDto: AllocateScheduleDto) {
    const { orgId, scheduleId, quantity, volumetricSpace } =
      allocateScheduleDto;
    let schedule: Schedule = await this.findOne(scheduleId);
    let purchaseOrder: PurchaseOrder;
    if (allocateScheduleDto.purchaseOrderId) {
      purchaseOrder = await this.purchaseOrderService.findOne(allocateScheduleDto.purchaseOrderId);
    }
    await this.datasource.manager.transaction(
      async (transactionalEntityManager) => {
        let newBatch: Batch;
        newBatch = await this.batchesService.allocate(
          orgId,
          schedule.productionOrder.bom.finalGood.id,
          quantity,
          volumetricSpace
        );
        // const batch = await transactionalEntityManager.create(Batch, {
        //   batchNumber: newBatch.batchNumber,
        //   organisationId: orgId,
        //   batchLineItems: newBatch.batchLineItems
        // })

        await transactionalEntityManager.save(newBatch);

        await transactionalEntityManager.update(Schedule, scheduleId, {
          status: ScheduleType.ALLOCATED,
          completedGoods: newBatch,
          actualQuantity: quantity
        });
        let productionOrder: ProductionOrder =
          await transactionalEntityManager.findOne(ProductionOrder, {
            where: {
              id: schedule.productionOrder.id,
            },
            relations: {
              schedules: true,
              prodRequest: {
                purchaseOrder: {
                  reservationLineItems: true
                }
              },
            },
          });
        if (productionOrder.prodRequest) {
          for (const lineItem of newBatch.batchLineItems) {
            await transactionalEntityManager.update(
              BatchLineItem,
              lineItem.id,
              { reservedQuantity: productionOrder.prodRequest.quantity }
            );
            const reservationLineItem = new ReservationLineItem();
            reservationLineItem.product = lineItem.product;
            reservationLineItem.quantity = productionOrder.prodRequest.quantity;
            reservationLineItem.batchLineItem = lineItem;
            await transactionalEntityManager.save(reservationLineItem);
            purchaseOrder.reservationLineItems.push(reservationLineItem);
            if (purchaseOrder.followUpLineItems.length === 0) {
              for (const lineItem of purchaseOrder.poLineItems) {
                if (lineItem.finalGood.id === newBatch.batchLineItems[0].product.id) {
                  lineItem.fufilledQty += productionOrder.prodRequest.quantity;
                }
              }
            } else {
              for (const lineItem of purchaseOrder.followUpLineItems) {
                if (lineItem.finalGood.id === newBatch.batchLineItems[0].product.id) {
                  lineItem.fufilledQty += productionOrder.prodRequest.quantity;
                }
              }
            }
          }
          await transactionalEntityManager.save(purchaseOrder);
        }
        let checker = true;
        for (const sche of productionOrder.schedules) {
          if (!(sche.status == ScheduleType.ALLOCATED)) {
            checker = false;
          }
        }
        if (checker) {
          await transactionalEntityManager.update(
            ProductionOrder,
            schedule.productionOrder.id,
            { status: ProductionOrderStatus.ALLOCATED }
          );
          if (schedule.productionOrder.prodRequest) {
            let check = true;
            const prodReq = await transactionalEntityManager.findOne(
              ProductionRequest,
              {
                where: {
                  id: schedule.productionOrder.prodRequest.id,
                },
                relations: {
                  prodOrders: true,
                  purchaseOrder: true,
                },
              }
            );
            for (const prodO of prodReq.prodOrders) {
              if (!(prodO.status == ProductionOrderStatus.ALLOCATED)) {
                check = false;
              }
            }
            if (check) {
              await transactionalEntityManager.update(
                ProductionRequest,
                prodReq.id,
                {
                  status: ProdRequestStatus.FULFILLED,
                }
              );
              let check1 = true;
              const po = await transactionalEntityManager.findOne(
                PurchaseOrder,
                {
                  where: {
                    id: prodReq.purchaseOrder.id,
                  },
                  relations: {
                    prodRequests: true,
                  },
                }
              );
              for (const pr of po.prodRequests) {
                if (!(pr.status == ProdRequestStatus.FULFILLED)) {
                  check1 = false;
                }
              }
              if (check1) {
                await transactionalEntityManager.update(
                  PurchaseOrder,
                  prodReq.purchaseOrder.id,
                  {
                    status: PurchaseOrderStatus.PRODUCTIONCOMPLETED,
                  }
                );
              }
            }
          }
        }
        return null;
      }
    );
    return this.findOne(scheduleId);
  }
}
