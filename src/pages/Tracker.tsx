import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import Header from "@/components/layouts/includes/HeaderLoggedIn";
import FooterSection from "@/components/layouts/includes/FooterSection";
import { Head } from "react-day-picker";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const Tracker = () => {
  const query = useQuery();
  const id = query.get('id');

  const canonical = `${window.location.origin}/ripple/track${id ? `?id=${id}` : ''}`;

  return (
    <div className="min-h-screen">
      <Seo
        title="Track a Ripple — Pass The Ripple"
        description="Follow a Ripple Card's journey across people and places."
        canonical={canonical}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Ripple Tracker' }}
      />
      <Header />
      <main className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Ripple Tracker
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Follow a Ripple Card's journey across people and places
            </p>
          </div>
        </div>
        
        <section className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ripple Journey {id ? `#${id.split('-')[0]}` : ''}</CardTitle>
              <CardDescription>See where this ripple has traveled.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] w-full rounded-lg border bg-muted/50 flex items-center justify-center text-muted-foreground">
                Interactive map coming soon
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="glow">Add a story</Button>
                <Button variant="outline">Pass it forward</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ripple Chain</CardTitle>
              <CardDescription>Who passed it to whom</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                <li className="rounded-md border p-3">
                  <div className="font-medium">You</div>
                  <div className="text-sm text-muted-foreground">Started the ripple in your town.</div>
                </li>
                <li className="rounded-md border p-3">
                  <div className="font-medium">Alex</div>
                  <div className="text-sm text-muted-foreground">Helped a neighbor with groceries.</div>
                </li>
                <li className="rounded-md border p-3">
                  <div className="font-medium">Taylor</div>
                  <div className="text-sm text-muted-foreground">Wrote a thank-you note to a teacher.</div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default Tracker;
