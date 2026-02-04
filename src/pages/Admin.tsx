import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import WaitlistAdmin from "@/components/admin/WaitlistAdmin";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simple password protection (in production, use proper authentication)
  const ADMIN_PASSWORD = "satsgate2024"; // Change this to your preferred password

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        toast.success("Welcome to admin panel");
      } else {
        toast.error("Invalid password");
      }
      setIsLoading(false);
    }, 500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Admin Access</CardTitle>
                <CardDescription>
                  Enter the admin password to view waitlist data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || !password}
                  >
                    {isLoading ? "Authenticating..." : "Access Admin Panel"}
                  </Button>
                </form>
                
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  This is a simple password protection. In production, use proper authentication.
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8">
        <ErrorBoundary>
          <WaitlistAdmin />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Admin;