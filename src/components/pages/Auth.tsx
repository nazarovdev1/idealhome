import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Home } from "lucide-react";
import { supabase } from "@/components/integrationssupabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simple admin check
      if (username === "admin" && password === "asd123") {
        // Create a demo email for Supabase auth
        const adminEmail = "admin@idealhome.local";
        const adminPassword = "asd123secure";

        // Try to sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });

        // If user doesn't exist, create it
        if (error && error.message.includes("Invalid login credentials")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
              data: {
                role: "admin",
              },
            },
          });

          if (signUpError) {
            throw signUpError;
          }

          // Sign in after signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword,
          });

          if (signInError) {
            throw signInError;
          }
        } else if (error) {
          throw error;
        }

        // Store admin session in localStorage
        localStorage.setItem("adminAuthenticated", "true");
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new Event("storage"));
        toast.success("Welcome back!");
        navigate("/admin");
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4">
      <div className="absolute top-8 left-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-elegant animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription>
            Sign in to manage wallpapers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? "Processing..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;