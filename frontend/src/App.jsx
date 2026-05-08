import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TeamsPage from './pages/TeamsPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import { apiGetProfile } from './api';
import { useAuth } from './hooks/useAuth';
import ProfileIcon from './components/ProfileIcon';
import HamburgerIcon from './components/HamburgerIcon';
import './styles/App.css';
/*
function RequireAuth() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}
  */

function RequireAuth() {
  return <Outlet />;
}


function LoginPageWrapper({ login }) {
  const navigate = useNavigate();
  return (
    <LoginPage
      onLogin={token => { login(token); navigate('/'); }}
      onSwitchToRegister={() => navigate('/register')}
    />
  );
}

function RegisterPageWrapper() {
  const navigate = useNavigate();
  return (
    <RegisterPage
      onRegister={() => navigate('/login')}
      onSwitchToLogin={() => navigate('/login')}
    />
  );
}

function App() {
  const { isLoggedIn, logout, login } = useAuth();
  const location = useLocation();
  const hideHeader = location && (location.pathname === '/login' || location.pathname === '/register');
  const [showDropdown, setShowDropdown] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    setShowDropdown(false);
    setCurrentUser(null);
    navigate('/login');
  };

  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      try {
        const me = await apiGetProfile();
        if (mounted) setCurrentUser(me);
      } catch {
        // If token is invalid, api layer will clear it and RequireAuth will redirect
        if (mounted) setCurrentUser(null);
      }
    }
    if (isLoggedIn) loadMe();
    return () => { mounted = false; };
  }, [isLoggedIn]);

  const currentUserLabel = currentUser?.displayName || currentUser?.username || '';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const navLinks = (
    <>
      <NavLink to="/" className={({isActive}) => `nav-link text-white font-medium ${isActive ? 'underline decoration-2 underline-offset-4' : ''}`} onClick={() => setDrawerOpen(false)}>Dashboard</NavLink>
      <NavLink to="/teams" className={({isActive}) => `nav-link text-white font-medium ${isActive ? 'underline decoration-2 underline-offset-4' : ''}`} onClick={() => setDrawerOpen(false)}>Teams</NavLink>
      <NavLink to="/tasks" className={({isActive}) => `nav-link text-white font-medium ${isActive ? 'underline decoration-2 underline-offset-4' : ''}`} onClick={() => setDrawerOpen(false)}>Tasks</NavLink>
    </>
  );

  if (hideHeader) {
    // Render a minimal layout for auth pages so the form sits on a single background
    return (
      <div className="min-h-screen text-text flex items-center justify-center">
        <Routes>
          <Route path="/login" element={<LoginPageWrapper login={login} />} />
          <Route path="/register" element={<RegisterPageWrapper />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface text-text">
      {/* top header always visible */}
      <header className="fixed top-0 left-0 w-full bg-primary-dark z-50 relative">
        <div className="app-header flex items-center gap-4 py-3">
          <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-md hover:bg-primary/10 md:hidden text-white">
            <HamburgerIcon />
          </button>
          <div className="flex items-center gap-4 flex-1">
            <NavLink to="/" className="text-white font-bold text-lg header-brand">TaskManager</NavLink>
            <nav className="hidden md:flex gap-4">{navLinks}</nav>
          </div>
        </div>

        <div className="header-profile absolute right-4 top-1/2 transform -translate-y-1/2">
          {isLoggedIn ? (
            <div className="profile-dropdown" ref={dropdownRef}>
              <button className="profile-btn text-white flex items-center gap-2" onClick={() => setShowDropdown(v => !v)}>
                <ProfileIcon />
                {currentUserLabel ? (
                  <span className="hidden sm:inline text-sm font-medium max-w-[10rem] truncate">{currentUserLabel}</span>
                ) : null}
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                  <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
                <div className="hidden md:flex gap-3">
                  <NavLink to="/login" className="nav-link text-white">Login</NavLink>
              <NavLink to="/register" className="bg-accent text-white px-3 py-1 rounded">Register</NavLink>
            </div>
          )}
        </div>
      </header>

      {/* mobile drawer for small screens */}
      <div className={`side-drawer ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}>
        <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
          <nav className="drawer-nav">
            <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'text-primary font-semibold' : ''}`} onClick={() => setDrawerOpen(false)}>Dashboard</NavLink>
            <NavLink to="/teams" className={({isActive}) => `nav-link ${isActive ? 'text-primary font-semibold' : ''}`} onClick={() => setDrawerOpen(false)}>Teams</NavLink>
            <NavLink to="/tasks" className={({isActive}) => `nav-link ${isActive ? 'text-primary font-semibold' : ''}`} onClick={() => setDrawerOpen(false)}>Tasks</NavLink>
            {isLoggedIn ? (
              <>
                <NavLink to="/profile" className="nav-link" onClick={() => setDrawerOpen(false)}>Profile</NavLink>
                <button className="nav-link" onClick={() => handleLogout()}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link" onClick={() => setDrawerOpen(false)}>Login</NavLink>
                <NavLink to="/register" className="nav-link" onClick={() => setDrawerOpen(false)}>Register</NavLink>
              </>
            )}
          </nav>
        </div>
      </div>

      <main className="app-container">
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPageWrapper login={login} />} />
            <Route path="/register" element={<RegisterPageWrapper />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
