import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAuthResult(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: formData.fullName,
        authProvider: 'email',
        createdAt: new Date().toISOString()
      };
      
      setAuthResult(userData);
      
    } catch (error) {
      console.error('Signup error:', error.code);
      setError(error.code === 'auth/email-already-in-use' 
        ? 'This email is already registered.' 
        : 'Failed to create account. Please try again.');
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
      
      // Force account selection even if already logged in
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      console.log('=============================================');
      console.log('GOOGLE AUTH UID:', result.user.uid);
      console.log('=============================================');
      
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        providerId: 'google.com'
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
    <div className="signup-container">
      <h1 className="signup-title">Create Account</h1>
      
      {authResult && (
        <div className="auth-result">
          <h3>Account Created Successfully!</h3>
          <p><strong>User ID:</strong> {authResult.uid}</p>
          <p><strong>Provider:</strong> {authResult.providerId || authResult.authProvider}</p>
          <p><strong>Name:</strong> {authResult.displayName}</p>
          <p><strong>Email:</strong> {authResult.email}</p>
        </div>
      )}
      
      {!authResult && (
        <>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            
            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
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
          
          <div className="login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default SignUp; 