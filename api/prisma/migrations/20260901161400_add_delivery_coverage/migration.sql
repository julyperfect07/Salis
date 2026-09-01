-- CreateEnum
CREATE TYPE "DeliveryZone" AS ENUM ('AMMAN_CENTRAL', 'AMMAN_WEST', 'AMMAN_EAST', 'AMMAN_NORTH', 'AMMAN_SOUTH');

-- AlterTable
ALTER TABLE "DeliveryCompany" ADD COLUMN     "coverageZones" "DeliveryZone"[] DEFAULT ARRAY[]::"DeliveryZone"[];

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryZone" "DeliveryZone";
