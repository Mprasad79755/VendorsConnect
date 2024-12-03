import React from 'react';

const Header = () => {
  const location = 'Koramangala, Bengaluru, Karnataka, India';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* Location Display */}
        <div className="navbar-text" style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <i
            className="fas fa-map-marker-alt"
            style={{
              marginRight: '8px',
              color: 'red',
              fontSize: '1.2rem',
            }}
          ></i>
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{location}</span>
        </div>

        {/* Profile Icon */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            marginLeft: '10px',
          }}
        >
          AB {/* Placeholder for initials */}
        </div>
      </div>
    </nav>
  );
};

export default Header;