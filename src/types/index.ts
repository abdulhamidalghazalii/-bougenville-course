export type UserRole = 'admin' | 'tutor';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
}

export type EducationLevel =
  | 'PAUD'
  | 'TK A'
  | 'TK B'
  | 'SD Kelas 1'
  | 'SD Kelas 2'
  | 'SD Kelas 3'
  | 'SD Kelas 4'
  | 'SD Kelas 5'
  | 'SD Kelas 6';

export type StudentStatus = 'active' | 'archived' | 'graduated';

export interface Parent {
  id: string;
  tutor_id: string;
  full_name: string;
  whatsapp_number: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentParentLink {
  id: string;
  student_id: string;
  parent_id: string;
  relationship: 'Ayah' | 'Ibu' | 'Wali';
  report_delivery_pref: 'whatsapp' | 'email' | 'both';
  is_primary_contact: boolean;
  parent?: Parent;
}

export interface Student {
  id: string;
  tutor_id: string;
  student_code: string;
  full_name: string;
  birth_date: string;
  education_level: EducationLevel;
  school_class?: string;
  photo_path?: string;
  start_date: string;
  status: StudentStatus;
  learning_needs?: string;
  created_at?: string;
  updated_at?: string;
  parent?: Parent;
  parent_link?: StudentParentLink;
  tutor?: Profile;
}

export interface Program {
  id: string;
  tutor_id?: string;
  name: string;
  education_level: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export type IndicatorCategory = 'membaca' | 'menulis' | 'berhitung';

export interface LearningIndicator {
  id: string;
  category: IndicatorCategory;
  education_level: string;
  indicator_name: string;
  description?: string;
  order_index: number;
  is_active: boolean;
}

export interface StudentLearningTarget {
  id: string;
  student_id: string;
  indicator_id?: string;
  target_description: string;
  status: 'pending' | 'in_progress' | 'achieved';
  target_date?: string;
  achieved_at?: string;
  indicator?: LearningIndicator;
}

export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Schedule {
  id: string;
  tutor_id: string;
  student_id: string;
  program_id?: string;
  start_at: string;
  end_at: string;
  location: string;
  status: ScheduleStatus;
  notes?: string;
  created_at?: string;
  student?: Student;
  program?: Program;
}

export type AttendanceStatus = 'present' | 'permission' | 'sick' | 'absent';

export interface Attendance {
  id: string;
  schedule_id?: string;
  student_id: string;
  tutor_id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  created_at?: string;
  student?: Student;
}

export type AssessmentLevel = 'BB' | 'MB' | 'BSH' | 'BSB' | 'UNASSESSED';

export const ASSESSMENT_CONFIG: Record<
  AssessmentLevel,
  { label: string; short: string; color: string; bg: string; border: string; score: number }
> = {
  BB: {
    label: 'Belum Berkembang',
    short: 'BB',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    score: 1,
  },
  MB: {
    label: 'Mulai Berkembang',
    short: 'MB',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    score: 2,
  },
  BSH: {
    label: 'Berkembang Sesuai Harapan',
    short: 'BSH',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    score: 3,
  },
  BSB: {
    label: 'Berkembang Sangat Baik',
    short: 'BSB',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    score: 4,
  },
  UNASSESSED: {
    label: 'Belum Dinilai',
    short: '-',
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    score: 0,
  },
};

export interface StudentAssessment {
  id: string;
  session_id: string;
  student_id: string;
  indicator_id: string;
  assessment_level: AssessmentLevel;
  evidence_notes?: string;
  indicator?: LearningIndicator;
}

export type SessionStatus = 'draft' | 'finalized';

export interface LearningSession {
  id: string;
  tutor_id: string;
  student_id: string;
  schedule_id?: string;
  session_date: string;
  duration_minutes: number;
  material: string;
  objectives?: string;
  method?: string;
  achievements?: string;
  difficulties?: string;
  teacher_notes?: string;
  home_recommendations?: string;
  next_targets?: string;
  status: SessionStatus;
  finalized_at?: string;
  created_at?: string;
  updated_at?: string;
  student?: Student;
  assessments?: StudentAssessment[];
}

export type ReportPeriodType = 'weekly' | 'monthly' | 'custom';
export type ReportStatus = 'draft' | 'ready' | 'sent';

export interface LearningReport {
  id: string;
  tutor_id: string;
  student_id: string;
  period_type: ReportPeriodType;
  period_start: string;
  period_end: string;
  status: ReportStatus;
  file_path?: string;
  summary_notes?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  versions?: ReportVersion[];
  delivery_logs?: ReportDeliveryLog[];
}

export interface ReportVersion {
  id: string;
  report_id: string;
  version_number: number;
  file_path?: string;
  revision_notes?: string;
  created_at: string;
}

export type DeliveryChannel = 'whatsapp' | 'email';
export type DeliveryStatus = 'prepared' | 'opened' | 'sent' | 'failed';

export interface ReportDeliveryLog {
  id: string;
  report_id: string;
  tutor_id: string;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  attempted_at: string;
  confirmed_at?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
  actor_name?: string;
}
