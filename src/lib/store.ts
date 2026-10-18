import { useState, useEffect } from 'react';
import {
  Profile,
  Student,
  Parent,
  Program,
  LearningIndicator,
  Schedule,
  Attendance,
  LearningSession,
  LearningReport,
  AuditLog,
  AssessmentLevel,
  StudentAssessment,
} from '../types';
import {
  MOCK_ADMIN,
  MOCK_TUTORS,
  MOCK_PROGRAMS,
  MOCK_INDICATORS,
  MOCK_STUDENTS,
  MOCK_PARENTS,
  MOCK_SCHEDULES,
  MOCK_ATTENDANCES,
  MOCK_SESSIONS,
  MOCK_REPORTS,
} from '../data/mockData';

export interface UserAccount extends Profile {
  passwordHash: string; // Stored hash/credential for local authentication
}

const STORAGE_KEYS = {
  CURRENT_USER: 'syafa_prod_current_user',
  ACCOUNTS: 'syafa_prod_accounts',
  STUDENTS: 'syafa_prod_students',
  PARENTS: 'syafa_prod_parents',
  PROGRAMS: 'syafa_prod_programs',
  INDICATORS: 'syafa_prod_indicators',
  SCHEDULES: 'syafa_prod_schedules',
  ATTENDANCES: 'syafa_prod_attendances',
  SESSIONS: 'syafa_prod_sessions',
  REPORTS: 'syafa_prod_reports',
  AUDIT_LOGS: 'syafa_prod_audit_logs',
};

