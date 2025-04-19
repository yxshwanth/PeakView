import React from 'react';

const Footer = () => {
  return (
    <footer 
      style={{ 
        backgroundColor: 'black', 
        padding: '20px', 
        maxHeight: '20vh',   // Adjust to desired max height
        overflowY: 'auto',   // Enable scrolling if content exceeds maxHeight
      }}
    >
      {/* Global styles for bold and hover underline */}
      <style>
        {`
          /* All text bold */
          body, body * {
            font-weight: bold;
          }

          /* Underline on hover for footer items (p) */
          .footer-column p:hover {
            text-decoration: underline;
          }
        `}
      </style>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '20px', 
        color: '#fff', 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* Home Column */}
        <div className="footer-column">
          <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Home</h4>
          <p style={{ margin: '5px 0' }}>Contact us</p>
          <p style={{ margin: '5px 0' }}>About us</p>
          <p style={{ margin: '5px 0' }}>Careers</p>
          <p style={{ margin: '5px 0' }}>Press</p>
        </div>

        {/* Help Column */}
        <div className="footer-column">
          <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Help</h4>
          <p style={{ margin: '5px 0' }}>Payments</p>
          <p style={{ margin: '5px 0' }}>Report an issue</p>
        </div>

        {/* Policy Column */}
        <div className="footer-column">
          <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Policy</h4>
          <p style={{ margin: '5px 0' }}>Time of Use</p>
          <p style={{ margin: '5px 0' }}>Careers</p>
          <p style={{ margin: '5px 0' }}>Privacy</p>
        </div>

        {/* Mail Us Column */}
        <div className="footer-column">
          <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Mail Us</h4>
          <p style={{ margin: '5px 0' }}>support@peakview.com</p>
        </div>

        {/* Registered Office Column */}
        <div className="footer-column">
          <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Registered Office</h4>
          <p style={{ margin: '5px 0' }}>4977 Moorhead Ave</p>
          <p style={{ margin: '5px 0' }}>Boulder, Colorado</p>
          <p style={{ margin: '5px 0' }}>United States</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
