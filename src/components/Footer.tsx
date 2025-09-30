import logoIcon from "@/assets/logo-icon-transparent.png";
const Footer = () => {
  return <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              
              <span className="font-bold text-xl">StatEdge.ai</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-powered football analytics providing deep insights, match predictions, and comprehensive league data for the modern football fan.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Product</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Features
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Pricing
              </a>
              <a href="#leagues" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Leagues
              </a>
            </nav>
          </div>

          {/* Company Links */}
          

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Legal</h4>
            <nav className="flex flex-col space-y-2">
              <span className="text-muted-foreground text-sm">
                Privacy Policy
              </span>
              <span className="text-muted-foreground text-sm">
                Terms of Service
              </span>
              <span className="text-muted-foreground text-sm">
                Cookie Policy
              </span>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} StatEdge.ai. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Made with ⚽ for football fans</span>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;