import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import StudentRegistration from './components/StudentRegistration';
import CourseRegistration from './components/CourseRegistration';
import CourseAssignment from './components/CourseAssignment';
import AttendanceManagement from './components/AttendanceManagement';
import StudentList from './components/StudentList';
import CourseList from './components/CourseList';
import AttendanceList from './components/AttendanceList';
import TeamsList from './components/TeamsList';
import TeamsEditor from './components/TeamsEditor';
import AssignTeams from './components/AssignTeams';

function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container">
        <h1>Student Management System</h1>
        <nav>
          <ul>
            <li>
              <Link to="/students" className={isActive('/students') ? 'active' : ''}>
                Students
              </Link>
            </li>
             <li>
              <Link to="/teams" className={isActive('/teams') ? 'active' : ''}>
                Teams
              </Link>
            </li>
             <li>
              <Link to="/assign-teams" className={isActive('/assign-teams') ? 'active' : ''}>
                Assign Teams
              </Link>
            </li>
            <li>
              <Link to="/courses" className={isActive('/courses') ? 'active' : ''}>
                Courses
              </Link>
            </li>
            <li>
              <Link to="/course-assignment" className={isActive('/course-assignment') ? 'active' : ''}>
                Course Assignment
              </Link>
            </li>
            <li>
              <Link to="/attendance" className={isActive('/attendance') ? 'active' : ''}>
                Attendance
              </Link>
            </li>
            <li>
              <Link to="/attendance-list" className={isActive('/attendance-list') ? 'active' : ''}>
                Attendance Records
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<StudentList />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/teams" element={<TeamsList />} />
            <Route path="/teams/new" element={<TeamsEditor />} />
            <Route path="/teams/edit/:id" element={<TeamsEditor />} />
            <Route path="/students/new" element={<StudentRegistration />} />
            <Route path="/students/edit/:id" element={<StudentRegistration />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/new" element={<CourseRegistration />} />
            <Route path="/courses/edit/:id" element={<CourseRegistration />} />
            <Route path="/course-assignment" element={<CourseAssignment />} />
            <Route path="/assign-teams" element={<AssignTeams />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/attendance-list" element={<AttendanceList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;