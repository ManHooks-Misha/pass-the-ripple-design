import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Seo from "@/components/Seo";
import { CheckCircle, XCircle, Pin, Users, TrendingUp, Award, Image, Activity, CreditCard, FileCheck } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  // Mock data for pinned posts
  
  const pinnedPosts = [
    {
      id: 1,
      author: "Ms. Johnson",
      school: "Riverside Elementary",
      content: "Our class completed 100 acts of kindness this month!",
      date: "2024-01-15",
      status: "pending",
      type: "milestone"
    },
    {
      id: 2,
      author: "Mr. Smith",
      school: "Oakwood Middle School",
      content: "Student organized community cleanup drive",
      date: "2024-01-14",
      status: "pending",
      type: "highlight",
      image: true
    },
    {
      id: 3,
      author: "Mrs. Davis",
      school: "Pine Valley School",
      content: "Kindness chain reached 50 students!",
      date: "2024-01-13",
      status: "approved",
      type: "achievement"
    }
  ];

  // Mock stats
  const stats = {
    totalUsers: 15234,
    activeRipples: 3421,
    pendingReviews: 47,
    totalSchools: 125,
    monthlyGrowth: "+12%",
    totalActs: 50000
  };

  return (
    <>
      <Seo
        title="Admin Dashboard — Pass The Ripple"
        description="Manage and moderate the Pass The Ripple platform"
        canonical={`${window.location.origin}/admin-dashboard`}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Pass The Ripple Admin Dashboard' }}
      />
      
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform content and community</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Ripples</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeRipples.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.pendingReviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Schools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchools}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.monthlyGrowth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Acts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.totalActs.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pinned Posts Management */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending Pins
              <Badge className="ml-2" variant="destructive">
                {pinnedPosts.filter(p => p.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">Approved Pins</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pinnedPosts
              .filter(post => post.status === 'pending')
              .map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pin className="h-4 w-4" />
                          {post.author} - {post.school}
                        </CardTitle>
                        <CardDescription>{post.date}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{post.type}</Badge>
                        {post.image && (
                          <Badge variant="secondary">
                            <Image className="h-3 w-3 mr-1" />
                            Has Image
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{post.content}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve for Website
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {pinnedPosts
              .filter(post => post.status === 'approved')
              .map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pin className="h-4 w-4 text-primary" />
                          {post.author} - {post.school}
                        </CardTitle>
                        <CardDescription>{post.date}</CardDescription>
                      </div>
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Live on Website
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{post.content}</p>
                    <Button size="sm" variant="outline">
                      Remove from Website
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Quick Admin Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/manage-users')}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage platform users</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/analytics')}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View platform reports</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/badges-challenges')}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Badge Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage badges & challenges</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/review-submissions')}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Content Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Review content queue</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;