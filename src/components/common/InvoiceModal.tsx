import React, { useState } from 'react';
import { Invoice } from '../../types.ts';
import { api } from '../../services/api.ts';
import { X, Printer, CheckCircle2, ShieldCheck, Download, CreditCard } from 'lucide-react';

interface InvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose, onPaymentSuccess }) => {
  const [isPaying, setIsPaying] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(invoice);

  const handlePayNow = async () => {
    try {
      setIsPaying(true);
      const res = await api.payInvoice(currentInvoice.id, 'UPI / Instant Online');
      if (res.success) {
        setCurrentInvoice(res.invoice);
        if (onPaymentSuccess) onPaymentSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setIsPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div
        id="invoice-modal-card"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:bg-white print:text-black print:border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-lg">
              ❄️
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">TAX INVOICE</h2>
              <p className="text-xs text-slate-400">Smart AC Service Management Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1.5"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6 md:p-8 space-y-6 text-slate-800 text-sm">
          {/* Top Info Grid */}
          <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Billed To</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{currentInvoice.customer_name}</h3>
              <p className="text-slate-600 text-xs mt-0.5">{currentInvoice.customer_phone}</p>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">{currentInvoice.address}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Invoice Details</span>
              <p className="text-base font-bold text-sky-700 mt-1 font-mono">{currentInvoice.invoice_number}</p>
              <p className="text-xs text-slate-500 mt-0.5">Date: {currentInvoice.service_date}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {currentInvoice.payment_status === 'PAID' ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
                    PAYMENT DUE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AC & Technician Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Appliance Serviced</span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">
                {currentInvoice.ac_brand_name} – {currentInvoice.ac_model_name}
              </p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Technician Certified</span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                {currentInvoice.technician_name}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {currentInvoice.service_name}
                    <span className="block text-[11px] text-slate-500 font-normal">Primary technician labor & diagnostics</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    ₹{currentInvoice.base_service_charge.toFixed(2)}
                  </td>
                </tr>

                {currentInvoice.parts_details && currentInvoice.parts_details.length > 0 ? (
                  currentInvoice.parts_details.map((part, idx) => (
                    <tr key={idx} className="bg-slate-50/50">
                      <td className="px-4 py-2 text-slate-700 pl-6">
                        + Part: {part.name}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-700">
                        ₹{Number(part.cost).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : null}

                {currentInvoice.additional_charges > 0 && (
                  <tr>
                    <td className="px-4 py-2.5 text-slate-700">Additional consumables / gas top-up</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">
                      ₹{currentInvoice.additional_charges.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-800">
                  ₹{(currentInvoice.base_service_charge + currentInvoice.parts_charges + currentInvoice.additional_charges).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax ({currentInvoice.tax_percent}%):</span>
                <span className="font-medium text-slate-800">₹{currentInvoice.tax_amount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Total Due:</span>
                <span className="text-sky-700">₹{currentInvoice.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg text-slate-600 text-xs text-center">
            <p className="font-semibold text-sky-900">30-Day Service Guarantee Included</p>
            <p className="text-[11px] text-sky-700 mt-0.5">
              All repairs and genuine spare parts carry our standard 30-day SmartAC warranty.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            {currentInvoice.payment_status === 'PENDING' && (
              <button
                onClick={handlePayNow}
                disabled={isPaying}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
              >
                <CreditCard className="w-4 h-4" />
                {isPaying ? 'Processing...' : 'Pay with UPI / Card (₹' + currentInvoice.total_amount + ')'}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" /> Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
