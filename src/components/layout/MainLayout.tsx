
import { ReactNode, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

// Create a context for API keys and configuration
export const ConfigContext = createContext<{
  googleApiKey: string;
}>({
  googleApiKey: 'AIzaSyDwN23lw8-Ba9SoDkONNtpt9dGYVyzfhog'
});

// Custom hook to access configuration
export const useConfig = () => useContext(ConfigContext);

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // Configuration values
  const configValue = {
    googleApiKey: 'AIzaSyDwN23lw8-Ba9SoDkONNtpt9dGYVyzfhog'
  };

  return (
    <ConfigContext.Provider value={configValue}>
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
