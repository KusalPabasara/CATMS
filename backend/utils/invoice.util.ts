import { Op } from 'sequelize';
import Invoice from '../models/invoice.model';

/**
 * Generate a unique invoice number based on current date and sequence
 * Format: INV-YYYYMMDD-XXXX (e.g., INV-20250917-0001)
 */
export const generateInvoiceNumber = async (): Promise<string> => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get today's invoices count
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const todayInvoices = await Invoice.count({
    where: {
      created_at: {
        [Op.between]: [startOfDay, endOfDay]
      }
    }
  });

  // Generate sequence number
  const sequence = String(todayInvoices + 1).padStart(4, '0');
  
  return `INV-${dateStr}-${sequence}`;
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Calculate due date (default 30 days from now)
 */
export const calculateDueDate = (days: number = 30): Date => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
};

/**
 * Format invoice items for display
 */
export const formatInvoiceItems = (items: any[]): string => {
  return items
    .map(item => `${item.description} (${item.quantity} x ${formatCurrency(item.unit_price)})`)
    .join('\\n');
};