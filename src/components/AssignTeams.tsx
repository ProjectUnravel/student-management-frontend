import { useState, useEffect } from 'react';
import { teamMembersApi, teamApi, studentsApi } from '../services/api';
import { Student, Team, TeamMembers } from '../types';
import { MetaData, PaginationRequest } from '../types/ApiResponse';
import Pagination from './Pagination';


const AssignTeams = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMembers | null>(null);
    const [students, setStudents] = useState<Student[]>([]);

    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [viewTeam, setTeamView] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [metaData, setMetaData] = useState<MetaData | null>(null);
    const [pagination, setPagination] = useState<PaginationRequest>({
        pageIndex: 1,
        pageSize: 20,
        search: '',
        sortBy: 'createdAt',
        sortDescending: true
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if(viewTeam)
            loadRegistrations();
    }, [viewTeam, pagination]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [teamsResponse, studentsResponse] = await Promise.all([
                teamApi.getAll({ pageSize: 100 }),
                studentsApi.getAll({ pageSize: 100 }),
            ]);

            if (teamsResponse.data.status && teamsResponse.data.results) {
                setTeams(teamsResponse.data.results);

                setTeamView(teamsResponse.data.results[0].id)
            }
            if (studentsResponse.data.status && studentsResponse.data.results) {
                setStudents(studentsResponse.data.results);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    const loadRegistrations = async () => {
        try {
            const teamMembersResponse = await teamMembersApi.getAllTeamMembers(viewTeam, pagination);

            if (teamMembersResponse.data.status && teamMembersResponse.data.results) {
                setTeamMembers(teamMembersResponse.data.results);
                setMetaData(teamMembersResponse.data.metaData || null);
            } else {
                setError(teamMembersResponse.data.message || 'Failed to load registrations');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to load registrations');
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


    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedStudent || !selectedTeam) {
            setError('Please select both student and team');
            return;
        }

        try {
            setLoading(true);

            const assignTeam = {
                studentId: selectedStudent,
                teamId: selectedTeam,
            };
            const response = await teamMembersApi.assign(assignTeam);

            if (response.data.status) {
                setSuccess(response.data.message || 'Student assigned to team successfully!');

                // Reload registrations
                setTeamView(selectedTeam)
               
                // Clear form
                setSelectedStudent('');
                setSelectedTeam('');
            } else {
                setError(response.data.message || 'Failed to assign student to course');
            }

        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to assign student to course');
        } finally {
            setLoading(false);
        }
    };

      const handleUnassign = async (teamId: string, studentId: string) => {
        if (window.confirm('Are you sure you want to unassign this student from the team?')) {
          try {
            const unassignTeam = {
                teamId: teamId,
                studentId: studentId,
            };
            const response = await teamMembersApi.unassign(unassignTeam);
            
            if (response.data.status) {
              setSuccess(response.data.message || 'Student unassigned successfully!');
              // Reload registrations to reflect the change
              setTeamView(teamId);
            } else {
              setError(response.data.message || 'Failed to unassign student');
            }
          } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to unassign student');
          }
        }
      };

       const getStudentName = (registration: Student) => {
          // Use the student data from the registration DTO if available
          if (registration) {
            return `${registration.firstName} ${registration.lastName}`;
          }
          // Fallback to looking it up in the students array
          //const student = students.find(s => s.id === registration.id);
          //return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
          return 'Unknown Student';
        };

        
  if (loading && students.length === 0) {
    return <div className="loading">Loading data...</div>;
  }


    return (
    <div>
      <div className="card">
        <h2>Assign Team to Student</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleAssign}>
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="student">Select Student *</label>
              <select
                id="student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="course">Select Team *</label>
              <select
                id="course"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                required
              >
                <option value="">Choose a team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Team'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Current Team Assignments</h2>

        <form onSubmit={loadRegistrations}>
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="student">Pick team *</label>
              <select
                id="team"
                value={viewTeam}
                onChange={(e) => setTeamView(e.target.value)}
                required
              >
                <option value="">Choose a Team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
        
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search assignments..."
            value={pagination.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="form-control"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {!teamMembers?.team ? (
          <p>No team assignments found.</p>
        ) : (
          <>
          <div>
            <p>Team {teamMembers.team.name}</p>
          </div>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button 
                      onClick={() => handleSort('student')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Student {pagination.sortBy === 'student' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>
                    <button 
                      onClick={() => handleSort('createdAt')} 
                      className="btn-link"
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Assigned Date {pagination.sortBy === 'createdAt' && (pagination.sortDescending ? '↓' : '↑')}
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.members.map((registration) => (
                  <tr key={registration.id}>
                    <td>{getStudentName(registration)}</td>
                    <td>{new Date(registration.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleUnassign(teamMembers.team.id, registration.id)}
                        className="btn btn-danger"
                      >
                        Unassign
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

}

export default AssignTeams;