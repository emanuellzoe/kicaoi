import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './lib/wagmi';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FarmPage from './pages/Farm';
import LeaderboardPage from './pages/Leaderboard';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="bg-black min-h-screen w-full relative selection:bg-white/30 selection:text-white">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/farm" element={<FarmPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
