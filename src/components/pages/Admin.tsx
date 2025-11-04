import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/components/integrationssupabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Home } from "lucide-react";

interface Wallpaper {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchWallpapers();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
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
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-hero-gradient py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent" />
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

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your collection overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total Wallpapers</p>
                  <p className="text-4xl font-bold text-accent">{wallpapers.length}</p>
                </div>
                <div className="p-6 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Logged in as</p>
                  <p className="text-lg font-medium truncate">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Manage Wallpapers</CardTitle>
            <CardDescription>View and manage your uploaded designs</CardDescription>
          </CardHeader>
          <CardContent>
            {wallpapers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No wallpapers yet. Upload your first design above!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallpapers.map((wallpaper) => (
                  <div key={wallpaper.id} className="group relative overflow-hidden rounded-lg border border-border">
                    <img
                      src={wallpaper.image_url}
                      alt={wallpaper.title}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{wallpaper.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {wallpaper.description}
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mt-3 gap-2"
                        onClick={() => handleDelete(wallpaper.id, wallpaper.image_url)}
                      >
                        <Trash2 className="w-4 h-4" />
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
