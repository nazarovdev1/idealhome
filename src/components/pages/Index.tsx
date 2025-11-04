import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { WallpaperGallery } from "@/components/WallpaperGallery";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <WallpaperGallery />
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">IdealHome</h3>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-6">
            Transforming spaces with premium wallpaper designs. Every wall tells a story.
          </p>
          <p className="text-sm text-primary-foreground/60">
            © 2024 IdealHome. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
