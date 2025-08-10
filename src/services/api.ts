import axios from 'axios';
import { Student, Course, CourseRegistration, Attendance, ClockInRequest, ClockOutRequest, CreateAttendance, UpdateAttendance, Team, CreateTeam, TeamMembers, AssignTeam, UnassignTeam, Task, CreateTask, UpdateTask, TaskScore, CreateTaskScore, UpdateTaskScore } from '../types';
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
    console.log(courseId)
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

export const teamApi = {
  getAll: (pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if(pagination?.pageIndex) params.append('pageIndex', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    if (pagination?.search) params.append('search', pagination.search);
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortDescending) params.append('sortDescending', pagination.sortDescending.toString());

    return api.get<ApiResponse<Team[]>>(`/team?${params.toString()}`);

  },

  getById: (id: string) => api.get<ApiResponse<Team>>(`/team/${id}`),
  create: (team: CreateTeam) => api.post<ApiResponse<any>>('/team', team),
  update: (id: string, team: CreateTeam) => api.put<ApiResponse<any>>(`/team/${id}`, team),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/team/${id}`)
}

export const teamMembersApi = {
  getAllTeamMembers: (teamId: string, pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if(pagination?.pageIndex) params.append('pageIndex', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    if (pagination?.search) params.append('search', pagination.search);
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortDescending) params.append('sortDescending', pagination.sortDescending.toString());

    return api.get<ApiResponse<TeamMembers>>(`/team-members/${teamId}?${params.toString()}`);

  },

  assign: (data: AssignTeam) => api.put<ApiResponse<any>>(`/team-members/assign`, data),
   unassign: (data: UnassignTeam) => api.put<ApiResponse<any>>(`/team-members/unassign`, data)
}

// Tasks API
export const tasksApi = {
  getAll: (pagination?: PaginationRequest) => {
    const params = new URLSearchParams();
    if (pagination?.pageIndex) params.append('page', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    if (pagination?.search) params.append('search', pagination.search);
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortDescending) {
      params.append('sortOrder', pagination.sortDescending ? 'desc' : 'asc');
    }
    
    return api.get<ApiResponse<Task[]>>(`/task?${params.toString()}`);
  },
  getById: (id: string) => api.get<ApiResponse<Task>>(`/task/${id}`),
  create: (task: CreateTask) => api.post<ApiResponse<Task>>('/task', task),
  update: (id: string, task: UpdateTask) => api.put<ApiResponse<Task>>(`/task/${id}`, task),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/task/${id}`),
};

// Task Scores API
export const taskScoresApi = {
  getAll: (pagination?: PaginationRequest & { taskId?: string; studentId?: string }) => {
    const params = new URLSearchParams();
    if (pagination?.pageIndex) params.append('page', pagination.pageIndex.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
    if (pagination?.search) params.append('search', pagination.search);
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortDescending) {
      params.append('sortOrder', pagination.sortDescending ? 'desc' : 'asc');
    }
    if (pagination?.taskId) params.append('taskId', pagination.taskId);
    if (pagination?.studentId) params.append('studentId', pagination.studentId);
    
    return api.get<ApiResponse<TaskScore[]>>(`/taskscore?${params.toString()}`);
  },
  getById: (id: string) => api.get<ApiResponse<TaskScore>>(`/taskscore/${id}`),
  create: (taskScore: CreateTaskScore) => api.post<ApiResponse<TaskScore>>('/taskscore', taskScore),
  update: (id: string, taskScore: UpdateTaskScore) => api.put<ApiResponse<TaskScore>>(`/taskscore/${id}`, taskScore),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/taskscore/${id}`),
};