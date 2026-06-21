export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'admin' | 'teacher' | 'parent'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          role: 'admin' | 'teacher' | 'parent'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'admin' | 'teacher' | 'parent'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          section: string
          capacity: number
          academic_year: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          section: string
          capacity: number
          academic_year: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          section?: string
          capacity?: number
          academic_year?: string
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
        }
      }
      teachers: {
        Row: {
          id: string
          user_id: string
          employee_id: string
          qualification: string | null
          specialization: string | null
          join_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          employee_id: string
          qualification?: string | null
          specialization?: string | null
          join_date?: string | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          employee_id?: string
          qualification?: string | null
          specialization?: string | null
          join_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      class_teachers: {
        Row: {
          id: string
          teacher_id: string
          class_id: string
          subject_id: string | null
          is_class_teacher: boolean
          academic_year: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id: string
          subject_id?: string | null
          is_class_teacher?: boolean
          academic_year: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string
          subject_id?: string | null
          is_class_teacher?: boolean
          academic_year?: string
        }
      }
      students: {
        Row: {
          id: string
          admission_number: string
          full_name: string
          date_of_birth: string | null
          gender: string | null
          class_id: string | null
          admission_date: string | null
          status: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          admission_number: string
          full_name: string
          date_of_birth?: string | null
          gender?: string | null
          class_id?: string | null
          admission_date?: string | null
          status: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          admission_number?: string
          full_name?: string
          date_of_birth?: string | null
          gender?: string | null
          class_id?: string | null
          admission_date?: string | null
          status?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parents: {
        Row: {
          id: string
          user_id: string
          student_id: string
          father_name: string | null
          mother_name: string | null
          phone: string | null
          alternate_phone: string | null
          address: string | null
          relation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          student_id: string
          father_name?: string | null
          mother_name?: string | null
          phone?: string | null
          alternate_phone?: string | null
          address?: string | null
          relation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          student_id?: string
          father_name?: string | null
          mother_name?: string | null
          phone?: string | null
          alternate_phone?: string | null
          address?: string | null
          relation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          class_id: string
          date: string
          status: 'present' | 'absent' | 'late'
          remarks: string | null
          marked_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          date: string
          status: 'present' | 'absent' | 'late'
          remarks?: string | null
          marked_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          date?: string
          status?: 'present' | 'absent' | 'late'
          remarks?: string | null
          marked_by?: string | null
          created_at?: string
        }
      }
      homework: {
        Row: {
          id: string
          class_id: string
          subject_id: string
          teacher_id: string
          title: string
          description: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          subject_id: string
          teacher_id: string
          title: string
          description?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          subject_id?: string
          teacher_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      homework_files: {
        Row: {
          id: string
          homework_id: string
          file_url: string
          file_name: string
          file_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          homework_id: string
          file_url: string
          file_name: string
          file_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          homework_id?: string
          file_url?: string
          file_name?: string
          file_type?: string | null
          created_at?: string
        }
      }
      fees: {
        Row: {
          id: string
          class_id: string
          fee_type: 'tuition' | 'transport' | 'exam' | 'other'
          amount: number
          academic_year: string
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          fee_type: 'tuition' | 'transport' | 'exam' | 'other'
          amount: number
          academic_year: string
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          fee_type?: 'tuition' | 'transport' | 'exam' | 'other'
          amount?: number
          academic_year?: string
          due_date?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          student_id: string
          fee_id: string
          amount_paid: number
          payment_date: string
          payment_method: string | null
          transaction_id: string | null
          status: string
          remarks: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          fee_id: string
          amount_paid: number
          payment_date: string
          payment_method?: string | null
          transaction_id?: string | null
          status: string
          remarks?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          fee_id?: string
          amount_paid?: number
          payment_date?: string
          payment_method?: string | null
          transaction_id?: string | null
          status?: string
          remarks?: string | null
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          name: string
          class_id: string
          subject_id: string
          exam_date: string | null
          total_marks: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          class_id: string
          subject_id: string
          exam_date?: string | null
          total_marks: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          class_id?: string
          subject_id?: string
          exam_date?: string | null
          total_marks?: number
          created_at?: string
        }
      }
      marks: {
        Row: {
          id: string
          exam_id: string
          student_id: string
          marks_obtained: number | null
          grade: string | null
          remarks: string | null
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          student_id: string
          marks_obtained?: number | null
          grade?: string | null
          remarks?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          student_id?: string
          marks_obtained?: number | null
          grade?: string | null
          remarks?: string | null
          created_at?: string
        }
      }
      report_cards: {
        Row: {
          id: string
          student_id: string
          class_id: string
          exam_name: string
          academic_year: string
          total_marks: number
          percentage: number | null
          grade: string | null
          remarks: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          exam_name: string
          academic_year: string
          total_marks: number
          percentage?: number | null
          grade?: string | null
          remarks?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          exam_name?: string
          academic_year?: string
          total_marks?: number
          percentage?: number | null
          grade?: string | null
          remarks?: string | null
          file_url?: string | null
          created_at?: string
        }
      }
      timetables: {
        Row: {
          id: string
          class_id: string
          day_of_week: string
          period_number: number
          subject_id: string
          teacher_id: string
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          day_of_week: string
          period_number: number
          subject_id: string
          teacher_id: string
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          day_of_week?: string
          period_number?: number
          subject_id?: string
          teacher_id?: string
          start_time?: string
          end_time?: string
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          target_audience: string | null
          created_by: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type: string
          target_audience?: string | null
          created_by: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string
          target_audience?: string | null
          created_by?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
      }
      chat_groups: {
        Row: {
          id: string
          class_id: string
          name: string
          type: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          name: string
          type: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          name?: string
          type?: string
          created_by?: string
          created_at?: string
        }
      }
      chat_group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          group_id: string
          content: string
          message_type: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          group_id: string
          content: string
          message_type?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          group_id?: string
          content?: string
          message_type?: string | null
          file_url?: string | null
          created_at?: string
        }
      }
    }
      contact_submissions: {
        Row: {
          id: string
          full_name: string
          email: string
          subject: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          subject: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          subject?: string
          message?: string
          created_at?: string
        }
      }
      admission_inquiries: {
        Row: {
          id: string
          parent_name: string
          email: string
          phone: string
          child_name: string
          child_age: string
          program: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_name: string
          email: string
          phone: string
          child_name: string
          child_age: string
          program: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_name?: string
          email?: string
          phone?: string
          child_name?: string
          child_age?: string
          program?: string
          message?: string | null
          created_at?: string
        }
      }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'teacher' | 'parent'
      attendance_status: 'present' | 'absent' | 'late'
      fee_type: 'tuition' | 'transport' | 'exam' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
