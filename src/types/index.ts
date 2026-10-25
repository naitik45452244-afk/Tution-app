export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  classGrade: string; // e.g. "Class 10", "Class 12"
  batch: string; // e.g. "Batch A (5:00 PM)", "Batch B (6:30 PM)"
  studentPhone: string;
  parentName: string;
  parentPhone: string;
  monthlyFee: number; // in INR
  feeDueDay: number; // day of month, e.g. 5
  joinedDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive';
  referredBy?: string; // studentId or name
  notes?: string;
  parentPin?: string; // 4-digit PIN for parent portal login
}

export type FeeStatus = 'paid' | 'pending' | 'overdue' | 'partial';

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string; // e.g. "October 2026"
  amountDue: number;
  amountPaid: number;
  status: FeeStatus;
  dueDate: string; // YYYY-MM-DD
  paidDate?: string;
  paymentMode?: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
  transactionRef?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  batch: string;
  remarks?: string;
  timestamp: string;
}

export interface TestRecord {
  id: string;
  title: string;
  subject: string;
  batch: string;
  date: string; // YYYY-MM-DD
  totalMarks: number;
  passingMarks: number;
  topics?: string;
}

export interface TestMark {
  id: string;
  testId: string;
  studentId: string;
  marksObtained: number;
  rank?: number;
  feedback?: string;
}

export interface HomeworkItem {
  id: string;
  batch: string;
  subject: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: 'assigned' | 'reviewed';
}

export interface Referral {
  id: string;
  referrerStudentId: string;
  referredStudentName: string;
  referredStudentPhone: string;
  rewardAmount: number; // e.g. ₹500 discount or cash
  status: 'pending' | 'enrolled' | 'rewarded';
  date: string;
  notes?: string;
}

export interface CentreProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  upiId: string; // e.g. tuitiondesk@oksbi or 9876543210@paytm
  upiName: string;
  currency: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}
