import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layouts/includes/MagicalHeader";
import FooterSection from "@/components/layouts/includes/FooterSection";
import Seo from "@/components/Seo";
import { CheckCircle, XCircle, Clock, Heart, Star, MapPin } from "lucide-react";

const ParentDashboard = () => {
  // Mock data for pending approvals
  const pendingApprovals = [
    {
      id: 1,
      childName: "Emma",
      action: "Helped a classmate with homework",
      date: "2024-01-15",
      location: "School",
      status: "pending"
    },
    {
      id: 2,
      childName: "Emma",
      action: "Shared lunch with a friend",
      date: "2024-01-14",
      location: "Cafeteria",
      status: "pending"
    },
    {
      id: 3,
      childName: "Liam",
      action: "Cleaned up the playground",
      date: "2024-01-13",
      location: "Park",
      status: "pending"
    }
  ];

  // Mock data for approved acts
  const approvedActs = [
    {
      id: 4,
      childName: "Emma",
      action: "Helped elderly neighbor with groceries",
      date: "2024-01-10",
      badges: ["Helper Hero", "Community Champion"]
    },
    {
      id: 5,
      childName: "Liam",
      action: "Organized a book drive",
      date: "2024-01-08",
      badges: ["Leader"]
    }
  ];

  // Mock children data
  const children = [
    {
      name: "Emma",
      rippleCount: 15,
      badges: 8,
      miles: 125,
      streak: 7
    },
    {
      name: "Liam",
      rippleCount: 12,
      badges: 6,
      miles: 98,
      streak: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Parent Dashboard — Pass The Ripple"
        description="Review and approve your children's acts of kindness"
        canonical={`${window.location.origin}/parent-dashboard`}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Pass The Ripple Parent Dashboard' }}
      />
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Parent Dashboard</h1>
          <p className="text-muted-foreground">Review and celebrate your children's kindness journey</p>
        </div>

        {/* Children Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {children.map((child) => (
            <Card key={child.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {child.name}
                  <Badge variant="secondary">{child.streak} day streak 🔥</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold text-primary">{child.rippleCount}</div>
                    <div className="text-sm text-muted-foreground">Ripples</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/10">
                    <div className="text-2xl font-bold text-accent">{child.badges}</div>
                    <div className="text-sm text-muted-foreground">Badges</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/10">
                    <div className="text-2xl font-bold text-secondary">{child.miles}</div>
                    <div className="text-sm text-muted-foreground">Miles</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Star className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <div className="text-sm text-muted-foreground">Rising Star</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Approval Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending Approval
              <Badge className="ml-2" variant="destructive">{pendingApprovals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">Approved Acts</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApprovals.map((act) => (
              <Card key={act.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{act.childName}'s Kindness Act</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {act.date}
                        <MapPin className="h-3 w-3 ml-2" />
                        {act.location}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{act.action}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedActs.map((act) => (
              <Card key={act.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{act.childName}</CardTitle>
                      <CardDescription>{act.date}</CardDescription>
                    </div>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{act.action}</p>
                  <div className="flex gap-2 flex-wrap">
                    {act.badges.map((badge) => (
                      <Badge key={badge} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Heart className="h-4 w-4 mr-2" />
              View Hero Wall
            </Button>
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Track Ripples
            </Button>
            <Button variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Badge Gallery
            </Button>
          </CardContent>
        </Card>
      </main>

      <FooterSection />
    </div>
  );
};

export default ParentDashboard;