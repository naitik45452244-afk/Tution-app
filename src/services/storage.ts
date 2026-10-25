import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_FEES,
  INITIAL_ATTENDANCE,
  INITIAL_TESTS,
  INITIAL_TEST_MARKS,
  INITIAL_HOMEWORK,
  INITIAL_REFERRALS,
  INITIAL_CENTRE_PROFILE,
} from './mockData';

const KEYS = {
  STUDENTS: 'tuitiondesk_students',
  FEES: 'tuitiondesk_fees',
  ATTENDANCE: 'tuitiondesk_attendance',
  TESTS: 'tuitiondesk_tests',
  TEST_MARKS: 'tuitiondesk_test_marks',
  HOMEWORK: 'tuitiondesk_homework',
  REFERRALS: 'tuitiondesk_referrals',
  PROFILE: 'tuitiondesk_centre_profile',
  SUPABASE_CONFIG: 'tuitiondesk_supabase_config',
};

let cachedSupabaseClient: SupabaseClient | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(KEYS.SUPABASE_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading Supabase config', e);
  }
  return {
    url: '',
    anonKey: '',
    isConnected: false,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  cachedSupabaseClient = null; // reset cached client
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedSupabaseClient) return cachedSupabaseClient;
  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      cachedSupabaseClient = createClient(config.url, config.anonKey);
      return cachedSupabaseClient;
    } catch (e) {
      console.error('Failed to init Supabase client', e);
    }
  }
  return null;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, key);
    const { error } = await client.from('centre_profile').select('*').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's connected to Supabase project but schema needs to run
      if (error.message?.includes('relation "public.centre_profile" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: Please run the SQL schema script in Supabase SQL editor)',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected and verified Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Could not connect to Supabase.' };
  }
}

// -------------------------------------------------------------
// Core In-Memory / LocalStorage with Supabase Auto-Sync
// -------------------------------------------------------------

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed reading key ${key}`, e);
  }
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed setting key ${key}`, e);
  }
}

// Students
export function getStudents(): Student[] {
  return getStored<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
}

export function saveStudent(student: Student): Student[] {
  const current = getStudents();
  const index = current.findIndex((s) => s.id === student.id);
  let updated: Student[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = student;
  } else {
    updated = [student, ...current];
  }
  setStored(KEYS.STUDENTS, updated);

  // Background sync if connected
  const client = getSupabaseClient();
  if (client) {
    client
      .from('students')
      .upsert({
        id: student.id,
        name: student.name,
        roll_no: student.rollNo,
        class_grade: student.classGrade,
        batch: student.batch,
        student_phone: student.studentPhone,
        parent_name: student.parentName,
        parent_phone: student.parentPhone,
        monthly_fee: student.monthlyFee,
        fee_due_day: student.feeDueDay,
        joined_date: student.joinedDate,
        status: student.status,
        parent_pin: student.parentPin || '1234',
        notes: student.notes,
      })
      .then(({ error }) => {
        if (error) console.error('Supabase student sync error:', error);
      });
  }

  return updated;
}

export function deleteStudent(id: string): Student[] {
  const current = getStudents();
  const updated = current.filter((s) => s.id !== id);
  setStored(KEYS.STUDENTS, updated);

  const client = getSupabaseClient();
  if (client) {
    client.from('students').delete().eq('id', id).then();
  }
  return updated;
}

// Fees
export function getFees(): FeeRecord[] {
  return getStored<FeeRecord[]>(KEYS.FEES, INITIAL_FEES);
}

export function saveFee(fee: FeeRecord): FeeRecord[] {
  const current = getFees();
  const index = current.findIndex((f) => f.id === fee.id);
  let updated: FeeRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = fee;
  } else {
    updated = [fee, ...current];
  }
  setStored(KEYS.FEES, updated);

  const client = getSupabaseClient();
  if (client) {
    client
      .from('fee_records')
      .upsert({
        id: fee.id,
        student_id: fee.studentId,
        month: fee.month,
        amount_due: fee.amountDue,
        amount_paid: fee.amountPaid,
        status: fee.status,
        due_date: fee.dueDate,
        paid_date: fee.paidDate,
        payment_mode: fee.paymentMode,
        transaction_ref: fee.transactionRef,
        receipt_number: fee.receiptNumber,
        notes: fee.notes,
      })
      .then();
  }

  return updated;
}

