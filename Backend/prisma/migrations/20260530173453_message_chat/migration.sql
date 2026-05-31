-- CreateTable
CREATE TABLE "Messsage" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" INTEGER NOT NULL,

    CONSTRAINT "Messsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Messsage" ADD CONSTRAINT "Messsage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
