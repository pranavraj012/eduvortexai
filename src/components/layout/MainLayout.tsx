import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import MockAIService from '@/services/MockAIService';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <ConfigContext.Provider value={{ googleApiKey: GOOGLE_API_KEY }}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar with collapse state */}
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "w-0 -ml-72 md:-ml-60" : "w-60 lg:w-72"
          )}>
            <Sidebar />
          </div>
          
          <div className="flex-1">
            <div className="p-4 border-b flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="mr-2"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
              <Navbar />
            </div>
            <MobileNav />
            <div className="p-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </ConfigContext.Provider>
  );
};

export default MainLayout;
