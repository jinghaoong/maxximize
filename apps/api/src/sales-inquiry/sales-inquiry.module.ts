import { forwardRef, Module } from '@nestjs/common';
import { SalesInquiryService } from './sales-inquiry.service';
import { SalesInquiryController } from './sales-inquiry.controller';
import { SalesInquiry } from './entities/sales-inquiry.entity';
import { SalesInquiryLineItem } from '../sales-inquiry-line-items/entities/sales-inquiry-line-item.entity';
import { ShellOrganisation } from '../shell-organisations/entities/shell-organisation.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { Organisation } from '../organisations/entities/organisation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { RawMaterial } from '../raw-materials/entities/raw-material.entity';
import { PurchaseRequisition } from '../purchase-requisitions/entities/purchase-requisition.entity';
import { PurchaseRequisitionsModule } from '../purchase-requisitions/purchase-requisitions.module';
import { OrganisationsModule } from '../organisations/organisations.module';
import { FinalGoodsModule } from '../final-goods/final-goods.module';
import { ChronJobsModule } from '../chron-jobs/chron-jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesInquiry, SalesInquiryLineItem, ShellOrganisation, Quotation, Organisation, RawMaterial, PurchaseRequisition]), 
    MailModule, forwardRef(() => FinalGoodsModule),
    forwardRef(() => PurchaseRequisitionsModule),
    OrganisationsModule,
    forwardRef(() => ChronJobsModule),
  ],
  controllers: [SalesInquiryController],
  providers: [SalesInquiryService],
  exports: [SalesInquiryService]
})
export class SalesInquiryModule {}
