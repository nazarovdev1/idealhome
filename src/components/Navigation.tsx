import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/components/integrationssupabase/client";

export const Navigation = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check admin authentication from localStorage
    const checkAuth = () => {
      const adminAuth = localStorage.getItem("adminAuthenticated");
      setIsAuthenticated(adminAuth === "true");
    };

    checkAuth();

    // Listen for storage changes (e.g., logout from another tab)
    window.addEventListener("storage", checkAuth);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    // Clear localStorage
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-card/80 backdrop-blur-lg shadow-lg border-b border-border" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24 sm:h-20">
          <a href="/" className="flex items-center gap-1 sm:gap-2 text-2xl sm:text-2xl lg:text-3xl font-bold">
            <Home className="w-7 h-7 sm:w-6 sm:h-6 text-accent" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              IdealHome
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate("/admin")}
                  variant="outline"
                  className="gap-1 sm:gap-2 px-2 sm:px-3 text-sm sm:text-base"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="gap-1 sm:gap-2 px-2 sm:px-3 text-sm sm:text-base"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 sm:px-3 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Admin Login</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
