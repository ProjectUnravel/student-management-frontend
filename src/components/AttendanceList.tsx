import { useState, useEffect } from 'react';
import { studentsApi, attendanceApi } from '../services/api';
import { Student, Attendance } from '../types';
import { MetaData, PaginationRequest } from '../types/ApiResponse';
import Pagination from './Pagination';

const AttendanceList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  //const [dateFilter, setDateFilter] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [pagination, setPagination] = useState<PaginationRequest>({
    pageIndex: 1,
    pageSize: 20,
    search: '',
    sortBy: 'createdAt',
    sortDescending: true
  });

  useEffect(() => {
    loadData();
  }, [pagination]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build search query combining selected student and general search
      let searchQuery = pagination.search || '';
      if (selectedStudent) {
        const student = students.find(s => s.id === selectedStudent);
        if (student) {
          searchQuery = `${student.firstName} ${student.lastName}`;
        }
      }
      
      const paginationWithSearch = {
        ...pagination,
        search: searchQuery
      };
      
      const attendancesResponse = await attendanceApi.getAll(paginationWithSearch);
      
      if (attendancesResponse.data.status && attendancesResponse.data.results) {
        setAttendances(attendancesResponse.data.results);
        setMetaData(attendancesResponse.data.metaData || null);
      } else {
        setError(attendancesResponse.data.message || 'Failed to load attendance records');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };
  
  const loadStudents = async () => {
    try {
      const studentsResponse = await studentsApi.getAll({ pageSize: 100 });
      if (studentsResponse.data.status && studentsResponse.data.results) {
        setStudents(studentsResponse.data.results);
      }
    } catch (error) {
      console.error('Failed to load students for filter');
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
  
  const handleStudentFilter = (studentId: string) => {
    setSelectedStudent(studentId);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        const response = await attendanceApi.delete(id);
        if (response.data.status) {
          // Reload data to reflect the change
          loadData();
        } else {
          setError(response.data.message || 'Failed to delete attendance record');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete attendance record');
      }
    }
  };

  const getStudentName = (attendance: Attendance) => {
    // Use the student data from the attendance DTO if available
    if (attendance.student) {
      return `${attendance.student.firstName} ${attendance.student.lastName}`;
    }
    // Fallback to looking it up in the students array
    const student = students.find(s => s.id === attendance.studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn || !clockOut) return 'N/A';
    
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  const clearFilters = () => {
    setSelectedStudent('');
    //setDateFilter('');
    setPagination(prev => ({ ...prev, search: '', pageIndex: 1 }));
  };

  if (loading) {
    return <div className="loading">Loading attendance records...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2>Attendance Records</h2>
        
        {error && <div className="alert alert-error">{error}</div>}

        {/* Filters and Search */}
        <div className="grid grid-3" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label htmlFor="searchFilter">Search Attendance</label>
            <input
              type="text"
              id="searchFilter"
              placeholder="Search by student name..."
              value={pagination.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="studentFilter">Filter by Student</label>
            <select
              id="studentFilter"
              value={selectedStudent}
              onChange={(e) => handleStudentFilter(e.target.value)}
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>&nbsp;</label>
            <button 
              onClick={clearFilters} 
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {attendances.length === 0 && !loading ? (
          <p>No attendance records found.</p>
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
                      onClick={() => handleSort('createdAt')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Date {pagination.sortBy === 'createdAt' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>
                    <button 
                      onClick={() => handleSort('clockin')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Clock In {pagination.sortBy === 'clockin' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>
                    <button 
                      onClick={() => handleSort('clockout')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Clock Out {pagination.sortBy === 'clockout' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td>{getStudentName(attendance)}</td>
                    <td>{new Date(attendance.createdAt).toLocaleDateString()}</td>
                    <td>{formatDateTime(attendance.clockIn)}</td>
                    <td>{formatDateTime(attendance.clockOut)}</td>
                    <td>{calculateDuration(attendance.clockIn, attendance.clockOut)}</td>
                    <td>
                      {attendance.clockIn && !attendance.clockOut ? (
                        <span className="attendance-status active">Active</span>
                      ) : attendance.clockIn && attendance.clockOut ? (
                        <span className="attendance-status inactive">Completed</span>
                      ) : (
                        <span className="attendance-status inactive">Not Started</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDelete(attendance.id)}
                        className="btn btn-danger"
                      >
                        Delete
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

export default AttendanceList;