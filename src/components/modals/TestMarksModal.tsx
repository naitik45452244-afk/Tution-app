import React, { useState } from 'react';
import { Student, TestRecord, TestMark, CentreProfile } from '../../types';
import { X, Save, Trophy, Send, Award } from 'lucide-react';
import { buildTestReportMessage, openWhatsApp } from '../../services/whatsapp';

interface TestMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: TestRecord;
  students: Student[];
  initialMarks: TestMark[];
  centre: CentreProfile;
  onSaveMarks: (updatedMarks: TestMark[]) => void;
}

export const TestMarksModal: React.FC<TestMarksModalProps> = ({
  isOpen,
  onClose,
  test,
  students,
  initialMarks,
  centre,
  onSaveMarks,
}) => {
  if (!isOpen) return null;

  // Filter students belonging to this batch or all
  const batchStudents = students.filter(
    (s) => s.status === 'active' && (s.batch === test.batch || test.batch === 'All Batches')
  );

  // Map state of marks per student
  const [marksState, setMarksState] = useState<Record<string, { marks: number; feedback: string }>>(() => {
    const map: Record<string, { marks: number; feedback: string }> = {};
    batchStudents.forEach((s) => {
      const existing = initialMarks.find((m) => m.testId === test.id && m.studentId === s.id);
      map[s.id] = {
        marks: existing ? existing.marksObtained : 0,
        feedback: existing?.feedback || 'Good attempt, keep practicing.',
      };
    });
    return map;
  });

  const handleMarkChange = (studentId: string, val: number) => {
    const clamped = Math.max(0, Math.min(test.totalMarks, val));
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: clamped,
      },
    }));
  };

  const handleFeedbackChange = (studentId: string, text: string) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        feedback: text,
      },
    }));
  };

  // Compute calculated ranks
  const computedList = batchStudents.map((s) => {
    const data = marksState[s.id] || { marks: 0, feedback: '' };
    return {
      student: s,
      marks: data.marks,
      feedback: data.feedback,
    };
  });

  computedList.sort((a, b) => b.marks - a.marks);

  const highestScore = computedList.length > 0 ? computedList[0].marks : 0;
  const totalSum = computedList.reduce((acc, curr) => acc + curr.marks, 0);
  const averageScore = computedList.length > 0 ? Math.round(totalSum / computedList.length) : 0;

  const handleSave = () => {
    const updated: TestMark[] = computedList.map((item, idx) => ({
      id: `tm_${test.id}_${item.student.id}`,
      testId: test.id,
      studentId: item.student.id,
      marksObtained: item.marks,
      rank: idx + 1,
      feedback: item.feedback,
    }));

    onSaveMarks(updated);
    onClose();
  };

  const handleSendWhatsApp = (item: (typeof computedList)[0], rank: number) => {
    const mockMark: TestMark = {
      id: `tm_${test.id}_${item.student.id}`,
      testId: test.id,
      studentId: item.student.id,
      marksObtained: item.marks,
      rank,
      feedback: item.feedback,
    };

    const message = buildTestReportMessage(
      item.student,
      test,
      mockMark,
      centre,
      highestScore,
      averageScore
    );
    openWhatsApp(item.student.parentPhone, message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{test.title}</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Max: {test.totalMarks} Marks
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {test.subject} · {test.batch} · Date: {test.date}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50/70 border-b border-slate-100 text-xs shrink-0">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Students</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              {batchStudents.length}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Highest Score</span>
            <span className="font-bold text-emerald-700 text-sm tabular-nums">
              {highestScore} / {test.totalMarks}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Batch Average</span>
            <span className="font-bold text-indigo-700 text-sm tabular-nums">
              {averageScore} / {test.totalMarks}
            </span>
          </div>
        </div>

        {/* List of Students to enter marks */}
        <div className="p-6 overflow-y-auto space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            Edit marks and remarks below. Ranks update automatically in real-time.
          </p>

          <div className="space-y-2">
            {computedList.map((item, index) => {
              const rank = index + 1;
              const percentage = Math.round((item.marks / test.totalMarks) * 100);

              return (
                <div
                  key={item.student.id}
                  className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Rank & Student Info */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        rank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : rank === 2
                          ? 'bg-slate-200 text-slate-700'
                          : rank === 3
                          ? 'bg-amber-50 text-amber-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {rank === 1 ? <Trophy className="w-3.5 h-3.5" /> : rank}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.student.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.student.rollNo} · {item.student.classGrade}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Marks Input */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={test.totalMarks}
                        value={item.marks}
                        onChange={(e) => handleMarkChange(item.student.id, Number(e.target.value))}
                        className="w-16 px-2.5 py-1.5 text-center text-xs font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                      />
                      <span className="text-xs text-slate-400">/ {test.totalMarks}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        percentage >= 80
                          ? 'bg-emerald-50 text-emerald-700'
                          : percentage >= 50
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  {/* Right: Remarks & WhatsApp send */}
                  <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                    <input
                      type="text"
                      placeholder="Remarks / feedback"
                      value={item.feedback}
                      onChange={(e) => handleFeedbackChange(item.student.id, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
                    />

                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(item, rank)}
                      title="Send report card to parent WhatsApp"
                      className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shrink-0 flex items-center gap-1 text-[11px] font-medium"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Saved marks sync to parent app immediately
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save All Marks & Ranks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
