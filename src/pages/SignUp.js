import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import backgroundImage from './images/background.jpg'; // Ensure this path exists

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const styles = {
    background: {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      width: '100vw',
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
    scrollContainer: {
      position: 'absolute',
      top: '100px',
      left: '0',
      right: '0',
      bottom: '0',
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
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
      color: '#1a73e8',
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
    passwordStrength: {
      fontSize: '12px',
      marginTop: '-10px',
      marginBottom: '15px',
      color: isPasswordStrong ? 'green' : 'red',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: isPasswordStrong ? '#1a73e8' : '#cccccc',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: isPasswordStrong ? 'pointer' : 'not-allowed',
    },
    link: {
      color: '#1a73e8',
      textDecoration: 'none',
    },
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? '' : 'Invalid email format';
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone)
      ? ''
      : 'Invalid phone number format. Include country code and 10-15 digits.';
  };

  const validatePasswordStrength = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= 15 && hasUpperCase && hasNumber && hasSpecialChar) {
      setPasswordStrength('Strong');
      setIsPasswordStrong(true);
    } else {
      setPasswordStrength('Weak');
      setIsPasswordStrong(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let error = '';
    if (name === 'email') error = validateEmail(value);
    if (name === 'phone') error = validatePhone(value);
    setErrors({ ...errors, [name]: error });

    if (name === 'password') validatePasswordStrength(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    if (!emailError && !phoneError && passwordStrength === 'Strong') {
      try {
        // Create the user
        const response = await axios.post('/users/', {
          email: formData.email,
          password: formData.password,
        });

        if (response.status === 200 || response.status === 201) {
          // After successful user creation, create their profile
          try {
            const profileResponse = await axios.post('/users/profile', {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              dob: formData.dob,
              phone: parseInt(formData.phone, 10),
              gender: formData.gender
            });

            if (profileResponse.status === 200 || profileResponse.status === 201) {
              alert('Sign up successful! Please sign in now.');
              navigate('/signin');
            } else {
              alert('User created, but profile creation failed. Please try signing in and completing your profile later.');
              navigate('/signin');
            }
          } catch (profileError) {
            console.error('Profile creation error:', profileError);
            alert('Failed to create profile. Please try again later.');
          }
        }
      } catch (error) {
        if (error.response) {
          const errorMsg = error.response.data.message || 'Failed to sign up.';
          console.error('Server error:', error.response);
          if (errorMsg.toLowerCase().includes('email')) {
            const goToSignIn = window.confirm(
              'Email already exists. Would you like to go to the Sign In page?'
            );
            if (goToSignIn) {
              navigate('/signin');
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
      setErrors({
        email: emailError,
        phone: phoneError,
      });
    }
  };

  return (
    <div style={styles.background}>
      <h1 style={styles.websiteTitle}>PeakView</h1>
      <div style={styles.scrollContainer}>
        <div style={styles.container}>
          <h2 style={styles.title}>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                style={styles.input}
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                style={styles.input}
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="dob"
                placeholder="Date of Birth (e.g., 5th March 2002)"
                style={styles.input}
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
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
                type="tel"
                name="phone"
                placeholder="Phone Number (Include country code, e.g., +1)"
                style={styles.input}
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            {errors.phone && <p style={styles.errorMessage}>{errors.phone}</p>}
            <div style={styles.inputContainer}>
              <select
                name="gender"
                style={styles.input}
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
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
            <p style={styles.passwordStrength}>Password strength: {passwordStrength}</p>
            <button type="submit" style={styles.button} disabled={!isPasswordStrong}>
              Sign Up
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '15px' }}>
            Already have an account? <Link to="/signin" style={styles.link}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;