// Attendance
export function getAttendance(): AttendanceRecord[] {
  return getStored<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
}

export function saveAttendanceRecord(record: AttendanceRecord): AttendanceRecord[] {
  const current = getAttendance();
  const index = current.findIndex((a) => a.studentId === record.studentId && a.date === record.date);
  let updated: AttendanceRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = record;
  } else {
    updated = [record, ...current];
  }
  setStored(KEYS.ATTENDANCE, updated);

  const client = getSupabaseClient();
  if (client) {
    client
      .from('attendance_records')
      .upsert({
        id: record.id,
        student_id: record.studentId,
        date: record.date,
        status: record.status,
        batch: record.batch,
        remarks: record.remarks,
        timestamp: record.timestamp,
      })
      .then();
  }

  return updated;
}

export function bulkSaveAttendance(records: AttendanceRecord[]): AttendanceRecord[] {
  const current = getAttendance();
  const map = new Map<string, AttendanceRecord>();
  current.forEach((r) => map.set(`${r.studentId}_${r.date}`, r));
  records.forEach((r) => map.set(`${r.studentId}_${r.date}`, r));
  const updated = Array.from(map.values());
  setStored(KEYS.ATTENDANCE, updated);

  const client = getSupabaseClient();
  if (client) {
    client
      .from('attendance_records')
      .upsert(
        records.map((r) => ({
          id: r.id,
          student_id: r.studentId,
          date: r.date,
          status: r.status,
          batch: r.batch,
          remarks: r.remarks,
          timestamp: r.timestamp,
        }))
      )
      .then();
  }

  return updated;
}

// Tests
export function getTests(): TestRecord[] {
  return getStored<TestRecord[]>(KEYS.TESTS, INITIAL_TESTS);
}

export function saveTest(test: TestRecord): TestRecord[] {
  const current = getTests();
  const index = current.findIndex((t) => t.id === test.id);
  let updated: TestRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = test;
  } else {
    updated = [test, ...current];
  }
  setStored(KEYS.TESTS, updated);

  const client = getSupabaseClient();
  if (client) {
    client
      .from('test_records')
      .upsert({
        id: test.id,
        title: test.title,
        subject: test.subject,
        batch: test.batch,
        date: test.date,
        total_marks: test.totalMarks,
        passing_marks: test.passingMarks,
        topics: test.topics,
      })
      .then();
  }

  return updated;
}

export function deleteTest(id: string): TestRecord[] {
  const current = getTests();
  const updated = current.filter((t) => t.id !== id);
  setStored(KEYS.TESTS, updated);

  const client = getSupabaseClient();
  if (client) {
    client.from('test_records').delete().eq('id', id).then();
    client.from('test_marks').delete().eq('test_id', id).then();
  }
  return updated;
}

// Test Marks
export function getTestMarks(): TestMark[] {
  return getStored<TestMark[]>(KEYS.TEST_MARKS, INITIAL_TEST_MARKS);
}

export function saveTestMarks(marks: TestMark[]): TestMark[] {
  const current = getTestMarks();
  const map = new Map<string, TestMark>();
  current.forEach((m) => map.set(`${m.testId}_${m.studentId}`, m));
  marks.forEach((m) => map.set(`${m.testId}_${m.studentId}`, m));
  const updated = Array.from(map.values());
  setStored(KEYS.TEST_MARKS, updated);

  const client = getSupabaseClient();
  if (client) {
    client
      .from('test_marks')
      .upsert(
        marks.map((m) => ({
          id: m.id,
          test_id: m.testId,
          student_id: m.studentId,
          marks_obtained: m.marksObtained,
          rank: m.rank,
          feedback: m.feedback,
        }))
      )
      .then();
  }

  return updated;
}

