import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import ChallengesLeaderboard from "@/components/shared/ChallengesLeaderboard";

const GlobalChallengesLeaderboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Seo
        title="Log Your Ripple — Pass The Ripple"
        description="Record your acts of kindness and watch them ripple across the world!"
        canonical={`${window.location.origin}/post-story`}
      />
      <main className="w-full px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto">
        <ChallengesLeaderboard/>
      </main>
    </div>
  );
};

export default GlobalChallengesLeaderboard;