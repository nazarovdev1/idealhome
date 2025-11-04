import { useEffect, useState } from "react";
import { supabase } from "@/components/integrationssupabase/client";
import { WallpaperCard } from "@/components/WallpaperCard";
import { Loader2 } from "lucide-react";

interface Wallpaper {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

export const WallpaperGallery = () => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallpapers();
  }, []);

  const fetchWallpapers = async () => {
    try {
      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWallpapers(data || []);
    } catch (error) {
      console.error("Error fetching wallpapers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (wallpapers.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-semibold mb-4">No wallpapers yet</h3>
        <p className="text-muted-foreground">Check back soon for stunning designs!</p>
      </div>
    );
  }

  return (
    <section id="gallery" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Our Collection
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked designs that combine artistry with elegance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wallpapers.map((wallpaper) => (
            <WallpaperCard
              key={wallpaper.id}
              id={wallpaper.id}
              title={wallpaper.title}
              description={wallpaper.description || ""}
              imageUrl={wallpaper.image_url}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
