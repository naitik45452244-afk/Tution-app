import React, { useState } from 'react';
import { Student, FeeRecord, CentreProfile } from '../../types';
import { X, Check, CreditCard, Banknote, Landmark } from 'lucide-react';

interface CollectFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  fee: FeeRecord;
  centre: CentreProfile;
  onSavePayment: (updatedFee: FeeRecord) => void;
}

export const CollectFeeModal: React.FC<CollectFeeModalProps> = ({
  isOpen,
  onClose,
  student,
  fee,
  centre,
  onSavePayment,
}) => {
  if (!isOpen) return null;

  const remaining = fee.amountDue - fee.amountPaid;
  const [amount, setAmount] = useState<number>(remaining > 0 ? remaining : fee.amountDue);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [transactionRef, setTransactionRef] = useState(`UPI/${Date.now().toString().slice(-8)}`);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPaidTotal = fee.amountPaid + Number(amount);
    const newStatus =
      newPaidTotal >= fee.amountDue
        ? 'paid'
        : newPaidTotal > 0
        ? 'partial'
        : 'pending';

    const updated: FeeRecord = {
      ...fee,
      amountPaid: newPaidTotal,
      status: newStatus,
      paidDate,
      paymentMode,
      transactionRef: paymentMode === 'Cash' ? 'CASH-COUNTER' : transactionRef,
      receiptNumber: fee.receiptNumber || `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: notes ? `${fee.notes ? fee.notes + ' · ' : ''}${notes}` : fee.notes,
    };

    onSavePayment(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Record Fee Payment</h3>
            <p className="text-xs text-slate-500">{student.name} · {fee.month}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block">Total Due Amount</span>
              <span className="font-semibold text-slate-800 tabular-nums">₹{fee.amountDue}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Current Balance</span>
              <span className="font-bold text-rose-600 tabular-nums">₹{remaining}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Amount Received (₹) *
            </label>
            <input
              type="number"
              required
              min={1}
              max={fee.amountDue * 2}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-base font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Method *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('UPI')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMode === 'UPI'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('Cash')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMode === 'Cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('Bank Transfer')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMode === 'Bank Transfer'
                    ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Bank / NEFT</span>
              </button>
            </div>
          </div>

          {paymentMode !== 'Cash' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Transaction / UTR Reference
              </label>
              <input
                type="text"
                placeholder="e.g. UPI/628819208311"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid in full via GPay by Father"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Generate Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
