import React, { useState } from 'react';
import { Student, AttendanceRecord, CentreProfile, AttendanceStatus } from '../../types';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  History,
} from 'lucide-react';
import { buildAbsentAlertMessage, openWhatsApp } from '../../services/whatsapp';

interface AttendanceTabProps {
  students: Student[];
  attendance: AttendanceRecord[];
  centre: CentreProfile;
  selectedBatch: string;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onBulkUpdateAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  students,
  attendance,
  centre,
  selectedBatch,
  onUpdateAttendance,
  onBulkUpdateAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);

  // Filter students in batch
  const batchStudents = students.filter(
    (s) => s.status === 'active' && (selectedBatch === 'All' || s.batch === selectedBatch)
  );

  // Match attendance records for selected date
  const recordsForDate = batchStudents.map((student) => {
    const existing = attendance.find(
      (a) => a.studentId === student.id && a.date === selectedDate
    );
    return {
      student,
      record: existing || {
        id: `att_${student.id}_${selectedDate}`,
        studentId: student.id,
        date: selectedDate,
        status: 'present' as AttendanceStatus, // default to present for quick roll-call
        batch: student.batch,
        timestamp: new Date().toISOString(),
      },
    };
  });

  // Calculate statistics
  const total = recordsForDate.length;
  const presentCount = recordsForDate.filter((r) => r.record.status === 'present').length;
  const absentCount = recordsForDate.filter((r) => r.record.status === 'absent').length;
  const lateCount = recordsForDate.filter((r) => r.record.status === 'late').length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  // Quick date navigation
  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleStatusChange = (
    student: Student,
    currentRecord: AttendanceRecord,
    newStatus: AttendanceStatus
  ) => {
    const updated: AttendanceRecord = {
      ...currentRecord,
      status: newStatus,
      timestamp: new Date().toISOString(),
    };
    onUpdateAttendance(updated);
  };

  const handleMarkAllPresent = () => {
    const updatedRecords: AttendanceRecord[] = recordsForDate.map(({ student, record }) => ({
      ...record,
      status: 'present',
      timestamp: new Date().toISOString(),
    }));
    onBulkUpdateAttendance(updatedRecords);
  };

  const handleSendAbsentAlert = (student: Student, record: AttendanceRecord) => {
    const message = buildAbsentAlertMessage(student, selectedDate, student.batch, centre);
    openWhatsApp(student.parentPhone, message);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Attendance Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Attendance</span>
            <span className="p-1 bg-emerald-50 text-emerald-700 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            {attendanceRate}%
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Overall rate today</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Present</span>
            <span className="p-1 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums">
            {presentCount} / {total}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">In class</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Absent</span>
            <span className="p-1 bg-rose-50 text-rose-700 rounded-lg">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-rose-700 tabular-nums">
            {absentCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Need parent alert</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Late</span>
            <span className="p-1 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-700 tabular-nums">
            {lateCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Arrived with delay</p>
        </div>
      </div>

      {/* Date Navigator & Action Controls */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Bulk Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* Student Attendance Roll Call List */}
      <div className="space-y-2.5">
        {recordsForDate.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
            <p className="text-sm font-medium">No students enrolled in this batch.</p>
          </div>
        ) : (
          recordsForDate.map(({ student, record }) => {
            const isPresent = record.status === 'present';
            const isAbsent = record.status === 'absent';
            const isLate = record.status === 'late';

            return (
              <div
                key={student.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-800'
                        : isAbsent
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {student.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{student.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {student.rollNo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {student.classGrade} · Parent: {student.parentPhone}
                    </p>
                  </div>
                </div>

                {/* Right controls: Present / Absent / Late segmented buttons + WhatsApp */}
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student, record, 'present')}
                      className={`min-h-[36px] px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                        isPresent
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(student, record, 'absent')}
                      className={`min-h-[36px] px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                        isAbsent
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(student, record, 'late')}
                      className={`min-h-[36px] px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                        isLate
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Late</span>
                    </button>
                  </div>

                  {/* 1-Tap Absent WhatsApp Parent Alert */}
                  {isAbsent && (
                    <button
                      type="button"
                      onClick={() => handleSendAbsentAlert(student, record)}
                      className="px-2.5 py-1.5 min-h-[36px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                      title="Send Absent Alert via WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5 text-rose-600" />
                      <span>Alert Parent</span>
                    </button>
                  )}

                  {/* Monthly History Trigger */}
                  <button
                    type="button"
                    onClick={() => setHistoryStudent(student)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title="View Student Attendance History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Attendance History Drawer/Modal */}
      {historyStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {historyStudent.name}'s Attendance Log
                </h3>
                <p className="text-xs text-slate-500">{historyStudent.classGrade}</p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2">
              {attendance
                .filter((a) => a.studentId === historyStudent.id)
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{log.date}</span>
                      {log.remarks && (
                        <p className="text-[11px] text-slate-500">{log.remarks}</p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'absent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
