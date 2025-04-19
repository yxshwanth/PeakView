import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Inventory from './Inventory';
import Sales from './Sales';
import Analytics from './Analytics';
import Account from './Account';
import Footer from './Footer'; // Import the Footer component

const Dashboard = () => {
  const navigate = useNavigate();

  const styles = {
    navContainer: {
      backgroundColor: '#fff',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      width: '100%',
      maxWidth: '100%',
      borderBottom: '1px solid #ccc',
      zIndex: 9999,
      transition: 'transform 0.3s ease',
    },
    brand: {
      color: '#d32f2f',
      fontSize: '30px',
      fontWeight: 'bold',
      textDecoration: 'none',
      cursor: 'pointer',
      fontFamily: "'Lemon Jelly', cursive",
      marginLeft: '20px',
    },
    navLinks: {
      display: 'flex',
      gap: '20px',
      marginRight: '20px',
    },
    navLink: {
      color: 'black',
      textDecoration: 'none',
      fontSize: '18px',
      padding: '8px 12px',
      borderRadius: '4px',
      transition: 'background-color 0.3s ease',
    },
    navLinkHover: {
      backgroundColor: '#e0e0e0',
    },
    content: {
      padding: '120px 20px 20px', // Ensure top padding for fixed nav
      backgroundColor: '#fff', 
      minHeight: 'calc(100vh - 150px)',
    },
  };

  const handleBrandClick = () => {
    navigate('/dashboard/inventory');
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={styles.navContainer}>
        <div onClick={handleBrandClick} style={styles.brand}>Peak View</div>
        <div style={styles.navLinks}>
          <Link 
            to="/dashboard/inventory" 
            style={styles.navLink}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Inventory
          </Link>
          <Link 
            to="/dashboard/sales" 
            style={styles.navLink}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Sales
          </Link>
          <Link 
            to="/dashboard/analytics" 
            style={styles.navLink}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Analytics
          </Link>
          <Link 
            to="/dashboard/account" 
            style={styles.navLink}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Account
          </Link>
        </div>
      </nav>

      <div style={styles.content}>
        <Routes>
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="account" element={<Account />} />
        </Routes>
      </div>

      {/* Footer visible on all pages */}
      <Footer />
    </div>
  );
};

export default Dashboard;
