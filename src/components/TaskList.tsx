import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../services/api';
import { Task } from '../types';
import { PaginationRequest, ApiResponse } from '../types/ApiResponse';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDescending, setSortDescending] = useState(true);

  const fetchTasks = async (page = 1) => {
    try {
      setLoading(true);
      const params: PaginationRequest = {
        pageIndex: page,
        pageSize: 10,
        search: search || undefined,
        sortBy,
        sortDescending,
      };
      
      const response = await tasksApi.getAll(params);
      const result = response.data as ApiResponse<Task[]>;
      
      if (result.status) {
        setTasks(result.results || []);
        setCurrentPage(page);
        setTotalPages(result.metaData?.totalPages || 1);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError('Error fetching tasks: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(1);
  }, [search, sortBy, sortDescending]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchTasks(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await tasksApi.delete(id);
      const result = response.data as ApiResponse<any>;
      
      if (result.status) {
        setTasks(tasks.filter(task => task.id !== id));
      } else {
        setError(result.message || 'Failed to delete task');
      }
    } catch (err: any) {
      setError('Error deleting task: ' + (err.response?.data?.message || err.message));
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

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <div className="card-header">
        <h1>Tasks</h1>
        <Link to="/tasks/new" className="btn btn-primary">
          Add New Task
        </Link>
      </div>

      <div className="card">
        <div className="search-controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
            />
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>
        </div>

        {tasks.length === 0 ? (
          <p className="text-center">No tasks found.</p>
        ) : (
          <>
            <div className="mobile-scroll-hint">
              📱 Swipe left to see more columns
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleSort('title')}
                      style={{ cursor: 'pointer' }}
                    >
                      Title {sortBy === 'title' && (sortDescending ? '↓' : '↑')}
                    </th>
                    <th>Description</th>
                    <th 
                      onClick={() => handleSort('coursetitle')}
                      style={{ cursor: 'pointer' }}
                    >
                      Course {sortBy === 'coursetitle' && (sortDescending ? '↓' : '↑')}
                    </th>
                    <th 
                      onClick={() => handleSort('maxscore')}
                      style={{ cursor: 'pointer' }}
                    >
                      Max Score {sortBy === 'maxscore' && (sortDescending ? '↓' : '↑')}
                    </th>
                    <th>Scores Count</th>
                    <th 
                      onClick={() => handleSort('createdAt')}
                      style={{ cursor: 'pointer' }}
                    >
                      Created {sortBy === 'createdAt' && (sortDescending ? '↓' : '↑')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="font-medium">{task.title}</td>
                      <td className="description-cell">
                        {task.description || 'No description'}
                      </td>
                      <td>{task.course?.courseTitle || 'N/A'}</td>
                      <td>{task.maxObtainableScore}</td>
                      <td>{task.taskScoresCount}</td>
                      <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/tasks/${task.id}`} className="btn btn-sm btn-info">
                            View
                          </Link>
                          <Link to={`/tasks/${task.id}/edit`} className="btn btn-sm btn-warning">
                            Edit
                          </Link>
                          <Link to={`/tasks/${task.id}/scores`} className="btn btn-sm btn-success">
                            Scores
                          </Link>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="btn btn-sm btn-danger"
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

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => fetchTasks(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchTasks(currentPage + 1)}
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

export default TaskList;