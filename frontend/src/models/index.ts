export interface User {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    province?: string;
    district?: string;
    ward?: string;
    detail?: string;
  };
  role: 'candidate' | 'admin';
  cccd?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  _id: string;
  code: string;
  name: string;
  shortName?: string;
  description?: string;
  address?: {
    province?: string;
    district?: string;
    detail?: string;
  };
  website?: string;
  phone?: string;
  email?: string;
  logo?: string;
  banner?: string;
  admissionMethod?: string[];
  tuitionRange?: {
    min: number;
    max: number;
    unit?: string;
  };
  isActive: boolean;
  admissionRounds?: {
    name: string;
    startDate: string;
    endDate: string;
    resultDate: string;
    isActive: boolean;
  }[];
  createdAt: string;
}

export interface Major {
  _id: string;
  code: string;
  name: string;
  shortName?: string;
  description?: string;
  school: School | string;
  group?: string;
  degree?: string;
  duration?: number;
  tuitionPerSemester?: number;
  capacity?: number;
  minScore?: number;
  cutoffScore?: number;
  subjectGroups?: string[];
  isActive: boolean;
  requirements?: string;
  careerOpportunities?: string;
  createdAt: string;
}

export interface Combination {
  _id: string;
  code: string;
  name: string;
  subjects: string[];
  major: Major | string;
  school: School | string;
  weight?: string;
  minScore?: number;
  isActive: boolean;
}

export interface Application {
  _id: string;
  applicationCode: string;
  candidate: User | string;
  school: School | string;
  major: Major | string;
  combination: Combination | string;
  admissionRound?: string;
  personalInfo: {
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    cccd?: string;
    phone?: string;
    email?: string;
    address?: {
      province?: string;
      district?: string;
      ward?: string;
      detail?: string;
    };
  };
  academicInfo: {
    highSchool?: string;
    graduationYear?: number;
    academicRecord?: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu';
    scores?: {
      subject1?: number;
      subject2?: number;
      subject3?: number;
      totalScore?: number;
    };
    priorityObject?: string;
    priorityArea?: string;
  };
  documents: Document[];
  status: 'draft' | 'submitted' | 'pending' | 'reviewing' | 'approved' | 'rejected' | 'waitlist';
  statusHistory?: StatusHistory[];
  review?: {
    reviewedBy?: User | string;
    reviewedAt?: string;
    score?: number;
    notes?: string;
    recommendation?: 'accept' | 'reject' | 'waitlist' | 'need_more_info';
  };
  result?: {
    isAdmitted?: boolean;
    admittedAt?: string;
    admissionLetterUrl?: string;
  };
  priorityBonus?: number;
  finalScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id?: string;
  type: 'academic_record' | 'cccd_front' | 'cccd_back' | 'photo' | 'birth_certificate' | 'other';
  fileName?: string;
  fileUrl: string;
  fileType?: string;
  uploadedAt?: string;
  verified?: boolean;
  verifiedBy?: User | string;
  verifiedAt?: string;
  notes?: string;
}

export interface StatusHistory {
  status: string;
  changedBy?: User | string;
  changedAt: string;
  notes?: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: 'application_submitted' | 'status_changed' | 'document_required' | 'result_released' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: {
    applicationId?: string;
    schoolId?: string;
    relatedUserId?: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Statistics {
  total: number;
  byStatus: { _id: string; count: number }[];
  bySchool: { name: string; count: number; approved: number }[];
  byMajor: { name: string; count: number }[];
  dailySubmissions: { _id: string; count: number }[];
}
