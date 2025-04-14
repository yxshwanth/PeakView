import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Account = () => {
  const navigate = useNavigate();
  
  // Retrieve user email from localStorage (assuming set on SignIn)
  const email = localStorage.getItem('userEmail');
  
  const [userData, setUserData] = useState(null);
  const [avatar, setAvatar] = useState('👤'); // Default avatar
  const avatarOptions = ['👤', '😎', '🦊', '🐱', '🌸', '⭐', '🚀'];

  const styles = {
    background: {
      background: 'linear-gradient(to bottom right, #6a11cb, #2575fc)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Roboto', sans-serif",
    },
    container: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '30px',
      maxWidth: '400px',
      width: '100%',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
      textAlign: 'center',
      textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    },
    avatar: {
      fontSize: '60px',
      marginBottom: '10px',
    },
    detailItem: {
      backgroundColor: '#f0f0f0',
      borderRadius: '10px',
      padding: '10px 15px',
      marginBottom: '10px',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#333',
    },
    label: {
      fontWeight: 'bold',
    },
    value: {
      marginLeft: '10px',
      fontWeight: 'normal',
    },
    signOutButton: {
      backgroundColor: '#ff4e4e',
      color: '#fff',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginTop: '20px',
      width: '100%',
      textAlign: 'center',
    },
    avatarSelectionContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '15px',
    },
    avatarOption: {
      fontSize: '30px',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    selectedAvatar: {
      transform: 'scale(1.2)',
      border: '2px solid #333',
      borderRadius: '50%',
    },
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) {
        // No email found, redirect to sign in
        navigate('/signin');
        return;
      }

      try {
        const response = await axios.get(`http://34.8.207.205/users/profile?email=${email}`);
        if (response.status === 200) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Error fetching user data. Please sign in again.');
        navigate('/signin');
      }
    };

    fetchUserData();
  }, [email, navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('userEmail');
    navigate('/signin');
  };

  const handleAvatarSelect = (option) => {
    setAvatar(option);
  };

  if (!userData) {
    return (
      <div style={styles.background}>
        <div style={styles.container}>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  const fullName = `${userData.firstName} ${userData.lastName}`;

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.avatar}>{avatar}</div>
        <h2 style={styles.title}>My Account</h2>

        <div style={styles.detailItem}>
          <span style={styles.label}>Name:</span>
          <span style={styles.value}>{fullName}</span>
        </div>

        <div style={styles.detailItem}>
          <span style={styles.label}>DOB:</span>
          <span style={styles.value}>{userData.dob}</span>
        </div>

        <div style={styles.detailItem}>
          <span style={styles.label}>Gender:</span>
          <span style={styles.value}>{userData.gender}</span>
        </div>

        <div style={styles.detailItem}>
          <span style={styles.label}>Mobile:</span>
          <span style={styles.value}>{userData.phone}</span>
        </div>

        <div style={styles.detailItem}>
          <span style={styles.label}>Email:</span>
          <span style={styles.value}>{userData.email}</span>
        </div>

        <h3 style={{ ...styles.title, fontSize: '20px', marginTop: '20px' }}>Select an Avatar</h3>
        <div style={styles.avatarSelectionContainer}>
          {avatarOptions.map((option) => (
            <span
              key={option}
              style={{
                ...styles.avatarOption,
                ...(avatar === option ? styles.selectedAvatar : {})
              }}
              onClick={() => handleAvatarSelect(option)}
            >
              {option}
            </span>
          ))}
        </div>

        <button style={styles.signOutButton} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Account;