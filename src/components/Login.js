import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authResult, setAuthResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAuthResult(null);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified,
        displayName: userCredential.user.displayName || 'User',
        providerId: 'password'
      };
      
      setAuthResult(userData);
      
    } catch (error) {
      console.error('Login error:', error.code);
      
      setError(
        error.code === 'auth/invalid-credential' 
          ? 'Invalid email or password' 
          : `Login failed. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      setAuthResult(null);
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        providerId: 'google.com',
        googleId: result.user.providerData[0].uid
      };
      
      setAuthResult(userData);
    } catch (error) {
      console.error('Google sign in error:', error.code);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled. Please try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Please wait for the current sign in to complete.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Welcome Back</h1>
      
      {authResult && (
        <div className="auth-result">
          <h3>Authentication Successful!</h3>
          <p><strong>User ID:</strong> {authResult.uid}</p>
          <p><strong>Provider:</strong> {authResult.providerId}</p>
          <p><strong>Name:</strong> {authResult.displayName}</p>
          <p><strong>Email:</strong> {authResult.email}</p>
        </div>
      )}
      
      {!authResult && (
        <>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            {error && <p className="error-message">{error}</p>}
            
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="social-button google-button"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              Continue with Google
            </button>
          </div>

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Login; 