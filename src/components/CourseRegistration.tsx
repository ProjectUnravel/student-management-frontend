import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursesApi } from '../services/api';
import { Course } from '../types';

const CourseRegistration = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [course, setCourse] = useState({
    courseCode: '',
    courseTitle: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadCourse(id);
    }
  }, [id, isEditing]);

  const loadCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await coursesApi.getById(courseId);
      
      if (response.data.status && response.data.results) {
        const courseData = response.data.results;
        setCourse({
          courseCode: courseData.courseCode,
          courseTitle: courseData.courseTitle,
        });
      } else {
        setError(response.data.message || 'Failed to load course data');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!course.courseCode || !course.courseTitle) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing && id) {
        const response = await coursesApi.update(id, course);
        if (response.data.status) {
          setSuccess('Course updated successfully!');
        } else {
          setError(response.data.message || 'Failed to update course');
          return;
        }
      } else {
        const response = await coursesApi.create(course);
        if (response.data.status) {
          setSuccess('Course registered successfully!');
          setCourse({
            courseCode: '',
            courseTitle: '',
          });
        } else {
          setError(response.data.message || 'Failed to create course');
          return;
        }
      }
      
      setTimeout(() => {
        navigate('/courses');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourse({
      ...course,
      [e.target.name]: e.target.value,
    });
  };

  if (loading && isEditing) {
    return <div className="loading">Loading course data...</div>;
  }

  return (
    <div className="card">
      <h2>{isEditing ? 'Edit Course' : 'Course Registration'}</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="courseCode">Course Code *</label>
          <input
            type="text"
            id="courseCode"
            name="courseCode"
            value={course.courseCode}
            onChange={handleChange}
            placeholder="e.g., CS101"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="courseTitle">Course Title *</label>
          <input
            type="text"
            id="courseTitle"
            name="courseTitle"
            value={course.courseTitle}
            onChange={handleChange}
            placeholder="e.g., Introduction to Computer Science"
            required
          />
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Course' : 'Register Course'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/courses')}
            style={{ marginLeft: '1rem' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseRegistration;