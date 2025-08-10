import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tasksApi } from '../services/api';
import { Task } from '../types';
import { ApiResponse } from '../types/ApiResponse';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTask(id);
    }
  }, [id]);

  const fetchTask = async (taskId: string) => {
    try {
      const response = await tasksApi.getById(taskId);
      const result = response.data as ApiResponse<Task>;
      
      if (result.status) {
        setTask(result.results || null);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch task');
      }
    } catch (err: any) {
      setError('Error fetching task: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task? All associated scores will also be deleted.')) {
      return;
    }

    try {
      const response = await tasksApi.delete(task.id);
      const result = response.data as ApiResponse<any>;
      
      if (result.status) {
        navigate('/tasks');
      } else {
        setError(result.message || 'Failed to delete task');
      }
    } catch (err: any) {
      setError('Error deleting task: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="loading">Loading task...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!task) return <div className="error">Task not found</div>;

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1>Task Details</h1>
          <div className="btn-group">
            <Link to="/tasks" className="btn btn-secondary">
              Back to Tasks
            </Link>
            <Link to={`/tasks/${task.id}/edit`} className="btn btn-warning">
              Edit Task
            </Link>
            <Link to={`/tasks/${task.id}/scores`} className="btn btn-success">
              View Scores
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              Delete Task
            </button>
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-grid">
            <div className="detail-item">
              <label className="detail-label">Title:</label>
              <span className="detail-value">{task.title}</span>
            </div>

            <div className="detail-item">
              <label className="detail-label">Course:</label>
              <span className="detail-value">
                {task.course ? (
                  <Link to={`/courses/${task.course.id}`} className="link">
                    {task.course.courseCode} - {task.course.courseTitle}
                  </Link>
                ) : (
                  'Course not found'
                )}
              </span>
            </div>

            <div className="detail-item">
              <label className="detail-label">Maximum Score:</label>
              <span className="detail-value font-medium">
                {task.maxObtainableScore} points
              </span>
            </div>

            <div className="detail-item">
              <label className="detail-label">Total Scores:</label>
              <span className="detail-value">
                {task.taskScoresCount} score(s) recorded
              </span>
            </div>

            <div className="detail-item">
              <label className="detail-label">Created:</label>
              <span className="detail-value">
                {new Date(task.createdAt).toLocaleString()}
              </span>
            </div>

            {task.description && (
              <div className="detail-item detail-item-full">
                <label className="detail-label">Description:</label>
                <div className="detail-value description-content">
                  {task.description}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="action-section">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <Link 
              to={`/tasks/${task.id}/scores/new`} 
              className="action-card btn btn-primary"
            >
              <h4>Add New Score</h4>
              <p>Record a score for a student on this task</p>
            </Link>
            
            <Link 
              to={`/tasks/${task.id}/scores`} 
              className="action-card btn btn-info"
            >
              <h4>View All Scores</h4>
              <p>See all {task.taskScoresCount} recorded scores</p>
            </Link>
            
            <Link 
              to={`/courses/${task.courseId}/students`} 
              className="action-card btn btn-secondary"
            >
              <h4>View Course Students</h4>
              <p>See students enrolled in this course</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;