import { useState, useEffect } from 'react';
import { studentsApi, coursesApi, courseRegistrationsApi } from '../services/api';
import { Student, Course, CourseRegistration } from '../types';
import { MetaData, PaginationRequest } from '../types/ApiResponse';
import Pagination from './Pagination';

const CourseAssignment = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [viewCourseStudents, setCourseStudents] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [pagination, setPagination] = useState<PaginationRequest>({
    pageIndex: 1,
    pageSize: 20,
    search: '',
    sortBy: 'createdAt',
    sortDescending: true
  });

  useEffect(() => {
    loadInitialData();
  }, []);
  
  useEffect(() => {
    if(viewCourseStudents)
      loadRegistrations();

  }, [viewCourseStudents, pagination]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, coursesResponse] = await Promise.all([
        studentsApi.getAll({ pageSize: 100 }),
        coursesApi.getAll({ pageSize: 100 })
      ]);

      if (studentsResponse.data.status && studentsResponse.data.results) {
        setStudents(studentsResponse.data.results);
      }
      if (coursesResponse.data.status && coursesResponse.data.results) {
        setCourses(coursesResponse.data.results);
        setCourseStudents(coursesResponse.data.results[0].id);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadRegistrations = async () => {
    try {
      // console.log(viewCourseStudents, "CourseId")
      const registrationsResponse = await courseRegistrationsApi.getByCourse(viewCourseStudents, pagination);
      
      if (registrationsResponse.data.status && registrationsResponse.data.results) {
        setRegistrations(registrationsResponse.data.results);
        setMetaData(registrationsResponse.data.metaData || null);
      } else {
        setError(registrationsResponse.data.message || 'Failed to load registrations');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load registrations');
    }
  };
  
  const handlePageChange = (pageIndex: number) => {
    setPagination(prev => ({ ...prev, pageIndex }));
  };

  const handleSearch = (searchTerm: string) => {
    setPagination(prev => ({ ...prev, search: searchTerm, pageIndex: 1 }));
  };

  const handleSort = (sortBy: string) => {
    setPagination(prev => ({
      ...prev,
      sortBy,
      sortDescending: prev.sortBy === sortBy ? !prev.sortDescending : false,
      pageIndex: 1
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedStudent || !selectedCourse) {
      setError('Please select both student and course');
      return;
    }

    try {
      setLoading(true);
      
      const newRegistration = {
        studentId: selectedStudent,
        courseId: selectedCourse,
      };

      const response = await courseRegistrationsApi.create(newRegistration);
      
      if (response.data.status) {
        setSuccess('Student assigned to course successfully!');
        
        // Reload registrations
        setCourseStudents(selectedCourse);
        
        // Clear form
        setSelectedStudent('');
        setSelectedCourse('');
      } else {
        setError(response.data.message || 'Failed to assign student to course');
      }
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign student to course');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (registrationId: string) => {
    if (window.confirm('Are you sure you want to unassign this student from the course?')) {
      try {
        const response = await courseRegistrationsApi.delete(registrationId);
        
        if (response.data.status) {
          setSuccess('Student unassigned successfully!');
          // Reload registrations to reflect the change
          loadRegistrations();
        } else {
          setError(response.data.message || 'Failed to unassign student');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to unassign student');
      }
    }
  };

  const getStudentName = (registration: CourseRegistration) => {
    // Use the student data from the registration DTO if available
    if (registration.student) {
      return `${registration.student.firstName} ${registration.student.lastName}`;
    }
    // Fallback to looking it up in the students array
    const student = students.find(s => s.id === registration.studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getCourseInfo = (registration: CourseRegistration) => {
    // Use the course data from the registration DTO if available
    if (registration.course) {
      return `${registration.course.courseCode} - ${registration.course.courseTitle}`;
    }
    // Fallback to looking it up in the courses array
    const course = courses.find(c => c.id === registration.courseId);
    return course ? `${course.courseCode} - ${course.courseTitle}` : 'Unknown Course';
  };

  if (loading && students.length === 0) {
    return <div className="loading">Loading data...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2>Assign Course to Student</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="student">Select Student *</label>
              <select
                id="student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="course">Select Course *</label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Course'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Current Course Assignments</h2>

        <form onSubmit={loadRegistrations}>
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="student">Pick course *</label>
              <select
                id="team"
                value={viewCourseStudents}
                onChange={(e) => setCourseStudents(e.target.value)}
                required
              >
                <option value="">Choose a Team...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
        
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search assignments..."
            value={pagination.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="form-control"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {registrations.length === 0 ? (
          <p>No course assignments found.</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button 
                      onClick={() => handleSort('student')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Student {pagination.sortBy === 'student' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>
                    <button 
                      onClick={() => handleSort('course')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Course {pagination.sortBy === 'course' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>
                    <button 
                      onClick={() => handleSort('createdAt')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Assigned Date {pagination.sortBy === 'createdAt' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{getStudentName(registration)}</td>
                    <td>{getCourseInfo(registration)}</td>
                    <td>{new Date(registration.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleUnassign(registration.id)}
                        className="btn btn-danger"
                      >
                        Unassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {metaData && <Pagination metaData={metaData} onPageChange={handlePageChange} />}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseAssignment;