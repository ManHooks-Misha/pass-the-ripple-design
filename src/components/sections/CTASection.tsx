import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sparkles, Heart, Shield, Users, CheckCircle2, Zap, ArrowRight } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    { icon: CheckCircle2, text: "No Credit Card Required", color: "text-green-600" },
    { icon: Shield, text: "Safe & Secure", color: "text-blue-600" },
    { icon: Users, text: "10,000+ Members", color: "text-purple-600" },
    { icon: Zap, text: "Quick Setup", color: "text-orange-600" }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Main CTA Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 lg:p-16 text-center relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }} />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icons */}
              <div className="flex justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                Ready to Start Your
                <br />
                Kindness Adventure?
              </h2>

              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of young heroes making the world better, one kind act at a time.
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <benefit.icon className="w-6 h-6 text-white mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">{benefit.text}</p>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  onClick={() => navigate('/age-gate')}
                  size="lg"
                  className="bg-white hover:bg-gray-100 font-bold shadow-lg group"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Start Free Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  onClick={() => navigate('/hero-wall')}
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10"
                >
                  View Success Stories
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Safe for Kids</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Parent Approved</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Simple emoji row - no animation */}
        <div className="mt-8 flex justify-center gap-6 text-4xl opacity-50">
          <span>💖</span>
          <span>💜</span>
          <span>💛</span>
          <span>💙</span>
          <span>💚</span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
