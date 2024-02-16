import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './App';
import './styles/globals.css';
import { ThirdwebProvider } from '@thirdweb-dev/react';

// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
const activeChain = 'ethereum';

export default function App() {
  return (
    <ThirdwebProvider clientId={import.meta.env.VITE_TEMPLATE_CLIENT_ID} activeChain={activeChain}>
      <Home />
    </ThirdwebProvider>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
