import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WallpaperCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const WallpaperCard = ({ title, description, imageUrl }: WallpaperCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="group relative overflow-hidden rounded-2xl bg-card shadow-elegant hover:shadow-glow transition-all duration-500 cursor-pointer animate-fade-in-up"
        onClick={() => setIsOpen(true)}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        
        {/* Glass overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
          <h3 className="text-primary-foreground text-2xl font-bold mb-2">{title}</h3>
          <p className="text-primary-foreground/90 mb-4">{description}</p>
          <button className="w-full py-3 bg-accent text-accent-foreground rounded-full font-medium hover:bg-accent/90 transition-colors">
            Batafsil ko'rish
          </button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <img
              src={imageUrl}
              alt={title}
              className="w-full rounded-xl shadow-elegant"
            />
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
