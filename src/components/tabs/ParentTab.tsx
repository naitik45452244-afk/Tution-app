import React, { useState } from 'react';
import {
  Student,
  FeeRecord,
  AttendanceRecord,
  TestRecord,
  TestMark,
  HomeworkItem,
  CentreProfile,
} from '../../types';
import {
  CalendarCheck,
  BookOpen,
  Award,
  IndianRupee,
  ExternalLink,
  Shield,
  Phone,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  AlertCircle,
} from 'lucide-react';
import { UpiQrCode } from '../common/UpiQrCode';
import { openWhatsApp } from '../../services/whatsapp';

interface ParentTabProps {
  students: Student[];
  fees: FeeRecord[];
  attendance: AttendanceRecord[];
  tests: TestRecord[];
  testMarks: TestMark[];
  homework: HomeworkItem[];
  centre: CentreProfile;
}

export const ParentTab: React.FC<ParentTabProps> = ({
  students,
  fees,
  attendance,
  tests,
  testMarks,
  homework,
  centre,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [subTab, setSubTab] = useState<'overview' | 'attendance' | 'tests' | 'homework' | 'payment'>('overview');

  const student = students.find((s) => s.id === selectedStudentId) || students[0];

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">No students available.</p>
      </div>
    );
  }

  // Filter child data
  const childFees = fees.filter((f) => f.studentId === student.id);
  const pendingFees = childFees.filter((f) => f.status !== 'paid');
  const totalPendingAmount = pendingFees.reduce(
    (acc, f) => acc + (f.amountDue - f.amountPaid),
    0
  );

  const childAttendance = attendance.filter((a) => a.studentId === student.id);
  const presentDays = childAttendance.filter((a) => a.status === 'present').length;
  const attendanceRate =
    childAttendance.length > 0
      ? Math.round((presentDays / childAttendance.length) * 100)
      : 100;

  const childMarks = testMarks
    .filter((m) => m.studentId === student.id)
    .map((m) => {
      const test = tests.find((t) => t.id === m.testId);
      return { mark: m, test };
    })
    .filter((item): item is { mark: TestMark; test: TestRecord } => item.test !== undefined);

  const childHomework = homework.filter((h) => h.batch === student.batch);

  const handleContactTutor = () => {
    openWhatsApp(
      centre.phone,
      `Hello ${centre.name}, I am ${student.parentName}, parent of ${student.name} (${student.classGrade}). I had a query regarding my ward's classes.`
    );
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Top Banner: Child Switcher & External Parent Portal Link */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Parent Portal Preview
            </span>
          </div>
          <h2 className="text-base font-bold text-white mt-0.5">
            {student.parentName}'s Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Previewing updates visible to parent: {student.parentPhone} (PIN: {student.parentPin || '1234'})
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Child Switcher */}
          <select
            value={student.id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs font-semibold bg-slate-800 text-white border border-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.classGrade})
              </option>
            ))}
          </select>

          {/* Standalone Parent Portal Link */}
          <a
            href="/parent.html"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Standalone App</span>
          </a>
        </div>
      </div>

      {/* Child Profile Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-lg flex items-center justify-center shrink-0 border border-indigo-100">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {student.rollNo}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {student.classGrade} · {student.batch}
            </p>
            {student.notes && (
              <p className="text-[11px] text-slate-400 mt-0.5">Focus: {student.notes}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleContactTutor}
          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp Tutor</span>
        </button>
      </div>

      {/* Internal Sub-navigation for Parent */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setSubTab('overview')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            subTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setSubTab('payment')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
            subTab === 'payment'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Pay Fees {totalPendingAmount > 0 && `(₹${totalPendingAmount})`}</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('attendance')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            subTab === 'attendance'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Attendance ({attendanceRate}%)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('tests')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            subTab === 'tests'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Test Marks ({childMarks.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('homework')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            subTab === 'homework'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Homework ({childHomework.length})
        </button>
      </div>

      {/* SUB-TAB: Overview */}
      {subTab === 'overview' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Attendance
              </span>
              <p className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                {attendanceRate}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {presentDays} / {childAttendance.length} classes attended
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Fee Status
              </span>
              <p
                className={`text-2xl font-bold tabular-nums mt-0.5 ${
                  totalPendingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {totalPendingAmount > 0 ? `₹${totalPendingAmount}` : 'Paid'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {totalPendingAmount > 0 ? 'Pending this month' : 'No dues outstanding'}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Latest Test Rank
              </span>
              <p className="text-2xl font-bold text-indigo-700 tabular-nums mt-0.5">
                {childMarks[0]?.mark.rank ? `#${childMarks[0].mark.rank}` : 'N/A'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {childMarks[0]?.test.title.slice(0, 20) || 'Recent exam'}
              </p>
            </div>
          </div>

          {/* Pending Fee Alert Banner & Instant QR CTA */}
          {totalPendingAmount > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Tuition Fee Pending: ₹{totalPendingAmount.toLocaleString('en-IN')}</span>
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Monthly fee due on 5th. Tap below to pay directly via Google Pay / PhonePe.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSubTab('payment')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Pay via UPI Now</span>
              </button>
            </div>
          )}

          {/* Recent Homework Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Recent Homework & Tasks</span>
              </h3>
              <button
                type="button"
                onClick={() => setSubTab('homework')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View all ({childHomework.length})
              </button>
            </div>

            <div className="space-y-2">
              {childHomework.slice(0, 2).map((hw) => (
                <div key={hw.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{hw.title}</span>
                    <span className="text-[10px] text-rose-600 font-semibold">
                      Due: {hw.dueDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{hw.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: UPI Payment */}
      {subTab === 'payment' && (
        <div className="space-y-4">
          <div className="max-w-md mx-auto">
            <UpiQrCode
              upiId={centre.upiId}
              name={centre.upiName}
              amount={totalPendingAmount > 0 ? totalPendingAmount : student.monthlyFee}
              studentName={student.name}
              month={pendingFees[0]?.month || 'Current Month'}
              size={210}
            />
          </div>

          {/* Past Invoices list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 max-w-lg mx-auto">
            <h3 className="text-xs font-bold text-slate-900">Fee Payment History</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {childFees.map((f) => (
                <div key={f.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{f.month}</span>
                    <p className="text-[11px] text-slate-400">
                      {f.paidDate ? `Paid on ${f.paidDate} via ${f.paymentMode}` : `Due: ${f.dueDate}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 tabular-nums">
                      ₹{f.amountPaid} / ₹{f.amountDue}
                    </span>
                    <span
                      className={`block text-[10px] font-bold ${
                        f.status === 'paid'
                          ? 'text-emerald-600'
                          : f.status === 'overdue'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {f.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: Attendance */}
      {subTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Monthly Attendance Record</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              {attendanceRate}% Present
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {childAttendance.map((rec) => (
              <div key={rec.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{rec.date}</span>
                  {rec.remarks && (
                    <p className="text-[11px] text-slate-400">{rec.remarks}</p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rec.status === 'present'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rec.status === 'absent'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {rec.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: Tests & Report Cards */}
      {subTab === 'tests' && (
        <div className="space-y-3">
          {childMarks.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-500">
              <p className="text-xs">No test marks recorded for {student.name} yet.</p>
            </div>
          ) : (
            childMarks.map(({ mark, test }) => {
              const percentage = Math.round((mark.marksObtained / test.totalMarks) * 100);
              return (
                <div
                  key={mark.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{test.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {test.subject}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Date: {test.date}</p>
                    {mark.feedback && (
                      <p className="text-[11px] text-slate-600 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{mark.feedback}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-right self-end sm:self-auto">
                    <div>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {mark.marksObtained} / {test.totalMarks}
                      </span>
                      <span className="block text-[10px] font-bold text-indigo-700">
                        {percentage}% Score
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs flex items-center justify-center">
                      #{mark.rank || 1}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUB-TAB: Homework */}
      {subTab === 'homework' && (
        <div className="space-y-3">
          {childHomework.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-500">
              <p className="text-xs">No homework assigned currently.</p>
            </div>
          ) : (
            childHomework.map((hw) => (
              <div key={hw.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {hw.subject}
                  </span>
                  <span className="text-xs font-semibold text-rose-600">
                    Due: {hw.dueDate}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{hw.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Assigned: {hw.assignedDate}</span>
                  <span className="text-emerald-600 font-medium capitalize">Status: {hw.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
