import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/components/integrationssupabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Home, LogOut } from "lucide-react";

interface Wallpaper {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Check both localStorage and Supabase session
    const checkAuth = async () => {
      const adminAuth = localStorage.getItem("adminAuthenticated");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (adminAuth === "true" && session) {
        setIsAuthenticated(true);
        fetchWallpapers();
      } else if (adminAuth === "true" && !session) {
        // Has localStorage but no Supabase session - clear and redirect
        localStorage.removeItem("adminAuthenticated");
        navigate("/auth");
      } else {
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    // Clear localStorage
    localStorage.removeItem("adminAuthenticated");
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("storage"));
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const fetchWallpapers = async () => {
    const { data } = await supabase
      .from("wallpapers")
      .select("*")
      .order("created_at", { ascending: false });
    setWallpapers(data || []);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("wallpapers")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("wallpapers")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("wallpapers")
        .insert([
          {
            title,
            description,
            image_url: publicUrl,
          },
        ]);

      if (insertError) throw insertError;

      toast.success("Wallpaper uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      fetchWallpapers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("wallpapers").remove([fileName]);
      }

      const { error } = await supabase
        .from("wallpapers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Wallpaper deleted");
      fetchWallpapers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--hero-gradient-start))] to-[hsl(var(--hero-gradient-end))] py-8 sm:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2 w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                Upload New Wallpaper
              </CardTitle>
              <CardDescription>
                Add a beautiful new design to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Elegant Geometric Pattern"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A stunning modern design featuring..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Image File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Wallpaper
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Quick Stats</CardTitle>
              <CardDescription>Your collection overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-4 sm:p-6 bg-secondary rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Total Wallpapers</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent">{wallpapers.length}</p>
                </div>
                <div className="p-4 sm:p-6 bg-secondary rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Logged in as</p>
                  <p className="text-sm sm:text-lg font-medium truncate">admin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Manage Wallpapers</CardTitle>
            <CardDescription>View and manage your uploaded designs</CardDescription>
          </CardHeader>
          <CardContent>
            {wallpapers.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
                No wallpapers yet. Upload your first design above!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {wallpapers.map((wallpaper) => (
                  <div key={wallpaper.id} className="group relative overflow-hidden rounded-lg border border-border">
                    <img
                      src={wallpaper.image_url}
                      alt={wallpaper.title}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">{wallpaper.title}</h3>
                      <p 
                        className="text-xs sm:text-sm text-muted-foreground overflow-hidden mb-2 sm:mb-3" 
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {wallpaper.description}
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full gap-2 text-xs sm:text-sm"
                        onClick={() => handleDelete(wallpaper.id, wallpaper.image_url)}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
