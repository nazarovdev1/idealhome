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

/*************  ✨ Windsurf Command 🌟  *************/
/**
 * The Admin component is the main entry point for the admin dashboard.
 * It displays a form for uploading new wallpapers, a list of the user's
 * uploaded designs, and a button to log out.
 *
 * @returns {JSX.Element} The Admin dashboard component
 */
const Admin = () => {
  /**
   * The state variables to track whether the user is authenticated,
   * whether the user is uploading a new wallpaper, the list of
   * uploaded wallpapers, the title and description of the new
   * wallpaper, and the file to be uploaded.
   */
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  /**
   * A function to check if the user is authenticated. If the user is
   * authenticated, it fetches the list of uploaded wallpapers.
   */
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

  /**
   * A function to log the user out. It clears the localStorage and signs
   * the user out of Supabase.
   */
  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    // Clear localStorage
    localStorage.removeItem("adminAuthenticated");
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("storage"));
    toast.success("Muvaffaqiyatli chiqish!");
    navigate("/auth");
  };

  /**
   * A function to fetch the list of uploaded wallpapers.
   */
  const fetchWallpapers = async () => {
    const { data } = await supabase
      .from("wallpapers")
      .select("*")
      .order("created_at", { ascending: false });
    setWallpapers(data || []);
  };

  /**
   * Convert image file to horizontal JPEG format (16:9 aspect ratio) using Canvas API
   */
  const convertToJpeg = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Target aspect ratio for horizontal (16:9)
        const targetAspectRatio = 16 / 9;
        
        let canvasWidth = img.width;
        let canvasHeight = img.height;
        const currentAspectRatio = img.width / img.height;

        // If image is already horizontal (wider than 16:9), just use original dimensions
        if (currentAspectRatio >= targetAspectRatio) {
          canvasWidth = img.width;
          canvasHeight = img.height;
        } else {
          // If image is vertical or square, make it horizontal by cropping
          canvasWidth = img.height * targetAspectRatio;
          canvasHeight = img.height;
          
          // If calculated width is larger than original width, adjust height instead
          if (canvasWidth > img.width) {
            canvasWidth = img.width;
            canvasHeight = img.width / targetAspectRatio;
          }
        }

        // Set canvas dimensions
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Calculate source crop position to center the image
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        // If we need to crop, center the crop area
        if (currentAspectRatio > targetAspectRatio) {
          // Image is wider than target - crop horizontally
          sourceWidth = img.height * targetAspectRatio;
          sourceX = (img.width - sourceWidth) / 2;
        } else if (currentAspectRatio < targetAspectRatio) {
          // Image is taller than target - crop vertically
          sourceHeight = img.width / targetAspectRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }

        // Fill canvas with white background first (in case of transparent images)
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw the cropped image to fit the 16:9 aspect ratio
        ctx!.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasWidth, canvasHeight);

        // Convert to JPEG with quality (0.9 = 90% quality)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image to JPEG'));
            }
          },
          'image/jpeg',
          0.9
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  /**
   * A function to handle the upload of a new wallpaper.
   * It checks if the file is valid, converts it to JPEG format,
   * and uploads the file to Supabase Storage and then inserts a new record into the
   * wallpapers table with the title, description and image_url.
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Iltimos, rasm tanlang");
      return;
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error("Iltimos, to'g'ri rasm fayli tanlang");
      return;
    }

    setLoading(true);

    try {
      // Convert file to JPEG format
      const jpegBlob = await convertToJpeg(file);
      
      // Create a new file with .jpeg extension
      const jpegFile = new File([jpegBlob], `wallpaper-${Date.now()}.jpeg`, {
        type: 'image/jpeg'
      });

      const { error: uploadError } = await supabase.storage
        .from("wallpapers")
        .upload(jpegFile.name, jpegFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("wallpapers")
        .getPublicUrl(jpegFile.name);

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

      toast.success("Rasm muvaffaqiyatli yuklandi va gorizontal formatga o'zgartirildi!");
      setTitle("");
      setDescription("");
      setFile(null);
      fetchWallpapers();
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : "Yuklash muvaffaqiyatsiz tugadi");
    } finally {
      setLoading(false);
    }
  };

  /**
   * A function to handle the deletion of a wallpaper.
   * It checks if the file is valid, and if so, it deletes the file
   * from Supabase Storage and then deletes the record from the
   * wallpapers table.
   */
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
      toast.success("Rasm o'chirildi");
      fetchWallpapers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "O'chirish muvaffaqiyatsiz tugadi");
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
            Admin Panel
          </h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2 w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              Bosh sahifaga
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                Yangi Rasm Yuklash
              </CardTitle>
              <CardDescription>
                To'plamingizga chiroyli yangi dizayn qo'shing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Sarlavha</Label>
                  <Input
                    id="title"
                    placeholder="Nafis Geometrik Naqsh"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea
                    id="description"
                    placeholder="Ajoyib zamonaviy dizayn..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Rasm Fayli</Label>
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
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Rasm Yuklash
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Tezkor statistika</CardTitle>
              <CardDescription>To'plamingiz umumiy ko'rinishi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-4 sm:p-6 bg-secondary rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Jami Rasmlar</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent">{wallpapers.length}</p>
                </div>
                <div className="p-4 sm:p-6 bg-secondary rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Kirish huquqi</p>
                  <p className="text-sm sm:text-lg font-medium truncate">admin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Rasmlarni Boshqarish</CardTitle>
          <CardDescription>Yuklangan dizaynlaringizni ko'rish va boshqarish</CardDescription>
        </CardHeader>
        <CardContent>
          {wallpapers.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
              Hali rasmlar yo'q. Yuqoridagi birinchi dizayningizni yuklang!
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
                      O'chirish
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
/*******  c7795a9a-c930-4a11-badd-5dbfc8840649  *******/

export default Admin;
