import React from 'react';

// ErrorFallback component to display a readable error message
const ErrorFallback = ({ message }) => {
  return (
    <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '5px' }}>
      <h2>Oops! Something went wrong.</h2>
      <p>{message}</p>
    </div>
  );
};

export default ErrorFallback;
