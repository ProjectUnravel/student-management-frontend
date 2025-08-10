import { useState } from 'react';
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
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskDetail from './components/TaskDetail';
import TaskScoreList from './components/TaskScoreList';
import TaskScoreForm from './components/TaskScoreForm';

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isGroupActive = (paths: string[]) => paths.some(path => isActive(path));

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      // If clicking on already expanded group, collapse it
      if (prev[groupName]) {
        return {};
      }
      // Otherwise, close all groups and open the clicked one
      return { [groupName]: true };
    });
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <h1>Student Management</h1>
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className={`nav-group dropdown ${isGroupActive(['/students']) ? 'active' : ''} ${!expandedGroups.students ? 'collapsed' : ''}`}>
            <div 
              className="nav-group-title dropdown-toggle"
              onClick={() => toggleGroup('students')}
            >
              Students
              <span className={`dropdown-arrow ${!expandedGroups.students ? 'collapsed' : ''}`}>▼</span>
            </div>
            <div className="dropdown-menu">
              <Link 
                to="/students" 
                className={isActive('/students') ? 'active' : ''}
                onClick={closeMenu}
              >
                View Students
              </Link>
              <Link 
                to="/students/new" 
                className={isActive('/students/new') ? 'active' : ''}
                onClick={closeMenu}
              >
                Add Student
              </Link>
            </div>
          </div>

          <div className={`nav-group dropdown ${isGroupActive(['/courses', '/course-assignment']) ? 'active' : ''} ${!expandedGroups.courses ? 'collapsed' : ''}`}>
            <div 
              className="nav-group-title dropdown-toggle"
              onClick={() => toggleGroup('courses')}
            >
              Courses
              <span className={`dropdown-arrow ${!expandedGroups.courses ? 'collapsed' : ''}`}>▼</span>
            </div>
            <div className="dropdown-menu">
              <Link 
                to="/courses" 
                className={isActive('/courses') ? 'active' : ''}
                onClick={closeMenu}
              >
                View Courses
              </Link>
              <Link 
                to="/courses/new" 
                className={isActive('/courses/new') ? 'active' : ''}
                onClick={closeMenu}
              >
                Add Course
              </Link>
              <Link 
                to="/course-assignment" 
                className={isActive('/course-assignment') ? 'active' : ''}
                onClick={closeMenu}
              >
                Course Assignment
              </Link>
            </div>
          </div>

          <div className={`nav-group dropdown ${isGroupActive(['/tasks', '/task-scores']) ? 'active' : ''} ${!expandedGroups.tasks ? 'collapsed' : ''}`}>
            <div 
              className="nav-group-title dropdown-toggle"
              onClick={() => toggleGroup('tasks')}
            >
              Tasks
              <span className={`dropdown-arrow ${!expandedGroups.tasks ? 'collapsed' : ''}`}>▼</span>
            </div>
            <div className="dropdown-menu">
              <Link 
                to="/tasks" 
                className={isActive('/tasks') ? 'active' : ''}
                onClick={closeMenu}
              >
                View Tasks
              </Link>
              <Link 
                to="/tasks/new" 
                className={isActive('/tasks/new') ? 'active' : ''}
                onClick={closeMenu}
              >
                Add Task
              </Link>
              <Link 
                to="/task-scores" 
                className={isActive('/task-scores') ? 'active' : ''}
                onClick={closeMenu}
              >
                Task Scores
              </Link>
            </div>
          </div>

          <div className={`nav-group dropdown ${isGroupActive(['/teams', '/assign-teams']) ? 'active' : ''} ${!expandedGroups.teams ? 'collapsed' : ''}`}>
            <div 
              className="nav-group-title dropdown-toggle"
              onClick={() => toggleGroup('teams')}
            >
              Teams
              <span className={`dropdown-arrow ${!expandedGroups.teams ? 'collapsed' : ''}`}>▼</span>
            </div>
            <div className="dropdown-menu">
              <Link 
                to="/teams" 
                className={isActive('/teams') ? 'active' : ''}
                onClick={closeMenu}
              >
                View Teams
              </Link>
              <Link 
                to="/teams/new" 
                className={isActive('/teams/new') ? 'active' : ''}
                onClick={closeMenu}
              >
                Add Team
              </Link>
              <Link 
                to="/assign-teams" 
                className={isActive('/assign-teams') ? 'active' : ''}
                onClick={closeMenu}
              >
                Assign Teams
              </Link>
            </div>
          </div>

          <div className={`nav-group dropdown ${isGroupActive(['/attendance', '/attendance-list']) ? 'active' : ''} ${!expandedGroups.attendance ? 'collapsed' : ''}`}>
            <div 
              className="nav-group-title dropdown-toggle"
              onClick={() => toggleGroup('attendance')}
            >
              Attendance
              <span className={`dropdown-arrow ${!expandedGroups.attendance ? 'collapsed' : ''}`}>▼</span>
            </div>
            <div className="dropdown-menu">
              <Link 
                to="/attendance" 
                className={isActive('/attendance') && !isActive('/attendance-list') ? 'active' : ''}
                onClick={closeMenu}
              >
                Clock In/Out
              </Link>
              <Link 
                to="/attendance-list" 
                className={isActive('/attendance-list') ? 'active' : ''}
                onClick={closeMenu}
              >
                Attendance Records
              </Link>
            </div>
          </div>
        </div>
        <div 
          className={`navbar-overlay ${isMenuOpen ? 'active' : ''}`}
          onClick={closeMenu}
        ></div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="app-layout">
          <main className="main-content">
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
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
                <Route path="/tasks/:taskId/scores" element={<TaskScoreList />} />
                <Route path="/tasks/:taskId/scores/new" element={<TaskScoreForm />} />
                <Route path="/task-scores" element={<TaskScoreList />} />
                <Route path="/task-scores/new" element={<TaskScoreForm />} />
                <Route path="/task-scores/:id/edit" element={<TaskScoreForm />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;