import React, { useState } from 'react';
import { Student } from '../../types';
import { X, Save, User, Phone, BookOpen, Clock, Calendar, Shield } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  student: Student | null; // null means create new
  onClose: () => void;
  onSave: (student: Student) => void;
  batches: string[];
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onSave,
  batches,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<Student>>(() => {
    if (student) return { ...student };
    return {
      id: `std_${Date.now()}`,
      name: '',
      rollNo: `APX-${Math.floor(100 + Math.random() * 900)}`,
      classGrade: 'Class 10 CBSE',
      batch: batches[0] || 'Class 10 - Evening Batch (5:00 PM)',
      studentPhone: '+91 ',
      parentName: '',
      parentPhone: '+91 ',
      monthlyFee: 3500,
      feeDueDay: 5,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      parentPin: Math.floor(1000 + Math.random() * 9000).toString(),
      notes: '',
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.parentPhone?.trim()) {
      alert('Student Name and Parent Phone are required.');
      return;
    }
    onSave(formData as Student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {student ? 'Edit Student Details' : 'Add New Student'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All details can be edited anytime and sync to Parent Portal
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Basic Student Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Student Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Roll / ID Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rollNo || ''}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Class / Grade *
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 CBSE"
                    value={formData.classGrade || ''}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assigned Batch *
                </label>
                <select
                  value={formData.batch || ''}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 bg-white"
                >
                  {batches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="Class 10 - Evening Batch (5:00 PM)">Class 10 - Evening Batch (5:00 PM)</option>
                  <option value="Class 12 - Morning Batch (7:00 AM)">Class 12 - Morning Batch (7:00 AM)</option>
                  <option value="Class 9 - Afternoon Batch (3:30 PM)">Class 9 - Afternoon Batch (3:30 PM)</option>
                  <option value="Weekend Special Doubt Batch">Weekend Special Doubt Batch</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Student Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.studentPhone || ''}
                  onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Parent Details & Portal Login */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Parent Details & Portal Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.parentName || ''}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Parent WhatsApp Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="+91 98111 98765"
                    value={formData.parentPhone || ''}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Parent Portal 4-Digit PIN *
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="1234"
                    value={formData.parentPin || ''}
                    onChange={(e) => setFormData({ ...formData, parentPin: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Used by parent to log into parent.html</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 bg-white"
                >
                  <option value="active">Active Enrolled</option>
                  <option value="inactive">Inactive / On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fees Settings */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Fee Structure
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Monthly Tuition Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={100}
                  value={formData.monthlyFee || 0}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 tabular-nums font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Fee Due Day (Day of Month)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={formData.feeDueDay || 5}
                    onChange={(e) => setFormData({ ...formData, feeDueDay: Number(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tutor Notes / Academic Goal
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Strong in Physics, targeting 95+ in CBSE Boards"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{student ? 'Update Student' : 'Save & Enroll'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