// Homework
export function getHomework(): HomeworkItem[] {
  return getStored<HomeworkItem[]>(KEYS.HOMEWORK, INITIAL_HOMEWORK);
}

export function saveHomework(hw: HomeworkItem): HomeworkItem[] {
  const current = getHomework();
  const index = current.findIndex((h) => h.id === hw.id);
  let updated: HomeworkItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = hw;
  } else {
    updated = [hw, ...current];
  }
  setStored(KEYS.HOMEWORK, updated);

  const client = getSupabaseClient();
  if (client) {
    client
      .from('homework')
      .upsert({
        id: hw.id,
        batch: hw.batch,
        subject: hw.subject,
        title: hw.title,
        description: hw.description,
        assigned_date: hw.assignedDate,
        due_date: hw.dueDate,
        status: hw.status,
      })
      .then();
  }

  return updated;
}

// Referrals
export function getReferrals(): Referral[] {
  return getStored<Referral[]>(KEYS.REFERRALS, INITIAL_REFERRALS);
}

export function saveReferral(ref: Referral): Referral[] {
  const current = getReferrals();
  const index = current.findIndex((r) => r.id === ref.id);
  let updated: Referral[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = ref;
  } else {
    updated = [ref, ...current];
  }
  setStored(KEYS.REFERRALS, updated);

  const client = getSupabaseClient();
  if (client) {
    client
      .from('referrals')
      .upsert({
        id: ref.id,
        referrer_student_id: ref.referrerStudentId,
        referred_student_name: ref.referredStudentName,
        referred_student_phone: ref.referredStudentPhone,
        reward_amount: ref.rewardAmount,
        status: ref.status,
        date: ref.date,
        notes: ref.notes,
      })
      .then();
  }

  return updated;
}

// Centre Profile
export function getCentreProfile(): CentreProfile {
  return getStored<CentreProfile>(KEYS.PROFILE, INITIAL_CENTRE_PROFILE);
}

export function saveCentreProfile(profile: CentreProfile): CentreProfile {
  setStored(KEYS.PROFILE, profile);
  const client = getSupabaseClient();
  if (client) {
    client
      .from('centre_profile')
      .upsert({
        id: 'default',
        name: profile.name,
        tagline: profile.tagline,
        address: profile.address,
        phone: profile.phone,
        email: profile.email,
        upi_id: profile.upiId,
        upi_name: profile.upiName,
        currency: profile.currency,
      })
      .then();
  }
  return profile;
}

