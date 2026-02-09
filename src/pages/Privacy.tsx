import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import Header from "@/components/layouts/includes/MagicalHeader";
import FooterSection from "@/components/layouts/includes/FooterSection";
import { useApplicationSettings } from "@/hooks/useSettingsGroups";

const Privacy = () => {
  const { settings: appSettings } = useApplicationSettings();
  
  // Get dynamic contact information from settings
  const supportEmail = appSettings?.support_email || "privacy@ripplechallenge.com";
  const supportPhone = appSettings?.support_phone || "1-800-RIPPLE-1";
  const dpoEmail = appSettings?.support_email || "dpo@ripplechallenge.com";
  return (
    <div className="min-h-screen">
      <Seo
        title="Privacy Policy & Safety — Pass The Ripple"
        description="Learn how we protect children's privacy and ensure safety on Pass The Ripple platform."
        canonical={`${window.location.origin}/privacy`}
      />
      <main className="container py-10">

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold mb-2">Privacy & Safety</h1>
            <p className="text-muted-foreground">Your privacy and safety are our top priorities</p>
          </div>

          {/* COPPA Compliance */}
          <Card className="shadow-elevated border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                🛡️ COPPA Compliant & Kid-Safe
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                We follow strict guidelines to protect children under 13
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-start gap-2">
                  <div className="text-green-600">✅</div>
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Parental Consent Required</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">Users under 13 need parent permission</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-green-600">✅</div>
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Limited Data Collection</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">Only necessary information is collected</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-green-600">✅</div>
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Content Moderation</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">All content is reviewed before posting</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-green-600">✅</div>
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">No Direct Messaging</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">Kids cannot contact each other directly</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data We Collect */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>📊 What Information We Collect</CardTitle>
              <CardDescription>Transparency about the data we use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-1">Profile Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Chosen nickname (not real name)</li>
                    <li>• Selected avatar</li>
                    <li>• Parent/guardian email (for under 13)</li>
                    <li>• Ripple Card unique ID</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-1">Activity Data</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Kindness acts logged (stories, photos)</li>
                    <li>• City-level location only (never exact address)</li>
                    <li>• Ripple journey timestamps</li>
                    <li>• Badges and achievements earned</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-1">Technical Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Device type (mobile, tablet, computer)</li>
                    <li>• App usage statistics (for improvement)</li>
                    <li>• Error logs (to fix technical issues)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Location */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>📍 How We Use Location</CardTitle>
              <CardDescription>Safe location tracking for ripple journeys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">✅ What We DO</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Show city and state/country only</li>
                    <li>• Track ripple journey distances</li>
                    <li>• Create regional leaderboards</li>
                    <li>• Show general path on map</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-600">❌ What We DON'T DO</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Store exact addresses</li>
                    <li>• Track real-time location</li>
                    <li>• Share location with others</li>
                    <li>• Use location for advertising</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Moderation */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>🔍 Content Moderation</CardTitle>
              <CardDescription>How we keep the platform safe and positive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">AI + Human Review</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    All photos and stories are first scanned by AI for inappropriate content, then reviewed by trained moderators before going live.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Positive Content Only</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    We only allow positive, uplifting content that celebrates kindness. No negative, mean, or inappropriate content is permitted.
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Report System</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Users, parents, and teachers can report any content that seems inappropriate. We review all reports within 24 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Rights */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>👨‍👩‍👧‍👦 Parent & Guardian Rights</CardTitle>
              <CardDescription>Full control over your child's experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Access Rights</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• View all your child's activity</li>
                    <li>• Download their data anytime</li>
                    <li>• Access their account settings</li>
                    <li>• Receive activity summaries</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Control Rights</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Delete their account anytime</li>
                    <li>• Modify privacy settings</li>
                    <li>• Remove posted content</li>
                    <li>• Block other users</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>📧 Privacy Questions?</CardTitle>
              <CardDescription>We're here to help with any concerns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Contact Our Privacy Team</h4>
                  <div className="text-sm space-y-1">
                    <p>Email: <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">{supportEmail}</a></p>
                    <p>Response time: Within 24 hours</p>
                    {supportPhone && <p>Phone: <a href={`tel:${supportPhone}`} className="text-primary hover:underline">{supportPhone}</a></p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                  <div className="text-sm space-y-1">
                    <p>For GDPR requests in Europe</p>
                    <p>Email: <a href={`mailto:${dpoEmail}`} className="text-primary hover:underline">{dpoEmail}</a></p>
                    <p>Available Monday-Friday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <Card className="border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Last updated: January 1, 2024 • Effective immediately for all users
                </p>
                <p className="text-xs text-muted-foreground">
                  This privacy policy complies with COPPA, GDPR, and applicable state privacy laws. 
                  We may update this policy with 30 days notice to registered email addresses.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="text-center space-y-4">
            <div className="flex gap-3 justify-center">
              <Link to="/contact-us"><Button variant="hero">Contact Support</Button></Link>
              <Link to="/"><Button variant="outline">Back to Home</Button></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;