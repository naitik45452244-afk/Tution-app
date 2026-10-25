/**
 * TuitionDesk - Mobile-First Tuition Centre Management & Parent Portal
 * Built for Indian coaching classes (CBSE / ICSE / JEE / NEET)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  FeeRecord,
  AttendanceRecord,
  TestRecord,
  TestMark,
  HomeworkItem,
  Referral,
  CentreProfile,
  SupabaseConfig,
} from './types';
import {
  getStudents,
  saveStudent,
  deleteStudent,
  getFees,
  saveFee,
  getAttendance,
  saveAttendanceRecord,
  bulkSaveAttendance,
  getTests,
  saveTest,
  getTestMarks,
  saveTestMarks,
  getHomework,
  getReferrals,
  saveReferral,
  getCentreProfile,
  saveCentreProfile,
  getSupabaseConfig,
} from './services/storage';

import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { FeesTab } from './components/tabs/FeesTab';
import { AttendanceTab } from './components/tabs/AttendanceTab';
import { TestsTab } from './components/tabs/TestsTab';
import { ParentTab } from './components/tabs/ParentTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { StudentModal } from './components/modals/StudentModal';
import { SupabaseSetupModal } from './components/modals/SupabaseSetupModal';

export default function App() {
  // Central Data State
  const [students, setStudents] = useState<Student[]>(() => getStudents());
  const [fees, setFees] = useState<FeeRecord[]>(() => getFees());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getAttendance());
  const [tests, setTests] = useState<TestRecord[]>(() => getTests());
  const [testMarks, setTestMarks] = useState<TestMark[]>(() => getTestMarks());
  const [homework, setHomework] = useState<HomeworkItem[]>(() => getHomework());
  const [referrals, setReferrals] = useState<Referral[]>(() => getReferrals());
  const [centre, setCentre] = useState<CentreProfile>(() => getCentreProfile());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getSupabaseConfig());

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<TabType>('fees');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Distinct batches
  const batches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.batch) set.add(s.batch);
    });
    return Array.from(set);
  }, [students]);

  // Pending fees counter for badge
  const pendingFeeCount = useMemo(() => {
    return fees.filter((f) => f.status === 'overdue' || f.status === 'pending').length;
  }, [fees]);

  // Update Handlers
  const handleUpdateFee = (updatedFee: FeeRecord) => {
    const updated = saveFee(updatedFee);
    setFees([...updated]);
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    const updated = saveAttendanceRecord(record);
    setAttendance([...updated]);
  };

  const handleBulkUpdateAttendance = (records: AttendanceRecord[]) => {
    const updated = bulkSaveAttendance(records);
    setAttendance([...updated]);
  };

  const handleSaveTest = (test: TestRecord) => {
    const updated = saveTest(test);
    setTests([...updated]);
  };

  const handleSaveMarks = (marks: TestMark[]) => {
    const updated = saveTestMarks(marks);
    setTestMarks([...updated]);
  };

  const handleSaveStudent = (student: Student) => {
    const updated = saveStudent(student);
    setStudents([...updated]);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = deleteStudent(id);
    setStudents([...updated]);
  };

  const handleSaveReferral = (referral: Referral) => {
    const updated = saveReferral(referral);
    setReferrals([...updated]);
  };

  const handleSaveCentreProfile = (profile: CentreProfile) => {
    const updated = saveCentreProfile(profile);
    setCentre({ ...updated });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        centre={centre}
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAddStudentModal={() => setIsAddStudentOpen(true)}
        selectedBatch={selectedBatch}
        onBatchChange={setSelectedBatch}
        batches={batches}
      />

      {/* Desktop Tab Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingFeeCount={pendingFeeCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:px-6">
        {activeTab === 'fees' && (
          <FeesTab
            students={students}
            fees={fees}
            centre={centre}
            selectedBatch={selectedBatch}
            onUpdateFee={handleUpdateFee}
            onAddFeeRecord={handleUpdateFee}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTab
            students={students}
            attendance={attendance}
            centre={centre}
            selectedBatch={selectedBatch}
            onUpdateAttendance={handleUpdateAttendance}
            onBulkUpdateAttendance={handleBulkUpdateAttendance}
          />
        )}

        {activeTab === 'tests' && (
          <TestsTab
            students={students}
            tests={tests}
            testMarks={testMarks}
            centre={centre}
            selectedBatch={selectedBatch}
            onSaveTest={handleSaveTest}
            onSaveMarks={handleSaveMarks}
          />
        )}

        {activeTab === 'parent' && (
          <ParentTab
            students={students}
            fees={fees}
            attendance={attendance}
            tests={tests}
            testMarks={testMarks}
            homework={homework}
            centre={centre}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab
            students={students}
            fees={fees}
            attendance={attendance}
            referrals={referrals}
            centre={centre}
            batches={batches}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onSaveReferral={handleSaveReferral}
            onSaveCentreProfile={handleSaveCentreProfile}
          />
        )}
      </main>

      {/* Global Quick Add Student Modal */}
      {isAddStudentOpen && (
        <StudentModal
          isOpen={true}
          student={null}
          onClose={() => setIsAddStudentOpen(false)}
          batches={batches}
          onSave={handleSaveStudent}
        />
      )}

      {/* Supabase Connection & SQL Setup Drawer */}
      {isSupabaseModalOpen && (
        <SupabaseSetupModal
          isOpen={true}
          onClose={() => setIsSupabaseModalOpen(false)}
          config={supabaseConfig}
          onConfigUpdated={setSupabaseConfig}
        />
      )}
    </div>
  );
}
