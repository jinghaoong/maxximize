import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { FinalGood } from "../../final-goods/entities/final-good.entity"
import { Organisation } from "../../organisations/entities/organisation.entity"
import { ProductionLineItem } from "../../production-line-items/entities/production-line-item.entity"
import { ProductionOrder } from "../../production-orders/entities/production-order.entity"
import { RawMaterial } from "../../raw-materials/entities/raw-material.entity"
import { SalesInquiry } from "../../sales-inquiry/entities/sales-inquiry.entity"
import { PRStatus } from "../enums/prStatus.enum"
import { RequestByType } from "../enums/RequestByType.enum"

@Entity()
export class PurchaseRequisition {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    expectedQuantity: number

    @Column()
    quantityToFulfill: number

    @Column({
        type: 'enum',
        enum: RequestByType,
        default: RequestByType.ADHOC
    })
    requestByType: RequestByType

    @Column({
        type: 'enum',
        enum: PRStatus
    })
    status: PRStatus

    @Column()
    createdDateTime: Date;

    @OneToOne(() => FinalGood)
    @JoinColumn()
    finalGood: FinalGood

    @Column()
    rawMaterialId: number
    @ManyToOne(() => RawMaterial)
    @JoinColumn({name: 'rawMaterialId'})
    rawMaterial: RawMaterial

    @OneToOne(() => ProductionLineItem, productionLineItem => productionLineItem.purchaseRequisition)
    @JoinColumn({name: 'productionLineItemId'})
    productionLineItem: ProductionLineItem

    @Column({nullable: true})
    salesInquiryId: number
    @ManyToOne(() => SalesInquiry, salesInquiry => salesInquiry.purchaseRequisitions)
    @JoinColumn({name: 'salesInquiryId'})
    salesInquiry: SalesInquiry

    @Column()
    organisationId: number
    @ManyToOne(() => Organisation, organisation => organisation.purchaseRequisitions)
    @JoinColumn({name: 'organisationId'})
    organisation: Organisation

}
