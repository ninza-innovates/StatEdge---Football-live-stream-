import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Start from "./pages/Start";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import League from "./pages/League";
import Favourites from "./pages/Favourites";
import Account from "./pages/Account";
import Support from "./pages/Support";
import MatchThread from "./pages/MatchThread";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/start" element={<Start />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/league/:slug" 
              element={
                <ProtectedRoute>
                  <League />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/favourites" 
              element={
                <ProtectedRoute>
                  <Favourites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account" 
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/support" 
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/match/:slug" 
              element={
                <ProtectedRoute>
                  <MatchThread />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
