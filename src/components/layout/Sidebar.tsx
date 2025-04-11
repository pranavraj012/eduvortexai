
import { Link, useLocation } from 'react-router-dom';
import { 
  Brain, 
  Home, 
  Trophy, 
  TrendingUp, 
  User, 
  LayoutDashboard,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Learn', path: '/learn', icon: Brain },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex md:w-60 lg:w-72 border-r border-border flex-col bg-sidebar p-4">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            <span className="text-gradient">Navigate</span>
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  location.pathname === item.path 
                    ? "bg-sidebar-accent text-edu-purple" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {location.pathname === item.path && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-edu-purple" />
                )}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            <span className="text-gradient">Quick Access</span>
          </h2>
          <div className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Recent Learning Paths</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>AI Assistant</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-edu-purple flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Start Learning</h3>
              <p className="text-xs text-muted-foreground">Create your first path</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
