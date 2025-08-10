import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tasksApi, coursesApi } from '../services/api';
import { Task, CreateTask, UpdateTask, Course } from '../types';
import { ApiResponse } from '../types/ApiResponse';

const TaskForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<CreateTask>({
    title: '',
    description: '',
    courseId: '',
    maxObtainableScore: 0,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    if (isEditing && id) {
      fetchTask(id);
    }
  }, [id, isEditing]);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll({ pageIndex: 1, pageSize: 100 });
      const result = response.data as ApiResponse<Course[]>;
      
      if (result.status) {
        setCourses(result.results || []);
      } else {
        setError(result.message || 'Failed to fetch courses');
      }
    } catch (err: any) {
      setError('Error fetching courses: ' + (err.response?.data?.message || err.message));
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchTask = async (taskId: string) => {
    try {
      setLoading(true);
      const response = await tasksApi.getById(taskId);
      const result = response.data as ApiResponse<Task>;
      
      if (result.status && result.results) {
        const task = result.results;
        setFormData({
          title: task.title,
          description: task.description || '',
          courseId: task.courseId,
          maxObtainableScore: task.maxObtainableScore,
        });
      } else {
        setError(result.message || 'Failed to fetch task');
      }
    } catch (err: any) {
      setError('Error fetching task: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.courseId) {
      setError('Course selection is required');
      return;
    }
    
    if (formData.maxObtainableScore <= 0) {
      setError('Max obtainable score must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditing && id) {
        const updateData: UpdateTask = {
          title: formData.title,
          description: formData.description,
          maxObtainableScore: formData.maxObtainableScore,
        };
        
        const response = await tasksApi.update(id, updateData);
        const result = response.data as ApiResponse<Task>;
        
        if (result.status) {
          navigate('/tasks');
        } else {
          setError(result.message || 'Failed to update task');
        }
      } else {
        const response = await tasksApi.create(formData);
        const result = response.data as ApiResponse<Task>;
        
        if (result.status) {
          navigate('/tasks');
        } else {
          setError(result.message || 'Failed to create task');
        }
      }
    } catch (err: any) {
      setError('Error saving task: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxObtainableScore' ? parseFloat(value) || 0 : value,
    }));
  };

  if (coursesLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1>{isEditing ? 'Edit Task' : 'Create New Task'}</h1>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows={4}
              maxLength={1000}
              placeholder="Optional description for the task..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="courseId" className="form-label">
              Course *
            </label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="form-control"
              required
              disabled={isEditing} // Prevent course change during editing to maintain score validity
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.courseTitle}
                </option>
              ))}
            </select>
            {isEditing && (
              <small className="form-text text-muted">
                Course cannot be changed when editing to maintain score validity
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="maxObtainableScore" className="form-label">
              Maximum Obtainable Score *
            </label>
            <input
              type="number"
              id="maxObtainableScore"
              name="maxObtainableScore"
              value={formData.maxObtainableScore}
              onChange={handleChange}
              className="form-control"
              required
              min="0.1"
              step="0.1"
              placeholder="Enter maximum score (e.g., 100)"
            />
          </div>

          <div className="btn-group">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;