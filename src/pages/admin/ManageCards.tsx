import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layouts/includes/HeaderLoggedIn";
import FooterSection from "@/components/layouts/includes/FooterSection";
import Seo from "@/components/Seo";
import { Plus, CreditCard, QrCode, Link2, MapPin, ChevronLeft, Download, Send } from "lucide-react";
import { Link } from "react-router-dom";

const ManageCards = () => {
  const [quantity, setQuantity] = useState("10");
  const [assignTo, setAssignTo] = useState("");

  // Mock card data
  const cards = [
    {
      id: "RK-2024-001",
      owner: "Emma Johnson",
      status: "active",
      stories: 12,
      miles: 234,
      lastActive: "2 hours ago",
      qrEnabled: true,
      linkEnabled: true
    },
    {
      id: "RK-2024-002",
      owner: "Liam Smith",
      status: "active",
      stories: 8,
      miles: 156,
      lastActive: "1 day ago",
      qrEnabled: true,
      linkEnabled: false
    },
    {
      id: "RK-2024-003",
      owner: "Unassigned",
      status: "available",
      stories: 0,
      miles: 0,
      lastActive: "Never",
      qrEnabled: false,
      linkEnabled: false
    },
    {
      id: "RK-2024-004",
      owner: "Sophia Davis",
      status: "completed",
      stories: 25,
      miles: 567,
      lastActive: "1 week ago",
      qrEnabled: true,
      linkEnabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Manage Ripple Cards — Pass The Ripple Admin"
        description="Create and manage digital Ripple Cards"
        canonical={`${window.location.origin}/admin/cards`}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Pass The Ripple Card Management' }}
      />
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Admin Panel
          </Link>
          <h1 className="text-4xl font-bold text-primary mb-2">Ripple Card Management</h1>
          <p className="text-muted-foreground">Create, assign, and track digital Ripple Cards</p>
        </div>

        {/* Card Statistics */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,421</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">2,856</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">565</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed Chains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">892</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Cards</TabsTrigger>
            <TabsTrigger value="manage">Manage Existing</TabsTrigger>
            <TabsTrigger value="batch">Batch Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Generate New Cards</CardTitle>
                  <CardDescription>Create a batch of new Ripple Cards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Number of Cards</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prefix">Card Prefix (Optional)</Label>
                    <Input
                      id="prefix"
                      placeholder="e.g., SCHOOL-2024"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Enable QR Codes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Generate Short Links</span>
                    </label>
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Cards
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Assignment</CardTitle>
                  <CardDescription>Assign cards to users or schools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="assignTo">Assign To</Label>
                    <Input
                      id="assignTo"
                      placeholder="User email or school name"
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardIds">Card IDs</Label>
                    <Textarea
                      id="cardIds"
                      placeholder="Enter card IDs separated by commas"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Assignment Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Optional notes about this assignment"
                      rows={2}
                    />
                  </div>
                  <Button className="w-full" variant="secondary">
                    <Send className="h-4 w-4 mr-2" />
                    Assign Cards
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Active Ripple Cards</CardTitle>
                <CardDescription>Monitor and manage existing cards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Card ID</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stories</TableHead>
                        <TableHead>Miles</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell className="font-mono text-sm">{card.id}</TableCell>
                          <TableCell>{card.owner}</TableCell>
                          <TableCell>
                            <Badge variant={
                              card.status === 'active' ? 'default' :
                              card.status === 'available' ? 'secondary' :
                              'outline'
                            }>
                              {card.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{card.stories}</TableCell>
                          <TableCell>{card.miles} mi</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {card.qrEnabled && (
                                <Badge variant="outline" className="text-xs">
                                  <QrCode className="h-3 w-3" />
                                </Badge>
                              )}
                              {card.linkEnabled && (
                                <Badge variant="outline" className="text-xs">
                                  <Link2 className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {card.lastActive}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batch">
            <Card>
              <CardHeader>
                <CardTitle>Batch Operations</CardTitle>
                <CardDescription>Perform bulk actions on multiple cards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Export Cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Download card data as CSV for printing or distribution
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export to CSV
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Bulk Assign</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload CSV to assign cards to multiple users
                      </p>
                      <Button variant="outline" className="w-full">
                        Upload CSV
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Generate Printable Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create PDF sheets with QR codes for physical distribution
                    </p>
                    <div className="flex gap-2">
                      <Input placeholder="Enter card ID range (e.g., RK-2024-001 to RK-2024-100)" />
                      <Button>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Generate PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <FooterSection />
    </div>
  );
};

export default ManageCards;