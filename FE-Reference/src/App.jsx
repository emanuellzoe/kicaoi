import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './lib/wagmi';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FarmPage from './pages/Farm';
import LeaderboardPage from './pages/Leaderboard';
import NotFound from './components/NotFound';
import { useScrollToTop } from './hooks/useScrollToTop';
import { usePageTitle } from './hooks/usePageTitle';

function ScrollAndTitle() {
  useScrollToTop();
  usePageTitle();
  return null;
}

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="bg-black min-h-screen w-full relative selection:bg-white/30 selection:text-white">
            <ScrollAndTitle />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/farm" element={<FarmPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
