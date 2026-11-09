-- CreateEnum
CREATE TYPE "StatusLote" AS ENUM ('AGUARDANDO', 'EM_ROTA', 'CONCLUIDO', 'CANCELADO');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "loteId" INTEGER;

-- CreateTable
CREATE TABLE "lotes_entrega" (
    "id" SERIAL NOT NULL,
    "bairro" TEXT,
    "entregador" TEXT,
    "dataEntrega" TIMESTAMP(3),
    "status" "StatusLote" NOT NULL DEFAULT 'AGUARDANDO',
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_entrega_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes_entrega"("id") ON DELETE SET NULL ON UPDATE CASCADE;
