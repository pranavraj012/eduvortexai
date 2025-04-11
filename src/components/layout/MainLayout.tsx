
import { ReactNode, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MockAIService from '@/services/MockAIService';
import { useAuth } from '@/context/AuthContext';

// Initialize the API key for MockAIService
const GOOGLE_API_KEY = 'AIzaSyDwN23lw8-Ba9SoDkONNtpt9dGYVyzfhog';
MockAIService.setGoogleApiKey(GOOGLE_API_KEY);

// Create a config context to provide the API key
interface ConfigContextType {
  googleApiKey: string;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Export the useConfig hook
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuth();

  return (
    <ConfigContext.Provider value={{ googleApiKey: GOOGLE_API_KEY }}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ConfigContext.Provider>
  );
};

export default MainLayout;
