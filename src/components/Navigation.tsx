import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/components/integrationssupabase/client";
import { LogOut, Home, Upload } from "lucide-react";

export const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-card/80 backdrop-blur-lg shadow-elegant border-b border-border" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Home className="w-6 h-6 text-accent" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              IdealHome
            </span>
          </a>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  onClick={() => navigate("/admin")}
                  variant="outline"
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
