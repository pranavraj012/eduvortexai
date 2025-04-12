import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Achievements from "./pages/Achievements";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { LearningProvider } from "./context/LearningContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

// Create QueryClient outside of component render to avoid re-creation
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

// Public home route that redirects to app home if logged in
const PublicHomeRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/app" />;
  }
  
  return <Home />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <LearningProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<PublicHomeRoute />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected app routes with MainLayout */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Home />} />
                  <Route path="learn" element={<Learn />} />
                  <Route path="achievements" element={<Achievements />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </LearningProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
