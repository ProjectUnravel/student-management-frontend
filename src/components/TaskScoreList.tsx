import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { taskScoresApi, tasksApi } from '../services/api';
import { TaskScore, Task } from '../types';
import { PaginationRequest, ApiResponse } from '../types/ApiResponse';

const TaskScoreList: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [taskScores, setTaskScores] = useState<TaskScore[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDescending, setSortDescending] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchTask(taskId);
    }
    fetchTaskScores(1);
  }, [taskId, search, sortBy, sortDescending]);

  const fetchTask = async (id: string) => {
    try {
      const response = await tasksApi.getById(id);
      const result = response.data as ApiResponse<Task>;
      
      if (result.status) {
        setTask(result.results || null);
      }
    } catch (err: any) {
      console.error('Error fetching task:', err);
    }
  };

  const fetchTaskScores = async (page = 1) => {
    try {
      setLoading(true);
      const params: PaginationRequest & { taskId?: string } = {
        pageIndex: page,
        pageSize: 10,
        search: search || undefined,
        sortBy,
        sortDescending,
        ...(taskId && { taskId }),
      };
      
      const response = await taskScoresApi.getAll(params);
      const result = response.data as ApiResponse<TaskScore[]>;
      
      if (result.status) {
        setTaskScores(result.results || []);
        setCurrentPage(page);
        setTotalPages(result.metaData?.totalPages || 1);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch task scores');
      }
    } catch (err: any) {
      setError('Error fetching task scores: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchTaskScores(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this score?')) return;

    try {
      const response = await taskScoresApi.delete(id);
      const result = response.data as ApiResponse<any>;
      
      if (result.status) {
        setTaskScores(taskScores.filter(score => score.id !== id));
        // Update task scores count if we have the task loaded
        if (task) {
          setTask(prev => prev ? { ...prev, taskScoresCount: prev.taskScoresCount - 1 } : null);
        }
      } else {
        setError(result.message || 'Failed to delete task score');
      }
    } catch (err: any) {
      setError('Error deleting task score: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(field);
      setSortDescending(true);
    }
  };

  if (loading) return <div className="loading">Loading task scores...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <div className="card-header">
        <div>
          <h1>Task Scores</h1>
          {task && (
            <p className="text-muted">
              Scores for: <strong>{task.title}</strong> (Max: {task.maxObtainableScore} points)
            </p>
          )}
        </div>
        <div className="btn-group">
          <Link to="/tasks" className="btn btn-secondary">
            Back to Tasks
          </Link>
          {taskId && (
            <Link to={`/tasks/${taskId}`} className="btn btn-info">
              View Task
            </Link>
          )}
          <Link 
            to={taskId ? `/tasks/${taskId}/scores/new` : "/task-scores/new"} 
            className="btn btn-primary"
          >
            Add New Score
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="search-controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by student name, task title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
            />
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>
        </div>

        {taskScores.length === 0 ? (
          <p className="text-center">No scores found for this task.</p>
        ) : (
          <>
            <div className="mobile-scroll-hint">
              📱 Swipe left to see more columns
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {!taskId && (
                      <th 
                        onClick={() => handleSort('tasktitle')}
                        style={{ cursor: 'pointer' }}
                      >
                        Task {sortBy === 'tasktitle' && (sortDescending ? '↓' : '↑')}
                      </th>
                    )}
                    <th 
                      onClick={() => handleSort('studentname')}
                      style={{ cursor: 'pointer' }}
                    >
                      Student {sortBy === 'studentname' && (sortDescending ? '↓' : '↑')}
                    </th>
                    <th 
                      onClick={() => handleSort('score')}
                      style={{ cursor: 'pointer' }}
                    >
                      Score {sortBy === 'score' && (sortDescending ? '↓' : '↑')}
                    </th>
                    <th>Percentage</th>
                    <th 
                      onClick={() => handleSort('createdAt')}
                      style={{ cursor: 'pointer' }}
                    >
                      Scored On {sortBy === 'createdAt' && (sortDescending ? '↓' : '↑')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {taskScores.map((taskScore) => {
                    const percentage = taskScore.task 
                      ? ((taskScore.score / taskScore.task.maxObtainableScore) * 100).toFixed(1)
                      : 'N/A';
                      
                    return (
                      <tr key={taskScore.id}>
                        {!taskId && (
                          <td className="font-medium">
                            {taskScore.task ? (
                              <Link to={`/tasks/${taskScore.task.id}`} className="link">
                                {taskScore.task.title}
                              </Link>
                            ) : (
                              'Task not found'
                            )}
                          </td>
                        )}
                        <td className="font-medium">
                          {taskScore.student ? (
                            <Link to={`/students/${taskScore.student.id}`} className="link">
                              {taskScore.student.firstName} {taskScore.student.lastName}
                            </Link>
                          ) : (
                            'Student not found'
                          )}
                        </td>
                        <td className="score-cell">
                          <span className="score-value">{taskScore.score}</span>
                          {taskScore.task && (
                            <span className="max-score">/ {taskScore.task.maxObtainableScore}</span>
                          )}
                        </td>
                        <td>
                          <span className={`percentage ${percentage !== 'N/A' && parseFloat(percentage) >= 70 ? 'good' : 'needs-improvement'}`}>
                            {percentage}%
                          </span>
                        </td>
                        <td>{new Date(taskScore.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group">
                            <Link 
                              to={`/task-scores/${taskScore.id}/edit`} 
                              className="btn btn-sm btn-warning"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(taskScore.id)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => fetchTaskScores(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchTaskScores(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskScoreList;