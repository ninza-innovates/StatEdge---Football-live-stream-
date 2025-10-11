import { Button } from "@/components/ui/button";

const Header = () => {

  return (
    <header className="w-full px-4 md:px-10 py-2 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img src="/lovable-uploads/dd09e007-2423-4091-b113-8404a07c3b63.png" alt="StatEdge.ai" className="h-36 w-auto" />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a 
            href="#how-it-works" 
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How it Works
          </a>
          <a 
            href="#matches" 
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('matches')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Matches
          </a>
          <a 
            href="#pricing" 
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Pricing
          </a>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost"
            onClick={() => window.location.href = '/auth'}
          >
            Login
          </Button>
          <Button 
            variant="heroCta" 
            className="hidden md:inline-flex"
            onClick={() => window.location.href = '/auth'}
          >
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;