// Helper for localStorage with default fallback
function loadData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${key}:`, err);
    return defaultValue;
  }
}

function saveData<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
}

class AppStore {
  private listeners: Set<() => void> = new Set();

  currentUser: Profile | null = null;
  accounts: UserAccount[] = [];
  students: Student[] = [];
  parents: Parent[] = [];
  programs: Program[] = [];
  indicators: LearningIndicator[] = [];
  schedules: Schedule[] = [];
  attendances: Attendance[] = [];
  sessions: LearningSession[] = [];
  reports: LearningReport[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.initialize();
  }

  initialize() {
    this.currentUser = loadData<Profile | null>(STORAGE_KEYS.CURRENT_USER, null);
    this.accounts = loadData<UserAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
    this.students = loadData<Student[]>(STORAGE_KEYS.STUDENTS, []);
    this.parents = loadData<Parent[]>(STORAGE_KEYS.PARENTS, []);
    this.programs = loadData<Program[]>(STORAGE_KEYS.PROGRAMS, MOCK_PROGRAMS);
    this.indicators = loadData<LearningIndicator[]>(STORAGE_KEYS.INDICATORS, MOCK_INDICATORS);
    this.schedules = loadData<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
    this.attendances = loadData<Attendance[]>(STORAGE_KEYS.ATTENDANCES, []);
    this.sessions = loadData<LearningSession[]>(STORAGE_KEYS.SESSIONS, []);
    this.reports = loadData<LearningReport[]>(STORAGE_KEYS.REPORTS, []);
    this.auditLogs = loadData<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  get tutors(): Profile[] {
    return this.accounts
      .filter((a) => a.role === 'tutor')
      .map(({ passwordHash, ...profile }) => profile);
  }

  hasAdminAccount(): boolean {
    return this.accounts.some((a) => a.role === 'admin');
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // AUTHENTICATION: REGISTER FIRST ADMIN
  registerFirstAdmin(data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
  }): { success: boolean; message: string; user?: Profile } {
    if (this.hasAdminAccount()) {
      return { success: false, message: 'Akun Administrator utama sudah terdaftar di sistem.' };
    }

    const newAdmin: UserAccount = {
      id: 'usr-admin-' + Date.now(),
      email: data.email.trim().toLowerCase(),
      full_name: data.full_name.trim(),
      role: 'admin',
      phone: data.phone?.trim() || '',
      is_active: true,
      last_sign_in_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      passwordHash: btoa(data.password), // Base64 encoding for local credential check
    };

    this.accounts = [newAdmin, ...this.accounts];
    saveData(STORAGE_KEYS.ACCOUNTS, this.accounts);
    this.setCurrentUser(newAdmin);
    this.logAudit('REGISTER_FIRST_ADMIN', 'profile', newAdmin.id, { email: newAdmin.email });
    return { success: true, message: 'Akun Administrator utama berhasil dibuat.', user: newAdmin };
  }

  // AUTHENTICATION: LOGIN
  login(email: string, password: string): { success: boolean; message: string; user?: Profile } {
    const cleanEmail = email.trim().toLowerCase();
    const account = this.accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, message: 'Email tidak ditemukan dalam sistem.' };
    }

    if (account.passwordHash !== btoa(password)) {
      return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
    }

    if (!account.is_active) {
      return {
        success: false,
        message: 'Akses ditolak: Akun Anda sedang dinonaktifkan oleh Administrator.',
      };
    }

    // Update last sign in
    account.last_sign_in_at = new Date().toISOString();
    this.accounts = this.accounts.map((a) => (a.id === account.id ? account : a));
    saveData(STORAGE_KEYS.ACCOUNTS, this.accounts);

    const { passwordHash, ...profile } = account;
    this.setCurrentUser(profile);
    this.logAudit('USER_LOGIN', 'profile', profile.id, { email: profile.email, role: profile.role });
    return { success: true, message: 'Berhasil masuk.', user: profile };
  }

  setCurrentUser(user: Profile | null) {
    this.currentUser = user;
    saveData(STORAGE_KEYS.CURRENT_USER, user);
    this.notify();
  }

  logout() {
    this.setCurrentUser(null);
  }

  // AUDIT LOG
  logAudit(action: string, entity_type: string, entity_id?: string, details?: Record<string, any>) {
    const entry: AuditLog = {
      id: 'aud-' + Date.now(),
      actor_id: this.currentUser?.id,
      actor_name: this.currentUser?.full_name || 'System',
      action,
      entity_type,
      entity_id,
      details,
      created_at: new Date().toISOString(),
    };
    this.auditLogs = [entry, ...this.auditLogs];
    saveData(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    this.notify();
  }

  // ADMIN METHODS: CREATE REAL TUTOR ACCOUNT
  createTutor(data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
  }): { success: boolean; message: string } {
    if (this.currentUser?.role !== 'admin') {
      return { success: false, message: 'Akses ditolak: Hanya admin yang dapat membuat akun tutor.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const existing = this.accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'Alamat email tutor sudah terdaftar di sistem.' };
    }

    const newTutor: UserAccount = {
      id: 'usr-tutor-' + Date.now(),
      email: cleanEmail,
      full_name: data.full_name.trim(),
      role: 'tutor',
      phone: data.phone?.trim() || '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      passwordHash: btoa(data.password),
    };

    this.accounts = [newTutor, ...this.accounts];
    saveData(STORAGE_KEYS.ACCOUNTS, this.accounts);
    this.logAudit('CREATE_TUTOR_ACCOUNT', 'profile', newTutor.id, {
      email: cleanEmail,
      name: newTutor.full_name,
    });
    this.notify();
    return { success: true, message: `Akun tutor ${data.full_name} berhasil dibuat dan siap digunakan login.` };
  }

  updateTutor(id: string, updates: Partial<UserAccount>): { success: boolean; message: string } {
    if (this.currentUser?.role !== 'admin') {
      return { success: false, message: 'Akses ditolak: Hanya admin yang dapat mengubah akun tutor.' };
    }

    this.accounts = this.accounts.map((a) =>
      a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
    );
    saveData(STORAGE_KEYS.ACCOUNTS, this.accounts);
    this.logAudit('UPDATE_TUTOR_ACCOUNT', 'profile', id, updates);
    this.notify();
    return { success: true, message: 'Informasi akun tutor berhasil diperbarui.' };
  }

  toggleTutorActive(id: string): { success: boolean; message: string } {
    if (this.currentUser?.role !== 'admin') {
      return { success: false, message: 'Akses ditolak: Hanya admin yang dapat mengubah status tutor.' };
    }

    let newState = true;
    this.accounts = this.accounts.map((a) => {
      if (a.id === id) {
        newState = !a.is_active;
        return { ...a, is_active: newState, updated_at: new Date().toISOString() };
      }
      return a;
    });

    saveData(STORAGE_KEYS.ACCOUNTS, this.accounts);
    this.logAudit(newState ? 'ACTIVATE_TUTOR_ACCOUNT' : 'DEACTIVATE_TUTOR_ACCOUNT', 'profile', id);
    this.notify();
    return {
      success: true,
      message: `Akun tutor berhasil ${newState ? 'diaktifkan' : 'dinonaktifkan'}.`,
    };
  }

  resetTutorPassword(id: string, newPassword: string): { success: boolean; message: string } {
    if (this.currentUser?.role !== 'admin') {
      return { success: false, message: 'Akses ditolak: Hanya admin yang dapat mereset kata sandi tutor.' };
    }

    const tutor = this.accounts.find((a) => a.id === id);
    if (!tutor) return { success: false, message: 'Tutor tidak ditemukan.' };

    this.accounts = this.accounts.map((a) =>
      a.id === id
        ? { ...a, passwordHash: btoa(newPassword), updated_at: new Date().toISOString() }
        : a
    );
    saveData(STORAGE_KEYS.ACCOUNTS, this.accounts);
    this.logAudit('RESET_TUTOR_PASSWORD', 'profile', id, { email: tutor.email });
    this.notify();
    return {
      success: true,
      message: `Kata sandi tutor ${tutor.full_name} berhasil diubah.`,
    };
  }

  // TUTOR METHODS: STUDENTS CRUD (Filtered by current logged-in tutor)
  getTutorStudents(): Student[] {
    if (this.currentUser?.role === 'admin') {
      // Per Section 4A: Admin must NOT see student operational data
      return [];
    }
    const currentTutorId = this.currentUser?.id;
    return this.students.filter((s) => s.tutor_id === currentTutorId);
  }

  getStudentById(id: string): Student | undefined {
    if (this.currentUser?.role === 'admin') return undefined;
    const currentTutorId = this.currentUser?.id;
    return this.students.find((s) => s.id === id && s.tutor_id === currentTutorId);
  }

  createStudent(data: {
    full_name: string;
    birth_date: string;
    education_level: Student['education_level'];
    school_class?: string;
    learning_needs?: string;
    parent_name: string;
    parent_whatsapp: string;
    parent_relationship: 'Ayah' | 'Ibu' | 'Wali';
  }): Student {
    const currentTutorId = this.currentUser?.id || 'usr-default';
    const newParentId = 'par-' + Date.now();
    const newStudentId = 'stu-' + Date.now();
    const studentCode = `SYF-${new Date().getFullYear()}-${String(this.students.length + 1).padStart(3, '0')}`;

    const newParent: Parent = {
      id: newParentId,
      tutor_id: currentTutorId,
      full_name: data.parent_name,
      whatsapp_number: data.parent_whatsapp,
      created_at: new Date().toISOString(),
    };

    const newStudent: Student = {
      id: newStudentId,
      tutor_id: currentTutorId,
      student_code: studentCode,
      full_name: data.full_name,
      birth_date: data.birth_date,
      education_level: data.education_level,
      school_class: data.school_class,
      start_date: new Date().toISOString().split('T')[0],
      status: 'active',
      learning_needs: data.learning_needs,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent: newParent,
      parent_link: {
        id: 'spl-' + Date.now(),
        student_id: newStudentId,
        parent_id: newParentId,
        relationship: data.parent_relationship,
        report_delivery_pref: 'whatsapp',
        is_primary_contact: true,
        parent: newParent,
      },
    };

    this.parents = [newParent, ...this.parents];
    this.students = [newStudent, ...this.students];
    saveData(STORAGE_KEYS.PARENTS, this.parents);
    saveData(STORAGE_KEYS.STUDENTS, this.students);
    this.logAudit('CREATE_STUDENT', 'student', newStudentId, { name: data.full_name, code: studentCode });
    this.notify();
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): boolean {
    const currentTutorId = this.currentUser?.id;
    let found = false;

    this.students = this.students.map((s) => {
      if (s.id === id && s.tutor_id === currentTutorId) {
        found = true;
        return { ...s, ...updates, updated_at: new Date().toISOString() };
      }
      return s;
    });

    if (found) {
      saveData(STORAGE_KEYS.STUDENTS, this.students);
      this.logAudit('UPDATE_STUDENT', 'student', id, updates);
      this.notify();
    }
    return found;
  }

  archiveStudent(id: string): boolean {
    return this.updateStudent(id, { status: 'archived' });
  }

  restoreStudent(id: string): boolean {
    return this.updateStudent(id, { status: 'active' });
  }

  // SCHEDULES & ATTENDANCE
  getTutorSchedules(): Schedule[] {
    if (this.currentUser?.role === 'admin') return [];
    const currentTutorId = this.currentUser?.id;
    return this.schedules
      .filter((s) => s.tutor_id === currentTutorId)
      .map((sch) => ({
        ...sch,
        student: this.students.find((s) => s.id === sch.student_id),
        program: this.programs.find((p) => p.id === sch.program_id),
      }))
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }

  createSchedule(data: {
    student_id: string;
    program_id?: string;
    start_at: string;
    end_at: string;
    location: string;
    notes?: string;
  }): Schedule {
    const currentTutorId = this.currentUser?.id || 'usr-default';
    const newSchedule: Schedule = {
      id: 'sch-' + Date.now(),
      tutor_id: currentTutorId,
      student_id: data.student_id,
      program_id: data.program_id,
      start_at: data.start_at,
      end_at: data.end_at,
      location: data.location,
      status: 'scheduled',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    this.schedules = [newSchedule, ...this.schedules];
    saveData(STORAGE_KEYS.SCHEDULES, this.schedules);
    this.logAudit('CREATE_SCHEDULE', 'schedule', newSchedule.id, { student_id: data.student_id });
    this.notify();
    return newSchedule;
  }

  updateScheduleStatus(id: string, status: Schedule['status']): void {
    const currentTutorId = this.currentUser?.id;
    this.schedules = this.schedules.map((s) => (s.id === id && s.tutor_id === currentTutorId ? { ...s, status } : s));
    saveData(STORAGE_KEYS.SCHEDULES, this.schedules);
    this.logAudit('UPDATE_SCHEDULE_STATUS', 'schedule', id, { status });
    this.notify();
  }

  recordAttendance(data: {
    schedule_id?: string;
    student_id: string;
    status: Attendance['status'];
    notes?: string;
    date?: string;
  }): Attendance {
    const currentTutorId = this.currentUser?.id || 'usr-default';
    const newAtt: Attendance = {
      id: 'att-' + Date.now(),
      schedule_id: data.schedule_id,
      student_id: data.student_id,
      tutor_id: currentTutorId,
      date: data.date || new Date().toISOString().split('T')[0],
      status: data.status,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    if (data.schedule_id) {
      this.updateScheduleStatus(data.schedule_id, 'completed');
    }

    this.attendances = [newAtt, ...this.attendances];
    saveData(STORAGE_KEYS.ATTENDANCES, this.attendances);
    this.logAudit('RECORD_ATTENDANCE', 'attendance', newAtt.id, { student_id: data.student_id, status: data.status });
    this.notify();
    return newAtt;
  }

  getStudentAttendances(student_id: string): Attendance[] {
    return this.attendances.filter((a) => a.student_id === student_id);
  }

  // LEARNING SESSIONS & ASSESSMENTS
  getTutorSessions(): LearningSession[] {
    if (this.currentUser?.role === 'admin') return [];
    const currentTutorId = this.currentUser?.id;
    return this.sessions
      .filter((s) => s.tutor_id === currentTutorId)
      .map((ses) => ({
        ...ses,
        student: this.students.find((s) => s.id === ses.student_id),
      }))
      .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  }

  getStudentSessions(student_id: string): LearningSession[] {
    return this.sessions
      .filter((s) => s.student_id === student_id)
      .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  }

  saveSession(
    sessionData: Omit<LearningSession, 'id' | 'tutor_id' | 'created_at' | 'updated_at'>,
    sessionId?: string
  ): LearningSession {
    const currentTutorId = this.currentUser?.id || 'usr-default';
    const isNew = !sessionId;
    const now = new Date().toISOString();

    let saved: LearningSession;

    if (isNew) {
      saved = {
        ...sessionData,
        id: 'ses-' + Date.now(),
        tutor_id: currentTutorId,
        created_at: now,
        updated_at: now,
        finalized_at: sessionData.status === 'finalized' ? now : undefined,
      };
      this.sessions = [saved, ...this.sessions];
    } else {
      saved = {
        ...sessionData,
        id: sessionId,
        tutor_id: currentTutorId,
        updated_at: now,
        finalized_at: sessionData.status === 'finalized' ? now : undefined,
      };
      this.sessions = this.sessions.map((s) => (s.id === sessionId ? saved : s));
    }

    saveData(STORAGE_KEYS.SESSIONS, this.sessions);
    this.logAudit(
      saved.status === 'finalized' ? 'FINALIZE_LEARNING_SESSION' : 'SAVE_DRAFT_SESSION',
      'learning_session',
      saved.id,
      { student_id: saved.student_id, date: saved.session_date }
    );
    this.notify();
    return saved;
  }

  // REPORTS & DELIVERY
  getTutorReports(): LearningReport[] {
    if (this.currentUser?.role === 'admin') return [];
    const currentTutorId = this.currentUser?.id;
    return this.reports
      .filter((r) => r.tutor_id === currentTutorId)
      .map((r) => ({
        ...r,
        student: this.students.find((s) => s.id === r.student_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  saveReport(report: Omit<LearningReport, 'id' | 'tutor_id' | 'created_at' | 'updated_at'>): LearningReport {
    const currentTutorId = this.currentUser?.id || 'usr-default';
    const now = new Date().toISOString();
    const newReport: LearningReport = {
      ...report,
      id: 'rep-' + Date.now(),
      tutor_id: currentTutorId,
      created_at: now,
      updated_at: now,
    };

    this.reports = [newReport, ...this.reports];
    saveData(STORAGE_KEYS.REPORTS, this.reports);
    this.logAudit('CREATE_LEARNING_REPORT', 'learning_report', newReport.id, { student_id: report.student_id });
    this.notify();
    return newReport;
  }

  logReportDelivery(report_id: string, channel: 'whatsapp' | 'email', status: 'prepared' | 'opened' | 'sent', notes?: string) {
    const currentTutorId = this.currentUser?.id || 'usr-default';
    const now = new Date().toISOString();

    this.reports = this.reports.map((r) => {
      if (r.id === report_id) {
        const logs = r.delivery_logs || [];
        const newLog = {
          id: 'log-' + Date.now(),
          report_id,
          tutor_id: currentTutorId,
          channel,
          status,
          attempted_at: now,
          confirmed_at: status === 'sent' ? now : undefined,
          notes,
        };
        return {
          ...r,
          status: status === 'sent' ? 'sent' : r.status,
          delivery_logs: [newLog, ...logs],
        };
      }
      return r;
    });

    saveData(STORAGE_KEYS.REPORTS, this.reports);
    this.logAudit('LOG_REPORT_DELIVERY', 'learning_report', report_id, { channel, status });
    this.notify();
  }
}

export const appStore = new AppStore();

// React Hook to consume store reactively
export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return appStore.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  return appStore;
}
