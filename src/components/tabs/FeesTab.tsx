import React, { useState } from 'react';
import { Student, FeeRecord, CentreProfile } from '../../types';
import {
  IndianRupee,
  Send,
  Receipt,
  QrCode,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { buildFeeReminderMessage, openWhatsApp } from '../../services/whatsapp';
import { CollectFeeModal } from '../modals/CollectFeeModal';
import { ReceiptModal } from '../modals/ReceiptModal';
import { UpiQrCode } from '../common/UpiQrCode';

interface FeesTabProps {
  students: Student[];
  fees: FeeRecord[];
  centre: CentreProfile;
  selectedBatch: string;
  onUpdateFee: (updatedFee: FeeRecord) => void;
  onAddFeeRecord: (newFee: FeeRecord) => void;
}

export const FeesTab: React.FC<FeesTabProps> = ({
  students,
  fees,
  centre,
  selectedBatch,
  onUpdateFee,
  onAddFeeRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  // Modals state
  const [activeCollectFee, setActiveCollectFee] = useState<{
    student: Student;
    fee: FeeRecord;
  } | null>(null);

  const [activeReceipt, setActiveReceipt] = useState<{
    student: Student;
    fee: FeeRecord;
  } | null>(null);

  const [activeUpiModal, setActiveUpiModal] = useState<{
    student: Student;
    amount: number;
    month: string;
  } | null>(null);

  // Filter students by batch
  const batchStudents = students.filter(
    (s) => selectedBatch === 'All' || s.batch === selectedBatch
  );

  // Match fees for current selected month
  const feeItems = batchStudents.map((student) => {
    let fee = fees.find((f) => f.studentId === student.id && f.month === selectedMonth);
    if (!fee) {
      // Auto-construct current month placeholder if not exists
      fee = {
        id: `fee_${student.id}_${selectedMonth.replace(/\s+/g, '_')}`,
        studentId: student.id,
        month: selectedMonth,
        amountDue: student.monthlyFee,
        amountPaid: 0,
        status: 'pending',
        dueDate: `2026-10-${String(student.feeDueDay || 5).padStart(2, '0')}`,
      };
    }
    return { student, fee };
  });

  // Calculate metrics
  const totalBilled = feeItems.reduce((acc, item) => acc + item.fee.amountDue, 0);
  const totalCollected = feeItems.reduce((acc, item) => acc + item.fee.amountPaid, 0);
  const totalPending = totalBilled - totalCollected;
  const overdueCount = feeItems.filter((i) => i.fee.status === 'overdue').length;

  // Search & Status filtering
  const filteredItems = feeItems.filter(({ student, fee }) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return fee.status === 'paid';
    if (statusFilter === 'pending') return fee.status === 'pending' || fee.status === 'partial';
    if (statusFilter === 'overdue') return fee.status === 'overdue';
    return true;
  });

  const handleSendReminder = (student: Student, fee: FeeRecord, tone: 'polite' | 'urgent') => {
    const message = buildFeeReminderMessage(student, fee, centre, tone);
    openWhatsApp(student.parentPhone, message);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Collected</span>
            <span className="p-1 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums">
            ₹{totalCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {feeItems.filter((i) => i.fee.status === 'paid').length} Paid in Full
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
            <span className="p-1 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-700 tabular-nums">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {feeItems.filter((i) => i.fee.status !== 'paid').length} Students Pending
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Overdue</span>
            <span className="p-1 bg-rose-50 text-rose-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-rose-700 tabular-nums">
            {overdueCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Passed due date</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Billed</span>
            <span className="p-1 bg-slate-100 text-slate-700 rounded-lg">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            ₹{totalBilled.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">For {selectedMonth}</p>
        </div>
      </div>

      {/* Control bar: Month Selector, Search & Status Filters */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Month selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold bg-slate-100 border-0 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-slate-900 text-slate-900 cursor-pointer"
            >
              <option value="October 2026">October 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="November 2026">November 2026</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, roll, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Students ({feeItems.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending / Partial
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              statusFilter === 'overdue'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              statusFilter === 'paid'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Paid ({feeItems.filter((i) => i.fee.status === 'paid').length})
          </button>
        </div>
      </div>

      {/* Student Fees Feed / Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
            <p className="text-sm font-medium">No fee records found for this filter.</p>
          </div>
        ) : (
          filteredItems.map(({ student, fee }) => {
            const balance = fee.amountDue - fee.amountPaid;
            const isPaid = fee.status === 'paid';
            const isOverdue = fee.status === 'overdue';
            const isPartial = fee.status === 'partial';

            return (
              <div
                key={fee.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Student Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{student.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : isPartial
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isPaid
                          ? 'PAID'
                          : isOverdue
                          ? 'OVERDUE'
                          : isPartial
                          ? `PARTIAL (₹${fee.amountPaid})`
                          : 'PENDING'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {student.rollNo} · {student.classGrade} · Parent: {student.parentName} (
                      {student.parentPhone})
                    </p>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Due: {fee.dueDate} {fee.notes ? `· ${fee.notes}` : ''}
                    </p>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Fee Amount
                    </span>
                    <p className="text-base font-bold text-slate-900 tabular-nums">
                      ₹{fee.amountDue.toLocaleString('en-IN')}
                    </p>
                    {balance > 0 ? (
                      <p className="text-[11px] font-semibold text-rose-600 tabular-nums">
                        Balance: ₹{balance.toLocaleString('en-IN')}
                      </p>
                    ) : (
                      <p className="text-[11px] font-semibold text-emerald-600">All Cleared</p>
                    )}
                  </div>

                  {/* Actions Group */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Show UPI QR for counter payment */}
                    {balance > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveUpiModal({
                            student,
                            amount: balance,
                            month: fee.month,
                          })
                        }
                        className="p-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Display Instant UPI QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}

                    {/* WhatsApp Reminder (Instant) */}
                    {balance > 0 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(student, fee, 'polite')}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all flex items-center gap-1 active:scale-95"
                          title="Send Friendly WhatsApp Reminder"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>

                        {isOverdue && (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(student, fee, 'urgent')}
                            className="p-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all"
                            title="Send Urgent Overdue Notice"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Collect Fee Button */}
                    {balance > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveCollectFee({ student, fee })}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>Collect</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveReceipt({ student, fee })}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-600" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Collect Fee Modal */}
      {activeCollectFee && (
        <CollectFeeModal
          isOpen={true}
          onClose={() => setActiveCollectFee(null)}
          student={activeCollectFee.student}
          fee={activeCollectFee.fee}
          centre={centre}
          onSavePayment={(updated) => {
            onUpdateFee(updated);
            // Optionally open receipt immediately
            setActiveReceipt({ student: activeCollectFee.student, fee: updated });
          }}
        />
      )}

      {/* Digital Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          isOpen={true}
          onClose={() => setActiveReceipt(null)}
          student={activeReceipt.student}
          fee={activeReceipt.fee}
          centre={centre}
        />
      )}

      {/* Standalone Counter UPI QR Modal */}
      {activeUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveUpiModal(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800"
            >
              ✕
            </button>
            <UpiQrCode
              upiId={centre.upiId}
              name={centre.upiName}
              amount={activeUpiModal.amount}
              studentName={activeUpiModal.student.name}
              month={activeUpiModal.month}
              size={220}
            />
          </div>
        </div>
      )}
    </div>
  );
};
