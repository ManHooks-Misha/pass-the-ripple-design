import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  Users,
  Database,
  CreditCard,
  Activity,
  Award,
  FileText,
  Trophy,
  BarChart,
  Settings,
  ArrowRight,
  Shield,
  BookOpen,
  Map,
  Zap
} from "lucide-react";

const AdminPanel = () => {
  const adminSections = [
    {
      title: "User Management",
      description: "View, search, and manage all platform users",
      icon: Users,
      link: "/admin/manage-users",
      stats: "Active Users"
    },
    {
      title: "Content Management",
      description: "Manage pages, policies, and static content",
      icon: BookOpen,
      link: "/admin/content-management",
      stats: "Pages & SEO"
    },
    {
      title: "Ripple Stories",
      description: "Review and moderate user-submitted stories",
      icon: FileText,
      link: "/admin/my-stories",
      stats: "Submissions"
    },
    {
      title: "Gamification",
      description: "Manage challenges, badges, and tiers",
      icon: Trophy,
      link: "/admin/challenges",
      stats: "Engagement"
    },
    {
      title: "Reward System",
      description: "Configure reward points and cards",
      icon: CreditCard,
      link: "/admin/reward-cards",
      stats: "Rewards"
    },
    {
      title: "Analytics Hub",
      description: "System-wide reports and growth insights",
      icon: BarChart,
      link: "/admin/analytics",
      stats: "Reports"
    },
    {
      title: "Hero Wall",
      description: "Curate and feature community highlights",
      icon: Zap,
      link: "/admin/hero-wall",
      stats: "Curated Content"
    },
    {
      title: "System Settings",
      description: "Platform-wide configuration and security",
      icon: Settings,
      link: "/admin/settings",
      stats: "Config"
    },
    {
      title: "Notification Hub",
      description: "Broadcast system-wide alerts and updates",
      icon: Activity,
      link: "/admin/manage-notifications",
      stats: "Messaging"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <Seo
        title="Admin Panel — Pass The Ripple"
        description="Complete administrative control panel for Pass The Ripple platform"
        canonical={`${window.location.origin}/admin`}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Pass The Ripple Admin Panel' }}
      />

      <PageHeader
        title="Admin Panel"
        description="Welcome to your administrative hub. Manage platform activity and configurations below."
      />

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 font-medium uppercase tracking-wider text-[10px]">Platform Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-semibold text-sm">All Systems Online</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-purple-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 font-medium uppercase tracking-wider text-[10px]">Total Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15K+</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-pink-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-pink-600 font-medium uppercase tracking-wider text-[10px]">Recent Ripples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 font-medium uppercase tracking-wider text-[10px]">Pending Tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.title} to={section.link} className="group transition-all">
              <Card className="h-full border border-muted-foreground/10 hover:border-primary/50 hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1 bg-muted rounded-full group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      {section.stats}
                    </span>
                  </div>
                  <CardTitle className="text-xl decoration-primary group-hover:underline underline-offset-4 decoration-2">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-between p-0 font-medium group-hover:text-primary">
                    Manage Section
                    <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Card */}
      <Card className="border border-muted-foreground/10">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Recent Administrative Actions</CardTitle>
              <CardDescription>Logs of the latest platform management activities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-muted-foreground/10">
            {[
              { action: "Logo updated in Application Settings", author: "Admin Sarah", time: "2 min ago" },
              { action: "Approved 12 'Friendship' challenge badges", author: "Admin John", time: "45 min ago" },
              { action: "Blocked suspicious user account (ID: 452)", author: "System Auto-Mod", time: "2 hours ago" },
              { action: "Published new Privacy Policy version (v2.4)", author: "Admin Sarah", time: "3 hours ago" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.action}</span>
                  <span className="text-xs text-muted-foreground">Modified by {item.author}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t bg-muted/10 text-center">
            <Link to="/admin/analytics" className="text-sm font-medium text-primary hover:underline">
              View all system activity logs
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;