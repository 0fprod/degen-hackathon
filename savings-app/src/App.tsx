import { ConnectWallet } from '@thirdweb-dev/react';
import './styles/Home.css';

export default function Home() {
  return (
    <main className="main">
      <div className="container">
        <div className="header">
          <h1 className="title">
            Welcome to{' '}
            <span className="gradient-text-0">
              <a href="https://thirdweb.com/" target="_blank" rel="noopener noreferrer">
                SavingsApp.
              </a>
            </span>
          </h1>

          <p className="description">
            Make your{' '}
            <span className="gradient-text-3">
              <u>dreams come true</u>
            </span>
            , one token at a time! Join our savings contract and turn your goals into <b>effortless achievements.</b>{' '}
            🚀💰 <span className="gradient-text-1">#SmartSavings.</span>
          </p>

          <div className="connect">
            <ConnectWallet />
          </div>
        </div>

        <div className="grid">
          <a href="#" className="card" target="_blank" rel="noopener noreferrer">
            <img src="/images/portal-preview.png" alt="Placeholder preview of starter" />
            <div className="card-text">
              <h2 className="gradient-text-1">Goal 1</h2>
              <p> ETH: 59%</p>
            </div>
          </a>

          <a href="#" className="card" target="_blank" rel="noopener noreferrer">
            <img src="/images/dashboard-preview.png" alt="Placeholder preview of starter" />
            <div className="card-text">
              <h2 className="gradient-text-2">Goal 2</h2>
              <p>Tokens: USDT, USDC...</p>
            </div>
          </a>

          <a href="#" className="card" target="_blank" rel="noopener noreferrer">
            <img src="/images/templates-preview.png" alt="Placeholder preview of templates" />
            <div className="card-text">
              <h2 className="gradient-text-3">Create savings</h2>
              <p>Lets go!</p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
