// src/types.ts

export type UserType = 'Admin' | 'Director' |'Staff';

export interface User {
  id: string;
  first_name:string;
  last_name:string;
  staff_id: string;
  email: string;
  name: string;
  role: 'admin' | 'director' | 'staff';
  department?: string;
  position?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  reviewerId?: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'needs_rework' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  uploadedFileName?: string;
  submissionNotes?: string;
  uploadedAt?: string;
  targetCompletionDate?: string;
  projectId?: string; 
  isWeeklyDeliverable?: boolean;
}


export type ProjectType = 'AHP' | 'Private';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';

export interface Project {
  id: string;                // matches $table->id()
  code: string;              // unique project code
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  client_name?: string | null;
  description?: string | null;
  start_date?: string | null; // ISO date string: "2025-08-24"
  end_date?: string | null;
  created_at: string;        // ISO datetime string
  updated_at: string;        // ISO datetime string
}

export interface Leave {
    leaveType: string;
      startDate: string;
      endDate: string,
      reason: string;
      status: string;
      attachmentUrl?: string;
      appliedAt: string;
      reviewedBy?: string;
      reviewedAt?: string;
      comments?: string;
    }
    
export interface LeaveTemplate {
  id: number;
  name: string;
  description?: string;
  durationDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  projectId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string; // ISO date string
  status: 'paid' | 'unpaid' | 'overdue';
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface review{
  id: number;
  taskId: number;
  reviewerId: string;
  comments: string;
  status: 'approved' | 'rejected' | 'needs_rework';
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  totalHours?: number;
}

export interface Deliverable {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  reviewerId?: string;
  targetCompletionDate?: string;
  isWeeklyDeliverable: boolean;
}

export interface ExistingDeliverable extends Deliverable {
  id: string;
}