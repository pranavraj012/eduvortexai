
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-edu-darkPurple">
      <div className="glass-card p-8 md:p-12 max-w-md text-center rounded-lg animate-fade-in">
        <h1 className="text-7xl font-bold mb-4 text-edu-purple">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <p className="text-muted-foreground mb-8">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-edu-purple hover:bg-edu-deepPurple">
            <Link to="/" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/learn" className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              Explore Learning Paths
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
