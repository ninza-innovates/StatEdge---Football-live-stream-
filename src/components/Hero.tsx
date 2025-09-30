import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 flex items-center justify-center px-6 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/80" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          AI Football Insights
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Track football data, uncover insights, and stay ahead with{" "}
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI-powered predictions.
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="heroCta" 
            size="lg"
            className="px-6 py-3"
          >
            Get Started
          </Button>
          
          <Button 
            variant="heroSecondary" 
            size="lg"
            className="px-6 py-3"
            onClick={() => {
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            See Pricing
          </Button>
        </div>

        {/* League logos will be added as separate component */}
      </div>

      {/* Floating Elements */}
      
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-pulse opacity-40" />
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse opacity-50" />
    </section>
  );
};

export default Hero;