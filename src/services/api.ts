import axios from 'axios';
import { Student, Course, CourseRegistration, Attendance, ClockInRequest, ClockOutRequest, CreateAttendance, UpdateAttendance } from '../types';
import { ApiResponse, PaginationRequest } from '../types/ApiResponse';

// const API_BASE_URL = 'https://localhost:44318/api';
const API_BASE_URL = 'http://student-portal-gateway.runasp.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Students API
export const studentsApi = {
  getAll: (pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if (pagination?.pageIndex) params.append('pageIndex', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    if (pagination?.search) params.append('search', pagination.search);
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortDescending) params.append('sortDescending', pagination.sortDescending.toString());
    
    return api.get<ApiResponse<Student[]>>(`/students?${params.toString()}`);
  },
  getById: (id: string) => api.get<ApiResponse<Student>>(`/students/${id}`),
  create: (student: Omit<Student, 'id' | 'createdAt'>) => api.post<ApiResponse<Student>>('/students', student),
  update: (id: string, student: Omit<Student, 'id' | 'createdAt'>) => api.put<ApiResponse<Student>>(`/students/${id}`, student),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/students/${id}`),
};

// Courses API
export const coursesApi = {
  getAll: (pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if (pagination?.pageIndex) params.append('pageIndex', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    if (pagination?.search) params.append('search', pagination.search);
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortDescending) params.append('sortDescending', pagination.sortDescending.toString());
    
    return api.get<ApiResponse<Course[]>>(`/courses?${params.toString()}`);
  },
  getById: (id: string) => api.get<ApiResponse<Course>>(`/courses/${id}`),
  create: (course: Omit<Course, 'id' | 'createdAt'>) => api.post<ApiResponse<Course>>('/courses', course),
  update: (id: string, course: Omit<Course, 'id' | 'createdAt'>) => api.put<ApiResponse<Course>>(`/courses/${id}`, course),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/courses/${id}`),
  getStudentOfferingCourse: (courseId: string) => api.get<ApiResponse<Student[]>>(`/courses/students/${courseId}`)
};

// Course Registrations API
export const courseRegistrationsApi = {
  getAll: (pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if (pagination?.pageIndex) params.append('pageIndex', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    if (pagination?.search) params.append('search', pagination.search);
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortDescending) params.append('sortDescending', pagination.sortDescending.toString());
    
    return api.get<ApiResponse<CourseRegistration[]>>(`/courseregistrations?${params.toString()}`);
  },
  getById: (id: string) => api.get<ApiResponse<CourseRegistration>>(`/courseregistrations/${id}`),
  getByStudent: (studentId: string, pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if (pagination?.pageIndex) params.append('pageIndex', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    
    return api.get<ApiResponse<CourseRegistration[]>>(`/courseregistrations/student/${studentId}?${params.toString()}`);
  },
  getByCourse: (courseId: string, pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if (pagination?.pageIndex) params.append('pageIndex', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    
    return api.get<ApiResponse<CourseRegistration[]>>(`/courseregistrations/course/${courseId}?${params.toString()}`);
  },
  create: (registration: Omit<CourseRegistration, 'id' | 'createdAt'>) => api.post<ApiResponse<CourseRegistration>>('/courseregistrations', registration),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/courseregistrations/${id}`),
};

// Attendance API
export const attendanceApi = {
  getAll: (pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if (pagination?.pageIndex) params.append('pageIndex', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    if (pagination?.search) params.append('search', pagination.search);
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortDescending) params.append('sortDescending', pagination.sortDescending.toString());
    
    return api.get<ApiResponse<Attendance[]>>(`/attendance?${params.toString()}`);
  },
  getById: (id: string) => api.get<ApiResponse<Attendance>>(`/attendance/${id}`),
  getByStudent: (studentId: string, pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if (pagination?.pageIndex) params.append('pageIndex', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    
    return api.get<ApiResponse<Attendance[]>>(`/attendance/student/${studentId}?${params.toString()}`);
  },
  create: (attendance: CreateAttendance) => api.post<ApiResponse<Attendance>>('/attendance', attendance),
  update: (id: string, attendance: UpdateAttendance) => api.put<ApiResponse<Attendance>>(`/attendance/${id}`, attendance),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/attendance/${id}`),
  clockIn: (request: ClockInRequest) => api.post<ApiResponse<Attendance>>('/attendance/clockin', request),
  clockOut: (request: ClockOutRequest) => api.post<ApiResponse<Attendance>>('/attendance/clockout', request),
};