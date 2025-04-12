import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const [showTestComponent, setShowTestComponent] = useState(false);

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  const handleAuth = async (action: 'login' | 'signup') => {
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      if (action === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: `Error: ${error.message}. Check console for details.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple test function to check Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log("Testing Supabase connection to: ", import.meta.env.VITE_SUPABASE_URL);
      
      const { data, error } = await supabase.from('roadmaps').select('id').limit(1);
      if (error) {
        throw error;
      }
      toast({
        title: "Connection successful",
        description: `Found ${data.length} roadmaps`,
      });
    } catch (error) {
      console.error("Supabase connection error:", error);
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="purple-glow rounded-full p-4 bg-black inline-block mb-4">
            <span className="text-3xl font-bold">E</span>
          </div>
          <h1 className="text-4xl font-bold">EduVortex</h1>
          <p className="text-slate-400 mt-2">Your personalized learning journey awaits</p>
          
          {/* Debug buttons */}
          <div className="mt-2 flex justify-center space-x-2">
            <button 
              onClick={testSupabaseConnection}
              className="text-xs text-edu-purple hover:underline"
            >
              Quick Test Connection
            </button>
            <button 
              onClick={() => setShowTestComponent(!showTestComponent)}
              className="text-xs text-edu-purple hover:underline"
            >
              {showTestComponent ? "Hide Detailed Test" : "Show Detailed Test"}
            </button>
          </div>
          
          {showTestComponent && <SupabaseConnectionTest />}
        </div>
        
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">Welcome to EduVortex</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={(e) => { e.preventDefault(); handleAuth('login'); }}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a href="#" className="text-xs text-edu-purple hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-edu-purple hover:bg-edu-deepPurple"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={(e) => { e.preventDefault(); handleAuth('signup'); }}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <p className="text-xs text-slate-500">
                        Password must be at least 6 characters
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-edu-purple hover:bg-edu-deepPurple"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-slate-500">
              By continuing, you agree to EduVortex's Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
          <div className="mt-4 text-center">
            <button 
              onClick={() => setShowTestComponent(!showTestComponent)}
              className="text-xs text-edu-purple hover:underline"
            >
              {showTestComponent ? "Hide Connection Test" : "Test Supabase Connection"}
            </button>
            
            {showTestComponent && <SupabaseConnectionTest />}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
