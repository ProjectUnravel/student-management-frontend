import { useState, useEffect } from "react";
import{Link} from 'react-router-dom';
import {teamApi} from '../services/api';
import { Team } from "../types";
import { MetaData, PaginationRequest } from "../types/ApiResponse";
import Pagination from "./Pagination";

const TeamsList = () => {
    const [teams, setTeams] = useState<Team[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState('');
      const [metaData, setMetaData] = useState<MetaData | null>(null);
      const [pagination, setPagination] = useState<PaginationRequest>({
        pageIndex: 1,
        pageSize: 20,
        search: '',
        sortBy: 'name',
        sortDescending: false
      });

    useEffect(() => {
        loadTeams();
    }, [pagination]);

    const loadTeams = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await teamApi.getAll(pagination);

            if(!response.data.status && !response.data.results){
                setError(response.data.message || 'Failed to load teams');
                return;
            }

            setTeams(response.data.results || []);
            setMetaData(response.data.metaData || null)
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to load teams');
        }finally{
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
      if (window.confirm('Are you sure you want to delete this team?')) {
        try {
          const response = await teamApi.delete(id);
          if (response.data.status) {
            setTeams(teams.filter(team => team.id !== id));
          } else {
            setError(response.data.message || 'Failed to delete team');
          }
        } catch (error: any) {
          setError(error.response?.data?.message || 'Failed to delete team');
        }
      }
    };

      if (loading)
        return <div className="loading">Loading teams...</div>;


        return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Teams</h2>
          <Link to="/teams/new" className="btn btn-primary">
            Add New Team
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="search-controls">
          <input
            type="text"
            placeholder="Search teams..."
            value={pagination.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="form-control"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {teams.length === 0 && !loading ? (
          <p>No teams found. <Link to="/teams/new">Add the first team</Link></p>
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
                        onClick={() => handleSort('name')} 
                        className="btn-link"
                      >
                        Name {pagination.sortBy === 'name' && (pagination.sortDescending ? '↓' : '↑')}
                      </button>
                    </th>
                    <th>Description</th>
                    <th>
                      <button 
                        onClick={() => handleSort('createdAt')} 
                        className="btn-link"
                      >
                        CreatedOn {pagination.sortBy === 'createdAt' && (pagination.sortDescending ? '↓' : '↑')}
                      </button>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td>{team.name}</td>
                      <td>{team.description || 'N/A'}</td>
                      <td>{new Date(team.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          <Link 
                            to={`/teams/edit/${team.id}`} 
                            className="btn btn-primary"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(team.id)}
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

export default TeamsList;