import { useState } from 'react'
import './Login.css'

interface User {
  name: string;
  email: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

interface Credentials {
  email: string;
  password: string;
}

function Login({ onLogin }: LoginProps) {
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simple validation for demo purposes
      if (credentials.email && credentials.password) {
        onLogin({
          name: credentials.email.split('@')[0],
          email: credentials.email
        })
      } else {
        setError('Please enter both email and password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img 
            src={`${import.meta.env.BASE_URL}images/Niche Logo Green.png`}
            alt="Niche Logo" 
            className="login-logo"
          />
          <h1>Market Intelligence</h1>
          <p>Please sign in to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Demo credentials: any email and password</p>
        </div>
      </div>
    </div>
  )
}

export default Login