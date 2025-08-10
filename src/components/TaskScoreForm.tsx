import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskScoresApi, tasksApi, courseRegistrationsApi } from '../services/api';
import { TaskScore, CreateTaskScore, UpdateTaskScore, Task, Student } from '../types';
import { ApiResponse } from '../types/ApiResponse';

const TaskScoreForm: React.FC = () => {
  const navigate = useNavigate();
  const { taskId, id } = useParams<{ taskId?: string; id?: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<CreateTaskScore>({
    taskId: taskId || '',
    studentId: '',
    score: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  //const [students, setStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    if (isEditing && id) {
      fetchTaskScore(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (formData.taskId) {
      const task = tasks.find(t => t.id === formData.taskId);
      setSelectedTask(task || null);
      if (task) {
        fetchEnrolledStudents(task.courseId);
      }
    } else {
      setSelectedTask(null);
      setAvailableStudents([]);
    }
  }, [formData.taskId, tasks]);

  const fetchTasks = async () => {
    try {
      const response = await tasksApi.getAll({ pageIndex: 1, pageSize: 100 });
      const result = response.data as ApiResponse<Task[]>;
      
      if (result.status) {
        setTasks(result.results || []);
      } else {
        setError(result.message || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError('Error fetching tasks: ' + (err.response?.data?.message || err.message));
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchEnrolledStudents = async (courseId: string) => {
    try {
      const response = await courseRegistrationsApi.getByCourse(courseId, { pageIndex: 1, pageSize: 100 });
      const result = response.data as ApiResponse<any[]>;
      
      if (result.status) {
        const enrolledStudents = result.results?.map((reg: any) => reg.student).filter(Boolean) || [];
        setAvailableStudents(enrolledStudents);
      } else {
        setError(result.message || 'Failed to fetch enrolled students');
      }
    } catch (err: any) {
      setError('Error fetching enrolled students: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchTaskScore = async (scoreId: string) => {
    try {
      setLoading(true);
      const response = await taskScoresApi.getById(scoreId);
      const result = response.data as ApiResponse<TaskScore>;
      
      if (result.status && result.results) {
        const taskScore = result.results;
        setFormData({
          taskId: taskScore.taskId,
          studentId: taskScore.studentId,
          score: taskScore.score,
        });
      } else {
        setError(result.message || 'Failed to fetch task score');
      }
    } catch (err: any) {
      setError('Error fetching task score: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const validateScore = () => {
    if (!selectedTask) return true;
    
    if (formData.score < 0) {
      setValidationError('Score cannot be negative');
      return false;
    }
    
    if (formData.score > selectedTask.maxObtainableScore) {
      setValidationError(`Score cannot exceed the maximum obtainable score of ${selectedTask.maxObtainableScore}`);
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskId) {
      setError('Task selection is required');
      return;
    }
    
    if (!formData.studentId) {
      setError('Student selection is required');
      return;
    }
    
    if (!validateScore()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditing && id) {
        const updateData: UpdateTaskScore = {
          score: formData.score,
        };
        
        const response = await taskScoresApi.update(id, updateData);
        const result = response.data as ApiResponse<TaskScore>;
        
        if (result.status) {
          navigate(taskId ? `/tasks/${taskId}/scores` : '/task-scores');
        } else {
          setError(result.message || 'Failed to update task score');
        }
      } else {
        const response = await taskScoresApi.create(formData);
        const result = response.data as ApiResponse<TaskScore>;
        
        if (result.status) {
          navigate(taskId ? `/tasks/${taskId}/scores` : '/task-scores');
        } else {
          setError(result.message || 'Failed to create task score');
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message;
      
      // Handle specific validation errors from the backend
      if (errorMessage.includes('not enrolled')) {
        setError('The selected student is not enrolled in the course associated with this task.');
      } else if (errorMessage.includes('exceed')) {
        setError('The score exceeds the maximum obtainable score for this task.');
      } else if (errorMessage.includes('already exists')) {
        setError('A score already exists for this student and task. Please edit the existing score instead.');
      } else {
        setError('Error saving task score: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'score' ? parseFloat(value) || 0 : value,
    }));
    
    if (name === 'score') {
      // Clear validation error when user starts typing
      setValidationError(null);
    }
  };

  const handleScoreBlur = () => {
    validateScore();
  };

  if (tasksLoading) return <div className="loading">Loading...</div>;

  const getBackPath = () => {
    if (taskId) return `/tasks/${taskId}/scores`;
    return '/task-scores';
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1>{isEditing ? 'Edit Task Score' : 'Add New Task Score'}</h1>
        </div>

        {error && <div className="error">{error}</div>}
        {validationError && <div className="error">{validationError}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="taskId" className="form-label">
              Task *
            </label>
            <select
              id="taskId"
              name="taskId"
              value={formData.taskId}
              onChange={handleChange}
              className="form-control"
              required
              disabled={isEditing || Boolean(taskId)} // Disable if editing or taskId is provided in URL
            >
              <option value="">Select a task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} (Max: {task.maxObtainableScore} points) - {task.course?.courseTitle}
                </option>
              ))}
            </select>
            {(isEditing || taskId) && (
              <small className="form-text text-muted">
                Task cannot be changed when editing to maintain data integrity
              </small>
            )}
          </div>

          {selectedTask && (
            <div className="info-panel">
              <h4>Task Information</h4>
              <p><strong>Course:</strong> {selectedTask.course?.courseTitle}</p>
              <p><strong>Maximum Score:</strong> {selectedTask.maxObtainableScore} points</p>
              {selectedTask.description && (
                <p><strong>Description:</strong> {selectedTask.description}</p>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="studentId" className="form-label">
              Student * {availableStudents.length > 0 && <span className="text-muted">({availableStudents.length} enrolled students)</span>}
            </label>
            <select
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="form-control"
              required
              disabled={isEditing || availableStudents.length === 0}
            >
              <option value="">
                {availableStudents.length === 0 
                  ? (formData.taskId ? 'No students enrolled in this course' : 'Select a task first')
                  : 'Select a student'
                }
              </option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} ({student.email})
                </option>
              ))}
            </select>
            {isEditing && (
              <small className="form-text text-muted">
                Student cannot be changed when editing
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="score" className="form-label">
              Score *
              {selectedTask && (
                <span className="text-muted"> (0 - {selectedTask.maxObtainableScore} points)</span>
              )}
            </label>
            <input
              type="number"
              id="score"
              name="score"
              value={formData.score}
              onChange={handleChange}
              onBlur={handleScoreBlur}
              className={`form-control ${validationError ? 'error' : ''}`}
              required
              min="0"
              max={selectedTask?.maxObtainableScore || undefined}
              step="0.1"
              placeholder={selectedTask ? `Enter score (0 - ${selectedTask.maxObtainableScore})` : 'Enter score'}
            />
            {selectedTask && formData.score > 0 && (
              <small className="form-text">
                Percentage: {((formData.score / selectedTask.maxObtainableScore) * 100).toFixed(1)}%
              </small>
            )}
          </div>

          <div className="btn-group">
            <button
              type="button"
              onClick={() => navigate(getBackPath())}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(validationError) || availableStudents.length === 0}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Score' : 'Add Score')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskScoreForm;