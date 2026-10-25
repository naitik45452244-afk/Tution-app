import React, { useState } from 'react';
import { Student, TestRecord, TestMark, CentreProfile } from '../../types';
import {
  Trophy,
  BarChart3,
  Plus,
  Send,
  Calendar,
  BookOpen,
  Edit,
  Award,
  TrendingUp,
} from 'lucide-react';
import { TestMarksModal } from '../modals/TestMarksModal';
import { buildTestReportMessage, openWhatsApp } from '../../services/whatsapp';

interface TestsTabProps {
  students: Student[];
  tests: TestRecord[];
  testMarks: TestMark[];
  centre: CentreProfile;
  selectedBatch: string;
  onSaveTest: (test: TestRecord) => void;
  onSaveMarks: (marks: TestMark[]) => void;
}

export const TestsTab: React.FC<TestsTabProps> = ({
  students,
  tests,
  testMarks,
  centre,
  selectedBatch,
  onSaveTest,
  onSaveMarks,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>(tests[0]?.id || '');
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);

  // New test form state
  const [newTest, setNewTest] = useState<Partial<TestRecord>>({
    title: '',
    subject: 'Mathematics',
    batch: selectedBatch === 'All' ? 'Class 10 - Evening Batch (5:00 PM)' : selectedBatch,
    date: new Date().toISOString().split('T')[0],
    totalMarks: 50,
    passingMarks: 20,
    topics: '',
  });

  // Filter tests by batch
  const filteredTests = tests.filter(
    (t) => selectedBatch === 'All' || t.batch === selectedBatch
  );

  const activeTest = tests.find((t) => t.id === selectedTestId) || filteredTests[0];

  // Get marks for active test
  const activeMarks = activeTest
    ? testMarks.filter((m) => m.testId === activeTest.id)
    : [];

  // Match with student info
  const studentScores = activeMarks
    .map((mark) => {
      const student = students.find((s) => s.id === mark.studentId);
      return {
        mark,
        student,
      };
    })
    .filter((item): item is { mark: TestMark; student: Student } => item.student !== undefined);

  // Sort by marks obtained desc
  studentScores.sort((a, b) => b.mark.marksObtained - a.mark.marksObtained);

  const totalAttempted = studentScores.length;
  const highestScore = studentScores.length > 0 ? studentScores[0].mark.marksObtained : 0;
  const averageScore =
    totalAttempted > 0
      ? Math.round(
          studentScores.reduce((acc, curr) => acc + curr.mark.marksObtained, 0) /
            totalAttempted
        )
      : 0;

  // Score distribution brackets
  const bracket90 = studentScores.filter(
    (s) => s.mark.marksObtained / (activeTest?.totalMarks || 50) >= 0.9
  ).length;
  const bracket75 = studentScores.filter((s) => {
    const ratio = s.mark.marksObtained / (activeTest?.totalMarks || 50);
    return ratio >= 0.75 && ratio < 0.9;
  }).length;
  const bracket50 = studentScores.filter((s) => {
    const ratio = s.mark.marksObtained / (activeTest?.totalMarks || 50);
    return ratio >= 0.5 && ratio < 0.75;
  }).length;
  const bracketBelow50 = studentScores.filter(
    (s) => s.mark.marksObtained / (activeTest?.totalMarks || 50) < 0.5
  ).length;

  const handleCreateTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTest.title?.trim()) {
      alert('Test Title is required');
      return;
    }

    const testRecord: TestRecord = {
      id: `test_${Date.now()}`,
      title: newTest.title,
      subject: newTest.subject || 'Mathematics',
      batch: newTest.batch || 'Class 10 - Evening Batch (5:00 PM)',
      date: newTest.date || new Date().toISOString().split('T')[0],
      totalMarks: Number(newTest.totalMarks) || 50,
      passingMarks: Number(newTest.passingMarks) || 20,
      topics: newTest.topics || '',
    };

    onSaveTest(testRecord);
    setSelectedTestId(testRecord.id);
    setIsCreateTestOpen(false);
    // Open marks modal immediately so tutor can enter marks right away!
    setIsMarksModalOpen(true);
  };

  const handleSendWhatsApp = (item: (typeof studentScores)[0], rank: number) => {
    if (!activeTest) return;
    const message = buildTestReportMessage(
      item.student,
      activeTest,
      { ...item.mark, rank },
      centre,
      highestScore,
      averageScore
    );
    openWhatsApp(item.student.parentPhone, message);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Test Picker & Create Test Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Test:</span>
          {filteredTests.map((test) => {
            const isSelected = activeTest?.id === test.id;
            return (
              <button
                key={test.id}
                type="button"
                onClick={() => setSelectedTestId(test.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {test.subject}: {test.title.slice(0, 24)}...
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsCreateTestOpen(true)}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all whitespace-nowrap shrink-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Test</span>
        </button>
      </div>

      {activeTest ? (
        <>
          {/* Active Test Overview Banner */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{activeTest.title}</h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {activeTest.subject}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Batch: {activeTest.batch} · Date: {activeTest.date} · Passing Marks:{' '}
                  {activeTest.passingMarks}/{activeTest.totalMarks}
                </p>
                {activeTest.topics && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Topics: {activeTest.topics}
                  </p>
                )}
              </div>

              {/* Edit marks trigger button */}
              <button
                type="button"
                onClick={() => setIsMarksModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all shrink-0"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Enter & Edit Marks / Ranks</span>
              </button>
            </div>
          </div>

          {/* Test Performance Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Top Score
              </span>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums mt-0.5">
                {highestScore} / {activeTest.totalMarks}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Rank #1 in Batch</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Batch Average
              </span>
              <p className="text-xl sm:text-2xl font-bold text-indigo-700 tabular-nums mt-0.5">
                {averageScore} / {activeTest.totalMarks}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {Math.round((averageScore / activeTest.totalMarks) * 100)}% class mean
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Pass Rate
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                {totalAttempted > 0
                  ? Math.round(
                      (studentScores.filter(
                        (s) => s.mark.marksObtained >= activeTest.passingMarks
                      ).length /
                        totalAttempted) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Scored ≥ {activeTest.passingMarks}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Students Evaluated
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                {totalAttempted}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Marks recorded</p>
            </div>
          </div>

          {/* Visual Performance Chart: Score Distribution Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Class Performance Distribution</span>
              </h3>
              <span className="text-[11px] text-slate-400">Total {totalAttempted} students</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Bracket 90%+ */}
              <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[11px] font-bold text-emerald-900">90% - 100%</span>
                  <span className="text-xs font-bold text-emerald-700 tabular-nums">
                    {bracket90}
                  </span>
                </div>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{
                      width: `${totalAttempted > 0 ? (bracket90 / totalAttempted) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bracket 75%-89% */}
              <div className="bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[11px] font-bold text-indigo-900">75% - 89%</span>
                  <span className="text-xs font-bold text-indigo-700 tabular-nums">
                    {bracket75}
                  </span>
                </div>
                <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{
                      width: `${totalAttempted > 0 ? (bracket75 / totalAttempted) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bracket 50%-74% */}
              <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-100">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[11px] font-bold text-amber-900">50% - 74%</span>
                  <span className="text-xs font-bold text-amber-700 tabular-nums">
                    {bracket50}
                  </span>
                </div>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all"
                    style={{
                      width: `${totalAttempted > 0 ? (bracket50 / totalAttempted) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bracket <50% */}
              <div className="bg-rose-50/80 p-2.5 rounded-xl border border-rose-100">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[11px] font-bold text-rose-900">&lt; 50%</span>
                  <span className="text-xs font-bold text-rose-700 tabular-nums">
                    {bracketBelow50}
                  </span>
                </div>
                <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-600 h-full rounded-full transition-all"
                    style={{
                      width: `${totalAttempted > 0 ? (bracketBelow50 / totalAttempted) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Leaderboard / Ranked List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Batch Leaderboard & Marks</h3>
                <p className="text-[11px] text-slate-500">
                  Ranked by score. Send instant WhatsApp performance report to parents.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500 font-mono">
                {studentScores.length} Ranked
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {studentScores.map((item, index) => {
                const rank = index + 1;
                const percentage = Math.round(
                  (item.mark.marksObtained / activeTest.totalMarks) * 100
                );

                return (
                  <div
                    key={item.student.id}
                    className="p-3.5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          rank === 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : rank === 2
                            ? 'bg-slate-200 text-slate-700'
                            : rank === 3
                            ? 'bg-amber-50 text-amber-900'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {rank === 1 ? <Trophy className="w-4 h-4 text-amber-600" /> : rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{item.student.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.student.rollNo}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {item.student.classGrade} · Parent: {item.student.parentPhone}
                        </p>
                        {item.mark.feedback && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5">
                            "{item.mark.feedback}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Score */}
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          {item.mark.marksObtained} / {activeTest.totalMarks}
                        </span>
                        <span
                          className={`block text-[10px] font-bold ${
                            percentage >= 80
                              ? 'text-emerald-700'
                              : percentage >= 50
                              ? 'text-indigo-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>

                      {/* WhatsApp Share Button */}
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(item, rank)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                        title="Send Test Report to Parent WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Send Report</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
          <p className="text-sm font-medium">No tests created for this batch yet.</p>
          <button
            type="button"
            onClick={() => setIsCreateTestOpen(true)}
            className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Create First Test
          </button>
        </div>
      )}

      {/* Marks Entry Modal */}
      {isMarksModalOpen && activeTest && (
        <TestMarksModal
          isOpen={true}
          onClose={() => setIsMarksModalOpen(false)}
          test={activeTest}
          students={students}
          initialMarks={activeMarks}
          centre={centre}
          onSaveMarks={(updated) => {
            onSaveMarks(updated);
          }}
        />
      )}

      {/* Create New Test Dialog */}
      {isCreateTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Create New Class Test</h3>
              <button
                type="button"
                onClick={() => setIsCreateTestOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTestSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4: Quadratic Equations"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newTest.subject}
                    onChange={(e) => setNewTest({ ...newTest, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Batch</label>
                  <select
                    value={newTest.batch}
                    onChange={(e) => setNewTest({ ...newTest, batch: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Class 10 - Evening Batch (5:00 PM)">Class 10 - Evening Batch</option>
                    <option value="Class 12 - Morning Batch (7:00 AM)">Class 12 - Morning Batch</option>
                    <option value="Class 9 - Afternoon Batch (3:30 PM)">Class 9 - Afternoon Batch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    min={10}
                    value={newTest.totalMarks}
                    onChange={(e) => setNewTest({ ...newTest, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={newTest.passingMarks}
                    onChange={(e) => setNewTest({ ...newTest, passingMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newTest.date}
                    onChange={(e) => setNewTest({ ...newTest, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Key Topics Covered</label>
                <input
                  type="text"
                  placeholder="e.g. Formula method, Discriminant, Word problems"
                  value={newTest.topics}
                  onChange={(e) => setNewTest({ ...newTest, topics: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTestOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  Create & Enter Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
