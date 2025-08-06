import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../services/api';
import { Course } from '../types';
import { MetaData, PaginationRequest } from '../types/ApiResponse';
import Pagination from './Pagination';

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [pagination, setPagination] = useState<PaginationRequest>({
    pageIndex: 1,
    pageSize: 20,
    search: '',
    sortBy: 'courseCode',
    sortDescending: false
  });

  useEffect(() => {
    loadCourses();
  }, [pagination]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await coursesApi.getAll(pagination);
      if (response.data.status && response.data.results) {
        setCourses(response.data.results);
        setMetaData(response.data.metaData || null);
      } else {
        setError(response.data.message || 'Failed to load courses');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load courses');
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
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await coursesApi.delete(id);
        if (response.data.status) {
          setCourses(courses.filter(course => course.id !== id));
        } else {
          setError(response.data.message || 'Failed to delete course');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Courses</h2>
          <Link to="/courses/new" className="btn btn-primary">
            Add New Course
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={pagination.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="form-control"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {courses.length === 0 && !loading ? (
          <p>No courses found. <Link to="/courses/new">Add the first course</Link></p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button 
                      onClick={() => handleSort('courseCode')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Course Code {pagination.sortBy === 'courseCode' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>
                    <button 
                      onClick={() => handleSort('courseTitle')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Course Title {pagination.sortBy === 'courseTitle' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>Students Enrolled</th>
                  <th>
                    <button 
                      onClick={() => handleSort('createdAt')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Created {pagination.sortBy === 'createdAt' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseTitle}</td>
                    <td>{course.courseRegistrationCount}</td>
                    <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link 
                        to={`/courses/edit/${course.id}`} 
                        className="btn btn-primary"
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(course.id)}
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

export default CourseList;