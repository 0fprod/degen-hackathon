import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './App';
import './styles/globals.css';
import { ChakraProvider } from '@chakra-ui/react';

export default function App() {
  return (
    <ChakraProvider>
      <Home />
    </ChakraProvider>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
