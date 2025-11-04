import heroImage from "@/assets/hero-wallpaper.jpg";

export const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Transform Your Walls,
          <br />
          Transform Your Space
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover stunning wallpaper designs that bring luxury and elegance to every room
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a 
            href="#gallery"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 transition-transform shadow-elegant"
          >
            Explore Collection
          </a>
          <a 
            href="#gallery"
            className="px-8 py-4 bg-card/80 backdrop-blur-sm border-2 border-border text-foreground rounded-full font-medium hover:scale-105 transition-transform"
          >
            View Gallery
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-muted-foreground"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
};
