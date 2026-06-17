import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up duplicate main products for 0899999999...');
  const items = await prisma.reservationItem.findMany({
    where: {
      phoneNumber: '0899999999',
      isMainProduct: true,
      reservation: { status: 'ACTIVE' }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (items.length > 1) {
    const toDelete = items.slice(1);
    for (const item of toDelete) {
      // Note: We might want to delete the whole reservation or just the item
      // For cleanup, deleting the item is safer for integrity if others exist
      await prisma.reservationItem.delete({ where: { id: item.id } });
      console.log('Deleted duplicate item ID:', item.id);
    }
  }
  console.log('Cleanup complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
