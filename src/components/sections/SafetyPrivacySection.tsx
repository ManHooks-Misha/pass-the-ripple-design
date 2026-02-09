import { Card, CardContent } from "@/components/ui/card";
import footprint from "@/assets/Footprint.png";

const SafetyPrivacySection = () => {
  return (
    <section className="py-8 md:py-12 bg-white relative overflow-hidden">
      {/* Footprint Graphics */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img src={footprint} alt="" className="absolute top-12 left-12 w-10 h-10 md:w-14 md:h-14 opacity-25" style={{ transform: 'rotate(10deg)' }} />
        <img src={footprint} alt="" className="absolute bottom-20 right-16 w-12 h-12 md:w-16 md:h-16 opacity-30" style={{ transform: 'rotate(-25deg)' }} />
      </div>
      <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-center mb-6 md:mb-8 font-fuzzy">
          SAFETY AND SECURITY
        </h3>
        
        <Card className="bg-amber-50/30 shadow-none relative" style={{
          borderRadius: '45px 38px 42px 40px / 42px 40px 38px 45px',
          border: '2px solid #374151',
          borderStyle: 'solid'
        }}>
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Human-Moderated Environment</h4>
                  <p className="text-base text-gray-900 leading-relaxed">
                    All submissions, stories, and interactions are reviewed by adults
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Parent Controls & Visibility</h4>
                  <p className="text-base text-gray-900 leading-relaxed">
                    Parents can review activity, manage permissions, and stay connected to their child's experience
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">No Ads. No Algorithms. No Data Selling</h4>
                  <p className="text-base text-gray-900 leading-relaxed">
                    Kids are never tracked, targeted, or exposed to advertising
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">No Public Chat or Open Messaging</h4>
                  <p className="text-base text-gray-900 leading-relaxed">
                    Kids cannot message strangers. There are zero open communication channels
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Private, Secure Accounts</h4>
                  <p className="text-base text-gray-900 leading-relaxed">
                    Each child uses a protected profile with no personal data shared publicly
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Human-Moderated Environment</h4>
                  <p className="text-base text-gray-900 leading-relaxed">
                    All content is filtered for emotional safety—only uplifting, supportive, and educational material is allowed
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SafetyPrivacySection;

