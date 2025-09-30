import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LeagueLogos from "@/components/LeagueLogos";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Matches from "@/components/Matches";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <LeagueLogos />
      <HowItWorks />
      <Pricing />
      <Matches />
      <Footer />
    </div>
  );
};

export default Index;
