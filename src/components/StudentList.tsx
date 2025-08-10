import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentsApi } from '../services/api';
import { Student } from '../types';
import { MetaData, PaginationRequest } from '../types/ApiResponse';
import Pagination from './Pagination';

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [pagination, setPagination] = useState<PaginationRequest>({
    pageIndex: 1,
    pageSize: 20,
    search: '',
    sortBy: 'firstName',
    sortDescending: false
  });

  useEffect(() => {
    loadStudents();
  }, [pagination]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentsApi.getAll(pagination);
      if (response.data.status && response.data.results) {
        setStudents(response.data.results);
        setMetaData(response.data.metaData || null);
      } else {
        setError(response.data.message || 'Failed to load students');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await studentsApi.delete(id);
        if (response.data.status) {
          setStudents(students.filter(student => student.id !== id));
        } else {
          setError(response.data.message || 'Failed to delete student');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Students</h2>
          <Link to="/students/new" className="btn btn-primary">
            Add New Student
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="search-controls">
          <input
            type="text"
            placeholder="Search students..."
            value={pagination.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="form-control"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {students.length === 0 && !loading ? (
          <p>No students found. <Link to="/students/new">Add the first student</Link></p>
        ) : (
          <>
            <div className="mobile-scroll-hint">
              📱 Swipe left to see more columns
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <button 
                        onClick={() => handleSort('firstName')} 
                        className="btn-link"
                      >
                        Name {pagination.sortBy === 'firstName' && (pagination.sortDescending ? '↓' : '↑')}
                      </button>
                    </th>
                    <th>
                      <button 
                        onClick={() => handleSort('email')} 
                        className="btn-link"
                      >
                        Email {pagination.sortBy === 'email' && (pagination.sortDescending ? '↓' : '↑')}
                      </button>
                    </th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>
                      <button 
                        onClick={() => handleSort('createdAt')} 
                        className="btn-link"
                      >
                        Registered {pagination.sortBy === 'createdAt' && (pagination.sortDescending ? '↓' : '↑')}
                      </button>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.email}</td>
                      <td>{student.phoneNumber || 'N/A'}</td>
                      <td>{student.gender}</td>
                      <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          <Link 
                            to={`/students/edit/${student.id}`} 
                            className="btn btn-primary"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(student.id)}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {metaData && <Pagination metaData={metaData} onPageChange={handlePageChange} />}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentList;