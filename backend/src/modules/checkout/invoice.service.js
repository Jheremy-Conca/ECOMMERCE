// src/modules/checkout/invoice.service.js
import prisma from '../../config/db.js';
import { generateInvoiceNumber } from '../../utils/generateInvoiceNumber.js';
import { generateInvoicePdf } from '../../utils/generateInvoicePdf.js';
import { uploadRawToCloudinary } from '../../utils/uploadToCloudinary.js';

// Genera la boleta de un pedido ya pagado y guarda invoiceNumber/invoiceUrl en el Order.
// Idempotente: si el pedido ya tiene invoiceNumber, no regenera.
export const generateInvoiceForOrder = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: true,
      address: true,
      payment: true,
    },
  });

  if (!order) throw new Error('Pedido no encontrado');
  if (order.invoiceUrl) return order; // ya tiene boleta generada

  const invoiceNumber = await generateInvoiceNumber();
  const pdfBytes = await generateInvoicePdf({ ...order, invoiceNumber });
  const invoiceUrl = await uploadRawToCloudinary(Buffer.from(pdfBytes), 'invoices', invoiceNumber);

  return prisma.order.update({
    where: { id: orderId },
    data: { invoiceNumber, invoiceUrl },
  });
};