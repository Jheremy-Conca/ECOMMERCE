import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Recibe un Order completo (con user, address, items, payment incluidos vía Prisma include)
export async function generateInvoicePdf(order) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const marginX = 50;

  const drawText = (text, x, yPos, size = 10, bold = false) => {
    page.drawText(text, {
      x,
      y: yPos,
      size,
      font: bold ? fontBold : font,
      color: rgb(0, 0, 0),
    });
  };

  // Encabezado
  drawText('Mi Tienda', marginX, y, 18, true);
  drawText(`Boleta N° ${order.invoiceNumber}`, marginX, y - 25, 12, true);
  drawText(`Fecha: ${order.createdAt.toLocaleDateString('es-PE')}`, marginX, y - 42);
  y -= 70;

  // Datos del cliente
  drawText('Cliente:', marginX, y, 11, true);
  y -= 16;
  drawText(order.user.fullName, marginX, y);
  y -= 14;
  drawText(order.user.email, marginX, y);
  y -= 14;
  if (order.address) {
    drawText(`${order.address.street}, ${order.address.city}, ${order.address.country}`, marginX, y);
    y -= 14;
  }
  y -= 20;

  // Tabla de items — encabezado
  drawText('Producto', marginX, y, 10, true);
  drawText('SKU', marginX + 220, y, 10, true);
  drawText('Cant.', marginX + 320, y, 10, true);
  drawText('P. Unit.', marginX + 380, y, 10, true);
  drawText('Subtotal', marginX + 460, y, 10, true);
  y -= 8;
  page.drawLine({
    start: { x: marginX, y },
    end: { x: 545, y },
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  });
  y -= 16;

  for (const item of order.items) {
    const subtotal = Number(item.unitPrice) * item.quantity;
    drawText(item.productName.substring(0, 35), marginX, y, 9);
    drawText(item.productSku, marginX + 220, y, 9);
    drawText(String(item.quantity), marginX + 320, y, 9);
    drawText(`S/ ${Number(item.unitPrice).toFixed(2)}`, marginX + 380, y, 9);
    drawText(`S/ ${subtotal.toFixed(2)}`, marginX + 460, y, 9);
    y -= 18;
  }

  y -= 10;
  page.drawLine({
    start: { x: marginX, y },
    end: { x: 545, y },
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  });
  y -= 24;

  drawText('Total:', marginX + 380, y, 12, true);
  drawText(`S/ ${Number(order.total).toFixed(2)}`, marginX + 460, y, 12, true);
  y -= 24;

  if (order.payment) {
    drawText(`Método de pago: ${order.payment.method}`, marginX, y, 9);
    y -= 14;
    drawText(`Referencia: ${order.payment.reference ?? '-'}`, marginX, y, 9);
  }

  return pdfDoc.save(); // devuelve Uint8Array, listo para envolver en Buffer
}