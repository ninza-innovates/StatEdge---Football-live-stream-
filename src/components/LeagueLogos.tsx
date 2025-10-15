const LeagueLogos = () => {
  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {/* Premier League */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/d3dec733-3b64-497d-b80a-707d0096ce57.png" 
              alt="Premier League logo"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Serie A */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/f7ed4810-3f2d-469d-8988-45a2b3194876.png" 
              alt="Serie A logo"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Bundesliga */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/6c102d89-cba1-40c5-9221-d370e01d753f.png" 
              alt="Bundesliga logo"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Ligue 1 */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/a818f2a0-c95a-45a3-af9d-1b2e08abf969.png" 
              alt="Ligue 1 logo"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* La Liga */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/b7b6b688-263b-4c80-bfb8-891ce947ed21.png" 
              alt="La Liga logo"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* EFL League One */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/efl-league-one.png" 
              alt="EFL League One logo"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Europa League */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/6f221313-1a4f-48b1-b8a4-f78e58aae314.png" 
              alt="UEFA Europa League logo"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* EFL Championship */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/efl-championship.png" 
              alt="EFL Championship logo"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Champions League */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/3686a251-497b-4adb-93cb-f72c8dbbb985.png" 
              alt="UEFA Champions League logo"
              className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeagueLogos;