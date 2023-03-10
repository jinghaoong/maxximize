import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FinalGoodsService } from '../final-goods/final-goods.service';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderStatus } from '../purchase-orders/enums/purchaseOrderStatus.enum';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';
import { CreateProductionRequestDto } from './dto/create-production-request.dto';
import { UpdateProductionRequestDto } from './dto/update-production-request.dto';
import { ProductionRequest } from './entities/production-request.entity';
import { ProdRequestStatus } from './enums/prodRequestStatus.enum';

@Injectable()
export class ProductionRequestsService {
  constructor(
    @InjectRepository(ProductionRequest)
    private readonly productionRequestsRepository: Repository<ProductionRequest>,
    @Inject(forwardRef(() => PurchaseOrdersService))
    private purchaseOrdersService: PurchaseOrdersService,
	private dataSource: DataSource,
    @Inject(forwardRef(() => FinalGoodsService))
    private finalGoodsService: FinalGoodsService
  ){}
  async create(createProductionRequestDto: CreateProductionRequestDto) {
    const {quantity, finalGoodId, purchaseOrderId, organisationId} = createProductionRequestDto
    let purchaseOrder = null
    if (purchaseOrderId) {
      purchaseOrder = await this.purchaseOrdersService.findOne(purchaseOrderId)
    }
    const finalGood = await this.finalGoodsService.findOne(finalGoodId)
    const newProdRequest = this.productionRequestsRepository.create({
      status: ProdRequestStatus.PENDING,
      quantity,
      finalGood,
      purchaseOrder,
      createdDateTime: new Date(),
      organisationId
    })
    const newPr = await this.productionRequestsRepository.save(newProdRequest)
    return this.findOne(newPr.id)
  }

  async bulkCreate(createProductionRequestDtos: CreateProductionRequestDto[]) {
    await this.dataSource.manager.transaction(async (transactionalEntityManager) => {
      let prodRequests: ProductionRequest[] = []

    const purchaseOrderId = createProductionRequestDtos[0].purchaseOrderId

      for (const dto of createProductionRequestDtos) {
        prodRequests.push(await this.create(dto))
      }

    const productionStatus = PurchaseOrderStatus.PRODUCTION

    await transactionalEntityManager.update(PurchaseOrder, purchaseOrderId, {
      status: productionStatus,
    });
    
      return prodRequests
    })
  }

  findAll() {
    return this.productionRequestsRepository.find({
      relations: {
        purchaseOrder: true,
        finalGood: true,
        prodOrders: true
      }
    })
  }

  findAllByOrgId(organisationId: number) {
    return this.productionRequestsRepository.find({
      where: {
        organisationId: organisationId
      },
      relations: {
        purchaseOrder: true,
        finalGood: true,
        prodOrders: true
      }
    })
  }

  findOne(id: number) {
    return this.productionRequestsRepository.findOne({
      where: {
        id
      },
      relations: {
        purchaseOrder: true,
        finalGood: true,
        prodOrders: true
      }
    })
  }

  async update(id: number, updateProductionRequestDto: UpdateProductionRequestDto) {
    const prodRequestToUpdate = await this.findOne(id)
    const arrayOfKeyValues = Object.entries(updateProductionRequestDto);
    arrayOfKeyValues.forEach(([key, value]) => {
      prodRequestToUpdate[key] = value;
    });
    return this.productionRequestsRepository.save(prodRequestToUpdate);
  }

  async remove(id: number) {
    const prodRequest = await this.findOne(id)
    return this.productionRequestsRepository.remove(prodRequest)
  }
}
