import prisma from '../config/db.js';

export async function generateInvoiceNumber() {
  const count = await prisma.order.count({
    where: { invoiceNumber: { not: null } },
  });
  const next = count + 1;
  return `B001-${String(next).padStart(8, '0')}`;
}