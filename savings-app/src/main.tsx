import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './App';
import './styles/globals.css';

export default function App() {
  return <Home />;
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
