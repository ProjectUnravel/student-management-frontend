import { useState, useEffect } from 'react';
import { studentsApi, attendanceApi } from '../services/api';
import { Student, Attendance } from '../types';

const AttendanceManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, attendancesResponse] = await Promise.all([
        studentsApi.getAll({ pageSize: 100 }),
        attendanceApi.getAll({ pageSize: 100 })
      ]);

      if (studentsResponse.data.status && studentsResponse.data.results) {
        setStudents(studentsResponse.data.results);
      }
      if (attendancesResponse.data.status && attendancesResponse.data.results) {
        setAttendances(attendancesResponse.data.results);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await attendanceApi.clockIn({ studentId: selectedStudent });
      
      if (response.data.status) {
        setSuccess('Student clocked in successfully!');
        
        // Reload attendance data
        const attendancesResponse = await attendanceApi.getAll({ pageSize: 100 });
        if (attendancesResponse.data.status && attendancesResponse.data.results) {
          setAttendances(attendancesResponse.data.results);
        }
      } else {
        setError(response.data.message || 'Failed to clock in');
      }
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await attendanceApi.clockOut({ studentId: selectedStudent });
      
      if (response.data.status) {
        setSuccess('Student clocked out successfully!');
        
        // Reload attendance data
        const attendancesResponse = await attendanceApi.getAll({ pageSize: 100 });
        if (attendancesResponse.data.status && attendancesResponse.data.results) {
          setAttendances(attendancesResponse.data.results);
        }
      } else {
        setError(response.data.message || 'Failed to clock out');
      }
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to clock out');
    } finally {
      setLoading(false);
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
  
  const getStudentNameById = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const isStudentClockedIn = (studentId: string) => {
    return attendances.some(att => 
      att.studentId === studentId && 
      att.clockIn && 
      !att.clockOut
    );
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getTodayAttendances = () => {
    const today = new Date().toDateString();
    return attendances.filter(att => 
      new Date(att.createdAt).toDateString() === today
    );
  };

  if (loading && students.length === 0) {
    return <div className="loading">Loading data...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2>Taking Attendance</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-group">
          <label htmlFor="student">Select Student</label>
          <select
            id="student"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Choose a student...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} ({student.email})
                {isStudentClockedIn(student.id) && ' - Currently Clocked In'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <button 
            onClick={handleClockIn} 
            className="btn btn-success" 
            disabled={loading || !selectedStudent || isStudentClockedIn(selectedStudent)}
            style={{ marginRight: '1rem' }}
          >
            {loading ? 'Processing...' : 'Clock In'}
          </button>
          
          <button 
            onClick={handleClockOut} 
            className="btn btn-danger" 
            disabled={loading || !selectedStudent || !isStudentClockedIn(selectedStudent)}
          >
            {loading ? 'Processing...' : 'Clock Out'}
          </button>
        </div>

        {selectedStudent && (
          <div className="alert alert-info">
            Selected Student: {getStudentNameById(selectedStudent)}
            <br />
            Status: {isStudentClockedIn(selectedStudent) ? 
              <span className="attendance-status active">Clocked In</span> : 
              <span className="attendance-status inactive">Not Clocked In</span>
            }
          </div>
        )}
      </div>

      <div className="card">
        <h2>Today's Attendance</h2>

        {getTodayAttendances().length === 0 ? (
          <p>No attendance records for today.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {getTodayAttendances().map((attendance) => (
                <tr key={attendance.id}>
                  <td>{getStudentName(attendance)}</td>
                  <td>{formatDateTime(attendance.clockIn)}</td>
                  <td>{formatDateTime(attendance.clockOut)}</td>
                  <td>
                    {attendance.clockIn && !attendance.clockOut ? (
                      <span className="attendance-status active">Active</span>
                    ) : attendance.clockIn && attendance.clockOut ? (
                      <span className="attendance-status inactive">Completed</span>
                    ) : (
                      <span className="attendance-status inactive">Not Started</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;