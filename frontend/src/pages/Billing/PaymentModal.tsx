import { useState } from 'react';
import axios from 'axios';
import type { Invoice, PaymentForm } from './types';
import { formatLKR } from '../../utils/currency';

interface Props {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ invoice, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState<PaymentForm>({
    invoice_id: invoice.invoice_id,
    amount: invoice.total_amount - invoice.paid_amount,
    method: 'Cash',
    transaction_id: ''
  });

  const remainingAmount = invoice.total_amount - invoice.paid_amount;
  const isPartialPayment = form.amount < remainingAmount;

  const handleInputChange = (field: keyof PaymentForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (form.amount <= 0) {
      setError('Payment amount must be greater than 0');
      return false;
    }
    if (form.amount > remainingAmount) {
      setError('Payment amount cannot exceed remaining balance');
      return false;
    }
    if (form.method === 'Card' || form.method === 'Bank Transfer') {
      if (!form.transaction_id?.trim()) {
        setError('Transaction ID is required for card and bank transfer payments');
        return false;
      }
    }
    return true;
  };

  const handlePay = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const paymentData = {
        ...form,
        amount: parseFloat(form.amount.toString()),
        payment_date: new Date().toISOString()
      };

      await axios.post('/api/payments', paymentData);
      
      // Update invoice status if fully paid
      if (form.amount === remainingAmount) {
        await axios.put(`/api/invoices/${invoice.invoice_id}`, {
          status: 'Paid',
          paid_amount: invoice.total_amount
        });
      } else {
        // Update paid amount for partial payment
        await axios.put(`/api/invoices/${invoice.invoice_id}`, {
          status: 'Partially Paid',
          paid_amount: invoice.paid_amount + form.amount
        });
      }

      onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Payment failed. Please try again.';
      setError(errorMessage);
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatLKR(amount);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Invoice #:</span>
              <span className="text-sm font-medium">{invoice.invoice_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Patient:</span>
              <span className="text-sm font-medium">{invoice.patient?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="text-sm font-medium">{formatCurrency(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Paid Amount:</span>
              <span className="text-sm font-medium">{formatCurrency(invoice.paid_amount)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-gray-900">Remaining:</span>
              <span className="text-sm font-bold text-red-600">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Payment Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount *
            </label>
            <input
              type="number"
              id="amount"
              required
              value={form.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              min={0.01}
              max={remainingAmount}
              step={0.01}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter payment amount"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {formatCurrency(remainingAmount)}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              id="method"
              required
              value={form.method}
              onChange={(e) => handleInputChange('method', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Wallet">Mobile Wallet</option>
            </select>
          </div>

          {/* Transaction ID (for card/bank transfer) */}
          {(form.method === 'Card' || form.method === 'Bank Transfer') && (
            <div>
              <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID *
              </label>
              <input
                type="text"
                id="transaction_id"
                required
                value={form.transaction_id}
                onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter transaction ID"
              />
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium">Payment Summary:</p>
              <p>Amount: {formatCurrency(form.amount)}</p>
              {isPartialPayment && (
                <p className="text-blue-600">
                  This will be a partial payment. Remaining: {formatCurrency(remainingAmount - form.amount)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Process Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
