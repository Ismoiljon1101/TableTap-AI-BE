import { Injectable } from '@nestjs/common';
import { OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class PrinterService {
  /**
   * Simulates printing an order ticket.
   * In a real implementation, this would connect to an ESC/POS printer via TCP/IP.
   */
  async printOrder(order: OrderDocument) {
    // Simulate network latency
    // await new Promise(resolve => setTimeout(resolve, 100));

    const receipt = this.generateReceiptText(order);

    console.log('\n\n' + '='.repeat(40));
    console.log('🖨️  KITCHEN PRINTER (SIMULATION)  🖨️');
    console.log('='.repeat(40));
    console.log(receipt);
    console.log('='.repeat(40));
    console.log('      (Paper Cut) ✂️\n\n');

    return { success: true, message: 'Printed to console' };
  }

  private generateReceiptText(order: OrderDocument): string {
    const width = 32; // Standard thermal paper width approx
    let buffer = '';

    // Helper for centering
    const center = (text: string) => {
      const pad = Math.max(0, Math.floor((width - text.length) / 2));
      return ' '.repeat(pad) + text + '\n';
    };

    // Helper for "Item ... Price"
    const row = (left: string, right: string) => {
      const space = width - left.length - right.length;
      return left + ' '.repeat(Math.max(1, space)) + right + '\n';
    };

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString();
    };

    // --- HEADER ---
    buffer += center('WAITER AI POS');
    buffer += center('** KITCHEN TICKET **');
    buffer += '\n';
    buffer += `Order #: ${order.orderNumber}\n`;
    // Handle populated fields safely
    const tableName =
      (order.tableId as any)?.name || (order.tableId as any) || 'Unknown';
    const waiterName = (order.waiterId as any)?.nickname || 'Unknown';

    buffer += `Table:   ${tableName}\n`;
    buffer += `Waiter:  ${waiterName}\n`;
    buffer += `Date:    ${formatDate(order.createdAt)}\n`;
    buffer += '-'.repeat(width) + '\n';

    // --- ITEMS ---
    order.items.forEach((item) => {
      let statusTag = '(UPD)';
      if (item.status === 'deleted') statusTag = '(DEL)';
      else if ((item as any).isAdditional) statusTag = '(NEW)';

      const qtyName = `${item.quantity}x ${item.name} ${statusTag}`;
      const price = (item.unitPrice * item.quantity).toFixed(2);
      buffer += row(qtyName, price);

      // Modifiers
      if (item.modifiers && item.modifiers.length > 0) {
        item.modifiers.forEach((mod) => {
          buffer += `   + ${mod.name}\n`;
        });
      }
    });

    buffer += '-'.repeat(width) + '\n';

    // --- TOTAL ---
    buffer += row('Subtotal:', order.subtotal.toFixed(2));
    buffer += row('Total:', order.total.toFixed(2));

    return buffer;
  }

  /**
   * ---------------------------------------------------------
   * REAL PRINTER IMPLEMENTATION (Reference)
   * This is how the "Conversion" works using the 'escpos' library.
   * ---------------------------------------------------------
   */
  /*
    async printToPhysicalPrinter(order: OrderDocument) {
        const escpos = require('escpos');
        escpos.Network = require('escpos-network');

        // 1. Connect to Printer IP (e.g. Kitchen Printer)
        const device = new escpos.Network('192.168.0.200', 9100);
        const printer = new escpos.Printer(device);

        device.open((error) => {
            if (error) {
                console.error('Printer Connection Error:', error);
                return;
            }

            // 2. The "Language Conversion" happens here!
            // The library converts these method calls into Hex Bytes (0x1B, etc.)
            printer
                .font('a')
                .align('ct') // Align Center
                .style('bu') // Bold Underline
                .size(1, 1)
                .text('WAITER AI POS')
                .text('KITCHEN TICKET')
                .style('d')  // Default style
                .text(`Order #${order.orderNumber}`)
                .text('--------------------------------');

            // 3. Loop items
            order.items.forEach(item => {
                printer
                    .align('lt') // Left Align
                    .text(`${item.quantity}x ${item.name}    $${item.unitPrice}`)
            });

            printer
                .text('--------------------------------')
                .align('rt') // Right Align
                .text(`TOTAL: $${order.total}`)
                .cut()     // Send Cut Command (0x1D 0x56...)
                .close();  // Close Connection
        });
    }
    */
}
