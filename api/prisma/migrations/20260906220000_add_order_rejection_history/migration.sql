-- CreateTable
CREATE TABLE "OrderRejection" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "deliveryCompanyId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderRejection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderRejection_orderId_deliveryCompanyId_key" ON "OrderRejection"("orderId", "deliveryCompanyId");

-- CreateIndex
CREATE INDEX "OrderRejection_deliveryCompanyId_idx" ON "OrderRejection"("deliveryCompanyId");

-- CreateIndex
CREATE INDEX "OrderRejection_orderId_createdAt_idx" ON "OrderRejection"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "OrderRejection" ADD CONSTRAINT "OrderRejection_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderRejection" ADD CONSTRAINT "OrderRejection_deliveryCompanyId_fkey" FOREIGN KEY ("deliveryCompanyId") REFERENCES "DeliveryCompany"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
