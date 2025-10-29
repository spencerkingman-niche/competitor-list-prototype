import { Link, useLocation } from 'react-router-dom'

interface User {
  name: string;
  email: string;
}

interface NavigationProps {
  onLogout: () => void;
  user: User | null;
}

function Navigation({ onLogout, user }: NavigationProps) {
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <img 
          src={`${import.meta.env.BASE_URL}images/Niche Logo White.png`}
          alt="Niche Logo" 
          className="nav-logo"
        />
        <div className="nav-brand-text">
          <h3>Market Intelligence</h3>
          {user && <span>Welcome, {user.name}</span>}
        </div>
      </div>
      <div className="nav-links">
        <Link 
          to="/app" 
          className={location.pathname === '/app' ? 'active' : ''}
        >
          Map View
        </Link>
        <Link 
          to="/summary" 
          className={location.pathname === '/summary' ? 'active' : ''}
        >
          Summary
        </Link>
      </div>
      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>
    </nav>
  )
}

export default Navigation