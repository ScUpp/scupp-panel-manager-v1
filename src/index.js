import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Certifique-se que o arquivo está presente
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Remova ou comente o StrictMode temporariamente
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
