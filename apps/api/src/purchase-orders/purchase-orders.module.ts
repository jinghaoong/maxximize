import { forwardRef, Module } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { Organisation } from '../organisations/entities/organisation.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { PurchaseOrderLineItem } from '../purchase-order-line-items/entities/purchase-order-line-item.entity';
import { OrganisationsModule } from '../organisations/organisations.module';
import { PurchaseOrderLineItemsModule } from '../purchase-order-line-items/purchase-order-line-items.module';
import { QuotationsModule } from '../quotations/quotations.module';
import { RawMaterial } from '../raw-materials/entities/raw-material.entity';
import { FinalGood } from '../final-goods/entities/final-good.entity';
import { MailModule } from '../mail/mail.module';
import { FollowUpLineItem } from '../follow-up-line-items/entities/follow-up-line-item.entity';
import { GoodsReceipt } from '../goods-receipts/entities/goods-receipt.entity';
import { BatchLineItemsModule } from '../batch-line-items/batch-line-items.module';
import { ReservationLineItem } from '../reservation-line-items/entities/reservation-line-item.entity';
import { ShellOrganisationsModule } from '../shell-organisations/shell-organisations.module';
import { ShellOrganisation } from '../shell-organisations/entities/shell-organisation.entity';
import { InvoicesModule } from '../invoices/invoices.module';
import { Invoice } from '../invoices/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Organisation, 
    PurchaseOrder, 
    PurchaseOrderLineItem, 
    Quotation, 
    FollowUpLineItem, 
    RawMaterial, 
    FinalGood, 
    GoodsReceipt, 
    ReservationLineItem,
    ShellOrganisation,
    Invoice
  ]), 
    PurchaseOrderLineItemsModule, 
    OrganisationsModule, 
    QuotationsModule, 
    MailModule,
    BatchLineItemsModule,
    forwardRef(() => ShellOrganisationsModule),
    forwardRef(() => InvoicesModule)
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService]
})
export class PurchaseOrdersModule {}
