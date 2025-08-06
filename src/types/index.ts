export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  createdAt: string;
  courseRegistrations?: CourseRegistration[];
  attendances?: Attendance[];
}

export interface Course {
  id: string;
  courseCode: string;
  courseTitle: string;
  createdAt: string;
  courseRegistrations?: CourseRegistration[];
  courseRegistrationCount: number
}

export interface CourseRegistration {
  id: string;
  studentId: string;
  courseId: string;
  createdAt: string;
  student?: Student;
  course?: Course;
}

export interface Attendance {
  id: string;
  studentId: string;
  clockIn: string | null;
  clockOut: string | null;
  createdAt: string;
  student?: Student;
  courseId: string;
  course?: Course;
}

export interface ClockInRequest {
  studentId: string;
  courseId: string;
}

export interface ClockOutRequest {
  studentId: string;
  courseId: string;
}

export interface CreateAttendance {
  studentId: string;
  clockIn?: string | null;
  clockOut?: string | null;
  courseId: string
}

export interface UpdateAttendance {
  clockIn?: string | null;
  clockOut?: string | null;
}