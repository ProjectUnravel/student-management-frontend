import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentsApi } from '../services/api';
//import { Student } from '../types';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [student, setStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadStudent(id);
    }
  }, [id, isEditing]);

  const loadStudent = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await studentsApi.getById(studentId);
      
      if (response.data.status && response.data.results) {
        const studentData = response.data.results;
        setStudent({
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email,
          phoneNumber: studentData.phoneNumber,
          gender: studentData.gender,
        });
      } else {
        setError(response.data.message || 'Failed to load student data');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!student.firstName || !student.lastName || !student.email || !student.gender) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing && id) {
        const response = await studentsApi.update(id, student);
        if (response.data.status) {
          setSuccess('Student updated successfully!');
        } else {
          setError(response.data.message || 'Failed to update student');
          return;
        }
      } else {
        const response = await studentsApi.create(student);
        if (response.data.status) {
          setSuccess('Student registered successfully!');
          setStudent({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            gender: '',
          });
        } else {
          setError(response.data.message || 'Failed to create student');
          return;
        }
      }
      
      setTimeout(() => {
        navigate('/students');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  if (loading && isEditing) {
    return <div className="loading">Loading student data...</div>;
  }

  return (
    <div className="card">
      <h2>{isEditing ? 'Edit Student' : 'Student Registration'}</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={student.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={student.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={student.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={student.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={student.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Student' : 'Register Student'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/students')}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistration;