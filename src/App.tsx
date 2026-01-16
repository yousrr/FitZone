import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicHome from "./pages/PublicHome";
import CreateAccount from "./pages/CreateAccount";
import PlanVisit from "./pages/PlanVisit";
import Login from "./pages/Login";
import MemberDashboard from "./pages/MemberDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicHome />} />
            <Route path="/signup" element={<CreateAccount />} />
            <Route path="/plan-visit" element={<PlanVisit />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/member" 
              element={
                <ProtectedRoute>
                  <MemberDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
