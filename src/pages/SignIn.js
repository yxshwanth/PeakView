import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import backgroundImage from './images/background.jpg'; // Local background image

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const styles = {
    background: {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    websiteTitle: {
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '48px',
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 'bold',
      color: '#ffffff',
      textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
    },
    container: {
      padding: '20px',
      maxWidth: '400px',
      width: '90%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    title: {
      textAlign: 'center',
      color: '#3f51b5',
    },
    inputContainer: {
      position: 'relative',
      marginBottom: '15px',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    passwordToggle: {
      position: 'absolute',
      top: '50%',
      right: '10px',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      fontSize: '16px',
      color: '#333',
    },
    errorMessage: {
      color: 'red',
      fontSize: '12px',
      marginTop: '-10px',
      marginBottom: '10px',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#3f51b5',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    link: {
      color: '#3f51b5',
      textDecoration: 'none',
    },
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? '' : 'Invalid email format';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email') {
      const emailError = validateEmail(value);
      setErrors((prevErrors) => ({ ...prevErrors, email: emailError }));
    }

    if (name === 'password') {
      setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!errors.email && formData.password) {
      try {
        const response = await axios.post('/auth/login/', {
          email: formData.email,
          password: formData.password,
        });

        if (response.status === 200 || response.status === 201) {
          // Sign in successful: store email in localStorage
          localStorage.setItem('userEmail', formData.email);

          // Navigate to dashboard or account page
          navigate('/dashboard/inventory');
        }
      } catch (error) {
        if (error.response) {
          const errorMsg = error.response.data.message || 'Login failed';
          console.error('Server error:', error.response);

          if (errorMsg.toLowerCase().includes('password')) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              password: 'Wrong password. Please try again.',
            }));
          } else if (errorMsg.toLowerCase().includes('exist')) {
            const goToSignUp = window.confirm(
              'User does not exist. Would you like to create an account?'
            );
            if (goToSignUp) {
              navigate('/signup');
            }
          } else {
            alert(`Error: ${errorMsg}`);
          }
        } else if (error.request) {
          console.error('Network error:', error.request);
          alert('Network error: Unable to reach the server.');
        } else {
          console.error('Error:', error.message);
          alert('Unexpected error occurred.');
        }
      }
    } else {
      alert('Please correct the errors.');
    }
  };

  return (
    <div style={styles.background}>
      <h1 style={styles.websiteTitle}>PeakView</h1>
      <div style={styles.container}>
        <h2 style={styles.title}>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputContainer}>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              style={styles.input}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {errors.email && <p style={styles.errorMessage}>{errors.email}</p>}
          <div style={styles.inputContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              style={styles.input}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              style={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
          {errors.password && <p style={styles.errorMessage}>{errors.password}</p>}
          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          Don't have an account? <Link to="/signup" style={styles.link}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;