import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import Header from "@/components/layouts/includes/HeaderLoggedIn";
import FooterSection from "@/components/layouts/includes/FooterSection";

const Classroom = () => {
  return (
    <div className="min-h-screen">
    
      <Seo
        title="Classroom Portal — Pass The Ripple"
        description="Register cards in batches and monitor your classroom's ripple impact."
        canonical={`${window.location.origin}/classroom`}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: 'Pass The Ripple Classroom Portal' }}
      />
      <Header />
      <main className="container py-10">
        <section className="grid gap-8 md:grid-cols-2 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Register a Batch of Cards</CardTitle>
              <CardDescription>Perfect for schools and groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-4 bg-muted/50 text-sm text-muted-foreground">
                Upload a CSV or enter a quantity (coming soon). Cards will be generated with unique IDs and printable sheets.
              </div>
              <div className="mt-4"><Button variant="hero">Get Started</Button></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monitor Class Impact</CardTitle>
              <CardDescription>Stories, distances, and badges</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>• Total ripples started</li>
                <li>• Acts completed this month</li>
                <li>• Longest ripple chain</li>
                <li>• Hero Wall highlights</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default Classroom;
