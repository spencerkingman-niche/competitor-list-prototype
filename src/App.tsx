import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './components/Login'
import MapView from './components/MapView'
import Summary from './components/Summary'
import Navigation from './components/Navigation'
import './App.css'

interface User {
  name: string;
  email: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (userData: User) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navigation onLogout={handleLogout} user={user} />}
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/app" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/app" 
            element={
              isAuthenticated ? 
                <MapView /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/summary" 
            element={
              isAuthenticated ? 
                <Summary /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App