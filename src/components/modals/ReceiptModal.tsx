import React from 'react';
import { Student, FeeRecord, CentreProfile } from '../../types';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';
import { openWhatsApp } from '../../services/whatsapp';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  fee: FeeRecord;
  centre: CentreProfile;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  student,
  fee,
  centre,
}) => {
  if (!isOpen) return null;

  const receiptNo = fee.receiptNumber || `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateFormatted = fee.paidDate || new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🧾 *Official Fee Receipt - ${centre.name}*

Receipt No: *${receiptNo}*
Date: ${dateFormatted}
Student: *${student.name}* (Roll: ${student.rollNo})
Class: ${student.classGrade}
Month: *${fee.month}*

💰 Amount Received: *₹${fee.amountPaid.toLocaleString('en-IN')}*
Payment Mode: ${fee.paymentMode || 'UPI'}
Ref ID: ${fee.transactionRef || 'N/A'}

Thank you for your timely payment!

*${centre.name}*
📞 ${centre.phone}`;

    openWhatsApp(student.parentPhone, text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-4 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Actions bar (hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 print:hidden">
          <span className="text-xs font-semibold text-slate-700">Digital Fee Receipt</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Print</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 text-xs"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 space-y-5 bg-white text-slate-900">
          {/* Centre Brand Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">{centre.name}</h1>
            <p className="text-[11px] text-slate-500">{centre.tagline}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{centre.address}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Phone: {centre.phone}</p>
          </div>

          {/* Receipt Status Badge */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Receipt No</span>
              <span className="font-mono font-bold text-slate-800">{receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Date</span>
              <span className="font-semibold text-slate-800">{dateFormatted}</span>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-slate-900">{student.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Roll No / Class:</span>
              <span className="text-slate-800 font-medium">
                {student.rollNo} · {student.classGrade}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Parent / Guardian:</span>
              <span className="text-slate-800">{student.parentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Batch:</span>
              <span className="text-slate-800 truncate max-w-[200px]">{student.batch}</span>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono uppercase pb-1 border-b border-slate-200">
              <span>Description</span>
              <span>Amount</span>
            </div>

            <div className="flex justify-between text-xs py-1">
              <div>
                <p className="font-medium text-slate-800">Monthly Tuition Fee</p>
                <p className="text-[11px] text-slate-500">For {fee.month}</p>
              </div>
              <span className="font-semibold text-slate-900 tabular-nums">
                ₹{fee.amountDue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-900">Total Received:</span>
              <span className="text-lg font-bold text-emerald-700 tabular-nums">
                ₹{fee.amountPaid.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Mode details */}
          <div className="text-[11px] text-slate-600 bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Paid via {fee.paymentMode || 'UPI'}</span>
            </div>
            {fee.transactionRef && (
              <span className="font-mono text-slate-500 text-[10px]">{fee.transactionRef}</span>
            )}
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
            <div>
              <p className="text-[10px] text-slate-400">Payment Verified</p>
              <p className="font-mono text-[9px] text-slate-400">Computer Generated Receipt</p>
            </div>
            <div className="text-right">
              <div className="w-24 border-b border-slate-300 mb-1"></div>
              <span className="text-[10px] font-medium text-slate-700">Authorised Signatory</span>
              <p className="text-[9px] text-slate-400">{centre.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
