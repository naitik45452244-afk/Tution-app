import React, { useState } from 'react';
import {
  Student,
  FeeRecord,
  AttendanceRecord,
  Referral,
  CentreProfile,
} from '../../types';
import {
  Users,
  IndianRupee,
  Share2,
  Gift,
  Building2,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Search,
  Phone,
  Save,
  Download,
} from 'lucide-react';
import { StudentModal } from '../modals/StudentModal';

interface DashboardTabProps {
  students: Student[];
  fees: FeeRecord[];
  attendance: AttendanceRecord[];
  referrals: Referral[];
  centre: CentreProfile;
  batches: string[];
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSaveReferral: (referral: Referral) => void;
  onSaveCentreProfile: (profile: CentreProfile) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  students,
  fees,
  attendance,
  referrals,
  centre,
  batches,
  onSaveStudent,
  onDeleteStudent,
  onSaveReferral,
  onSaveCentreProfile,
}) => {
  const [activeSubView, setActiveSubView] = useState<'roster' | 'referrals' | 'settings'>('roster');
  const [searchStudent, setSearchStudent] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // New referral form state
  const [isAddRefOpen, setIsAddRefOpen] = useState(false);
  const [newRef, setNewRef] = useState<Partial<Referral>>({
    referrerStudentId: students[0]?.id || '',
    referredStudentName: '',
    referredStudentPhone: '+91 ',
    rewardAmount: 500,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Centre profile editing state
  const [centreForm, setCentreForm] = useState<CentreProfile>({ ...centre });
  const [isSavedCentre, setIsSavedCentre] = useState(false);

  // Calculations
  const totalBilled = fees.reduce((acc, f) => acc + f.amountDue, 0);
  const totalCollected = fees.reduce((acc, f) => acc + f.amountPaid, 0);
  const totalPending = totalBilled - totalCollected;
  const activeStudentsCount = students.filter((s) => s.status === 'active').length;

  const totalReferralRewards = referrals
    .filter((r) => r.status === 'rewarded')
    .reduce((acc, r) => acc + r.rewardAmount, 0);

  // Filter students for roster
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.parentPhone.includes(searchStudent) ||
      s.batch.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleCentreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCentreProfile(centreForm);
    setIsSavedCentre(true);
    setTimeout(() => setIsSavedCentre(false), 2000);
  };

  const handleAddReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRef.referredStudentName?.trim()) {
      alert('Referred student name required.');
      return;
    }
    const refRecord: Referral = {
      id: `ref_${Date.now()}`,
      referrerStudentId: newRef.referrerStudentId || students[0]?.id || '',
      referredStudentName: newRef.referredStudentName,
      referredStudentPhone: newRef.referredStudentPhone || '',
      rewardAmount: Number(newRef.rewardAmount) || 500,
      status: (newRef.status as any) || 'pending',
      date: newRef.date || new Date().toISOString().split('T')[0],
      notes: newRef.notes,
    };
    onSaveReferral(refRecord);
    setIsAddRefOpen(false);
    setNewRef({
      referrerStudentId: students[0]?.id || '',
      referredStudentName: '',
      referredStudentPhone: '+91 ',
      rewardAmount: 500,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleUpdateReferralStatus = (
    ref: Referral,
    newStatus: 'pending' | 'enrolled' | 'rewarded'
  ) => {
    onSaveReferral({ ...ref, status: newStatus });
  };

  const exportStudentsCsv = () => {
    const headers = [
      'Roll No',
      'Name',
      'Class',
      'Batch',
      'Student Phone',
      'Parent Name',
      'Parent Phone',
      'Monthly Fee',
      'Status',
      'Parent PIN',
    ];
    const rows = students.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.classGrade}"`,
      `"${s.batch}"`,
      `"${s.studentPhone}"`,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`,
      s.monthlyFee,
      s.status,
      s.parentPin || '1234',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Owner KPI Dashboard Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Fees Collected
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums mt-0.5">
            ₹{totalCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Lifetime fee records</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Pending Balance
          </span>
          <p className="text-xl sm:text-2xl font-bold text-rose-700 tabular-nums mt-0.5">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting collection</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Enrolled Students
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
            {activeStudentsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {batches.length} batches</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Referral Rewards Paid
          </span>
          <p className="text-xl sm:text-2xl font-bold text-indigo-700 tabular-nums mt-0.5">
            ₹{totalReferralRewards.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {referrals.filter((r) => r.status === 'rewarded').length} successful student referrals
          </p>
        </div>
      </div>

      {/* Segmented Sub-view Navigator */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubView('roster')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubView === 'roster'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Directory & Editor ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('referrals')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubView === 'referrals'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Referral Program ({referrals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('settings')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubView === 'settings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Centre Profile & UPI ID</span>
        </button>
      </div>

      {/* SUB-VIEW 1: Student Directory & Full Editor */}
      {activeSubView === 'roster' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name, roll, parent phone..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportStudentsCsv}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingStudent(null);
                  setIsStudentModalOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Student Cards List */}
          <div className="space-y-2.5">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {s.rollNo}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {s.classGrade} · {s.batch}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span>Parent: {s.parentName} ({s.parentPhone})</span>
                      <span>·</span>
                      <span className="font-mono text-indigo-600 font-semibold">PIN: {s.parentPin || '1234'}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">Fee: ₹{s.monthlyFee}/mo</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStudent(s);
                      setIsStudentModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove ${s.name}?`)) {
                        onDeleteStudent(s.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Referral Program Manager */}
      {activeSubView === 'referrals' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-500" />
                <span>Student Referral & Word-of-Mouth Tracker</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Reward existing students with fee discounts when they bring new admissions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddRefOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Referral</span>
            </button>
          </div>

          {/* Referral Cards */}
          <div className="space-y-2.5">
            {referrals.map((ref) => {
              const referrer = students.find((s) => s.id === ref.referrerStudentId);

              return (
                <div
                  key={ref.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        {ref.referredStudentName}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          ref.status === 'rewarded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ref.status === 'enrolled'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ref.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Referred by:{' '}
                      <strong className="text-slate-800">{referrer?.name || 'Student'}</strong> (
                      {referrer?.classGrade || ''}) · Phone: {ref.referredStudentPhone}
                    </p>

                    {ref.notes && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{ref.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Reward
                      </span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        ₹{ref.rewardAmount}
                      </span>
                    </div>

                    {/* Quick status update button */}
                    {ref.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateReferralStatus(ref, 'enrolled')}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg"
                      >
                        Mark Enrolled
                      </button>
                    )}

                    {ref.status === 'enrolled' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateReferralStatus(ref, 'rewarded')}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Give Discount</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Centre Profile & UPI Configuration */}
      {activeSubView === 'settings' && (
        <form onSubmit={handleCentreSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tuition Centre Profile & UPI ID</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear on digital receipts, WhatsApp messages, and the UPI payment QR.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Centre Name *</label>
              <input
                type="text"
                required
                value={centreForm.name}
                onChange={(e) => setCentreForm({ ...centreForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={centreForm.tagline}
                onChange={(e) => setCentreForm({ ...centreForm, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                UPI ID (VPA) for Parent Payments *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. yourname@oksbi"
                value={centreForm.upiId}
                onChange={(e) => setCentreForm({ ...centreForm, upiId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-slate-900 text-slate-900 font-semibold"
              />
              <span className="text-[10px] text-slate-400">Used for QR Code and direct UPI pay</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                UPI Payee Account Name *
              </label>
              <input
                type="text"
                required
                value={centreForm.upiName}
                onChange={(e) => setCentreForm({ ...centreForm, upiName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tutor Contact Phone *</label>
              <input
                type="text"
                required
                value={centreForm.phone}
                onChange={(e) => setCentreForm({ ...centreForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={centreForm.email}
                onChange={(e) => setCentreForm({ ...centreForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-medium text-slate-700 mb-1">Premises Address</label>
            <input
              type="text"
              value={centreForm.address}
              onChange={(e) => setCentreForm({ ...centreForm, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Centre Profile</span>
            </button>

            {isSavedCentre && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved successfully!</span>
              </span>
            )}
          </div>
        </form>
      )}

      {/* Student Create / Edit Modal */}
      {isStudentModalOpen && (
        <StudentModal
          isOpen={true}
          student={editingStudent}
          onClose={() => setIsStudentModalOpen(false)}
          batches={batches}
          onSave={(s) => {
            onSaveStudent(s);
          }}
        />
      )}

      {/* Add Referral Modal */}
      {isAddRefOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Record New Student Referral</h3>
              <button
                type="button"
                onClick={() => setIsAddRefOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReferralSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Referrer (Existing Student) *
                </label>
                <select
                  value={newRef.referrerStudentId}
                  onChange={(e) => setNewRef({ ...newRef, referrerStudentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Referred Friend Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Jain"
                  value={newRef.referredStudentName}
                  onChange={(e) => setNewRef({ ...newRef, referredStudentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Referred Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98999 12345"
                  value={newRef.referredStudentPhone}
                  onChange={(e) => setNewRef({ ...newRef, referredStudentPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Reward (₹)</label>
                  <input
                    type="number"
                    value={newRef.rewardAmount}
                    onChange={(e) => setNewRef({ ...newRef, rewardAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={newRef.status}
                    onChange={(e) => setNewRef({ ...newRef, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="pending">Pending Inquiry</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="rewarded">Reward Paid</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRefOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  Save Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
