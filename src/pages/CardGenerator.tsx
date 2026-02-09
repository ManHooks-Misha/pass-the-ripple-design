import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import Header from "@/components/layouts/includes/HeaderLoggedIn";
import FooterSection from "@/components/layouts/includes/FooterSection";

const avatars = ["😊", "🦄", "🐼", "🦊", "🐨", "🐯"];

const CardGenerator = () => {
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<string>(avatars[0]);

  const id = useMemo(() => crypto.randomUUID(), []);
  const shareUrl = useMemo(() => `${window.location.origin}/ripple/track?id=${id}`, [id]);

  const onGenerate = () => {
    toast({
      title: "Ripple Card created!",
      description: "Share your link or print your QR to start the ripple.",
    });
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: "Share it to Pass The Ripple forward." });
  };

  return (
    <div className="min-h-screen">
      <Seo
        title="Create a Ripple Card — Pass The Ripple"
        description="Generate a personalized kindness Ripple Card with a unique link and start your ripple."
        canonical={`${window.location.origin}/cards/new`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: 'Ripple Card Generator',
          description: 'Create a personalized Ripple Card for acts of kindness.',
        }}
      />
      <Header />
      <main className="container py-10">
        <section className="grid gap-8 md:grid-cols-2 items-start">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Create your Ripple Card</CardTitle>
              <CardDescription>Add your nickname and pick an avatar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="SunnyHero" />
              </div>
              <div className="grid gap-3">
                <Label>Avatar</Label>
                <div className="flex flex-wrap gap-2">
                  {avatars.map((a) => (
                    <button
                      key={a}
                      type="button"
                      aria-label={`Choose avatar ${a}`}
                      onClick={() => setAvatar(a)}
                      className={`rounded-md border px-3 py-2 text-2xl transition-colors ${avatar === a ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="hero" size="xl" onClick={onGenerate}>Generate</Button>
                <Button variant="outline" onClick={onCopy}>Copy Link</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Your printable / shareable card</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mx-auto max-w-sm rounded-xl border p-6 bg-card text-card-foreground shadow-elevated">
                <div className="text-sm text-muted-foreground">Ripple Card</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="text-4xl leading-none" aria-hidden>{avatar}</div>
                  <div>
                    <div className="font-semibold">{nickname || 'Your Nickname'}</div>
                    <div className="text-xs text-muted-foreground">ID: {id.split('-')[0]}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="text-sm">Scan or visit:</div>
                  <a href={shareUrl} className="truncate text-sm text-primary underline underline-offset-4">{shareUrl}</a>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">Challenge: Do something kind for a new friend today! ✨</div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default CardGenerator;
