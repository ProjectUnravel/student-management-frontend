import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamApi } from '../services/api';
import { CreateTeam } from '../types';

const TeamsEditor = () => {
    const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [team, setTeam] = useState<CreateTeam>({
    name: '',
    description: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadTeam(id);
    }
  }, [id, isEditing]);

    const loadTeam = async (teamId: string) => {
    try {
      setLoading(true);
      const response = await teamApi.getById(teamId);
      
      if (response.data.status && response.data.results) {
        const teamData = response.data.results;
        setTeam({
          name: teamData.name,
          description: teamData.description || '',
        });
      } else {
        setError(response.data.message || 'Failed to load team data');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!team.name || !team.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing && id) {
        const response = await teamApi.update(id, team);
        if (response.data.status) {
          setSuccess('team updated successfully!');
        } else {
          setError(response.data.message || 'Failed to update team');
          return;
        }
      } else {
        const response = await teamApi.create(team);
        if (response.data.status) {
          setSuccess(response.data.message || 'Team created successfully!');
          setTeam({
            name: '',
            description: '',
          });
        } else {
          setError(response.data.message || 'Failed to create team');
          return;
        }
      }
      
      setTimeout(() => {
        navigate('/teams');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTeam({
      ...team,
      [e.target.name]: e.target.value,
    });
  };

  if (loading && isEditing)
    return <div className="loading"> Loading teams data...</div>


    return (
    <div className="card">
      <h2>{isEditing ? 'Edit Team' : 'Create Team'}</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={team.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={team.description}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Team' : 'Create Team'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/teams')}
            style={{ marginLeft: '1rem' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
  
}

export default TeamsEditor;