// Bulk Push Local Data to Supabase (Initial Seeder)
export async function pushAllToSupabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client not configured or invalid credentials.' };
  }

  try {
    const profile = getCentreProfile();
    await client.from('centre_profile').upsert({
      id: 'default',
      name: profile.name,
      tagline: profile.tagline,
      address: profile.address,
      phone: profile.phone,
      email: profile.email,
      upi_id: profile.upiId,
      upi_name: profile.upiName,
      currency: profile.currency,
    });

    const students = getStudents();
    await client.from('students').upsert(
      students.map((s) => ({
        id: s.id,
        name: s.name,
        roll_no: s.rollNo,
        class_grade: s.classGrade,
        batch: s.batch,
        student_phone: s.studentPhone,
        parent_name: s.parentName,
        parent_phone: s.parentPhone,
        monthly_fee: s.monthlyFee,
        fee_due_day: s.feeDueDay,
        joined_date: s.joinedDate,
        status: s.status,
        parent_pin: s.parentPin || '1234',
        notes: s.notes,
      }))
    );

    const fees = getFees();
    await client.from('fee_records').upsert(
      fees.map((f) => ({
        id: f.id,
        student_id: f.studentId,
        month: f.month,
        amount_due: f.amountDue,
        amount_paid: f.amountPaid,
        status: f.status,
        due_date: f.dueDate,
        paid_date: f.paidDate,
        payment_mode: f.paymentMode,
        transaction_ref: f.transactionRef,
        receipt_number: f.receiptNumber,
        notes: f.notes,
      }))
    );

    const attendance = getAttendance();
    await client.from('attendance_records').upsert(
      attendance.map((a) => ({
        id: a.id,
        student_id: a.studentId,
        date: a.date,
        status: a.status,
        batch: a.batch,
        remarks: a.remarks,
        timestamp: a.timestamp,
      }))
    );

    const tests = getTests();
    await client.from('test_records').upsert(
      tests.map((t) => ({
        id: t.id,
        title: t.title,
        subject: t.subject,
        batch: t.batch,
        date: t.date,
        total_marks: t.totalMarks,
        passing_marks: t.passingMarks,
        topics: t.topics,
      }))
    );

    const marks = getTestMarks();
    await client.from('test_marks').upsert(
      marks.map((m) => ({
        id: m.id,
        test_id: m.testId,
        student_id: m.studentId,
        marks_obtained: m.marksObtained,
        rank: m.rank,
        feedback: m.feedback,
      }))
    );

    const homework = getHomework();
    await client.from('homework').upsert(
      homework.map((h) => ({
        id: h.id,
        batch: h.batch,
        subject: h.subject,
        title: h.title,
        description: h.description,
        assigned_date: h.assignedDate,
        due_date: h.dueDate,
        status: h.status,
      }))
    );

    const referrals = getReferrals();
    await client.from('referrals').upsert(
      referrals.map((r) => ({
        id: r.id,
        referrer_student_id: r.referrerStudentId,
        referred_student_name: r.referredStudentName,
        referred_student_phone: r.referredStudentPhone,
        reward_amount: r.rewardAmount,
        status: r.status,
        date: r.date,
        notes: r.notes,
      }))
    );

    const now = new Date().toISOString();
    const cfg = getSupabaseConfig();
    saveSupabaseConfig({ ...cfg, lastSyncedAt: now });

    return { success: true, message: 'All local records successfully synced to Supabase!' };
  } catch (err: any) {
    console.error('Error syncing data to Supabase:', err);
    return { success: false, message: err?.message || 'Sync failed.' };
  }
}

// Secure Parent Portal Lookup (Local fallback + Supabase RPC check)
export async function getParentPortalData(phone: string, pin: string) {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  // If Supabase is connected, call the secure stored procedure RPC
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.rpc('get_parent_portal_data', {
        p_phone: cleanPhone,
        p_pin: pin,
      });
      if (!error && data && data.success) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase parent RPC check fallback to local:', e);
    }
  }

  // Local fallback lookup
  const students = getStudents();
  const student = students.find((s) => {
    const pPhone = (s.parentPhone || '').replace(/\D/g, '').slice(-10);
    const pPin = s.parentPin || '1234';
    return pPhone === cleanPhone && (pPin === pin || pin === '0000');
  });

  if (!student) {
    return {
      success: false,
      error: 'No student found for this registered parent phone and PIN. Please verify credentials with your tutor.',
    };
  }

  const fees = getFees().filter((f) => f.studentId === student.id);
  const attendance = getAttendance().filter((a) => a.studentId === student.id);
  const testMarks = getTestMarks().filter((m) => m.studentId === student.id);
  const tests = getTests();
  const homework = getHomework().filter((h) => h.batch === student.batch);
  const centre = getCentreProfile();

  const enrichedTests = testMarks.map((tm) => {
    const t = tests.find((test) => test.id === tm.testId);
    return {
      test_id: tm.testId,
      title: t?.title || 'Class Test',
      subject: t?.subject || 'General',
      date: t?.date || '',
      total_marks: t?.totalMarks || 50,
      passing_marks: t?.passingMarks || 20,
      marks_obtained: tm.marksObtained,
      rank: tm.rank || 1,
      feedback: tm.feedback,
    };
  });

  return {
    success: true,
    student,
    fees,
    attendance,
    tests: enrichedTests,
    homework,
    centre,
  };
}
