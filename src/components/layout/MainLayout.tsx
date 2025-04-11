
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MockAIService from '@/services/MockAIService';
import { useAuth } from '@/context/AuthContext';

// Initialize the API key for MockAIService
const GOOGLE_API_KEY = 'AIzaSyDwN23lw8-Ba9SoDkONNtpt9dGYVyzfhog';
MockAIService.setGoogleApiKey(GOOGLE_API_KEY);

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
