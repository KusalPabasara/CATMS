import { forwardRef } from "react";
import type { Invoice } from "./types";
import { formatLKR } from "../../utils/currency";

interface InvoicePrintProps {
  invoice: Invoice;
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice }, ref) => {
    const formatCurrency = (amount: number) => {
      return formatLKR(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Paid': return 'text-green-600';
        case 'Partially Paid': return 'text-orange-600';
        case 'Pending': return 'text-yellow-600';
        case 'Refunded': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };

    return (
      <div 
        ref={ref} 
        className="p-8 text-black bg-white print:w-full print:shadow-none max-w-[800px] mx-auto font-sans"
      >
        {/* Header */}
        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">🏥 CATMS Clinic</h1>
          <p className="text-lg text-gray-600">Clinic Appointment & Treatment Management System</p>
          <p className="text-sm text-gray-500">Professional Healthcare Services</p>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 print:mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Invoice Details</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Invoice #:</span> {invoice.invoice_id}</p>
              <p><span className="font-medium">Date:</span> {formatDate(invoice.created_at)}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 font-semibold ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </p>
              {invoice.appointment_id && (
                <p><span className="font-medium">Appointment #:</span> {invoice.appointment_id}</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {invoice.patient?.full_name}</p>
              {invoice.patient?.phone && (
                <p><span className="font-medium">Phone:</span> {invoice.patient.phone}</p>
              )}
              {invoice.patient?.email && (
                <p><span className="font-medium">Email:</span> {invoice.patient.email}</p>
              )}
              {invoice.branch && (
                <p><span className="font-medium">Branch:</span> {invoice.branch.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 print:mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-lg">{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount Paid:</span>
                <span className="font-semibold text-green-600">{formatCurrency(invoice.paid_amount)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Balance Due:</span>
                <span className={`font-bold text-lg ${
                  invoice.total_amount > invoice.paid_amount ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(invoice.total_amount - invoice.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Status:</span>
                <span className={`font-semibold ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        {invoice.appointment && (
          <div className="mb-8 print:mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Details</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Appointment Date:</span></p>
                  <p className="text-gray-600">
                    {new Date(invoice.appointment.appointment_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {invoice.appointment.reason && (
                  <div>
                    <p><span className="font-medium">Reason for Visit:</span></p>
                    <p className="text-gray-600">{invoice.appointment.reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 print:mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Payment Instructions</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Payment can be made in cash, card, bank transfer, or mobile wallet</p>
            <p>• For any queries, please contact our billing department</p>
            <p>• Keep this invoice for your records</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Thank you for choosing CATMS Clinic for your healthcare needs
          </p>
          <p className="text-xs text-gray-500">
            This is a computer-generated invoice. No signature required.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Generated on: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;
