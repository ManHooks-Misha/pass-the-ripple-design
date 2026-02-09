import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, QrCode, Link2, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from "@/config/api";

interface RippleCard {
  ripple_id: string;
  status: 'active' | 'inactive';
  assigned_to?: string | null;
  user_nickname?: string;
  created_at: string;
  last_active?: string | null;
  qr_code_url?: string;
  qr_code_data?: string;
  shareable_link: string;
  stories: number;
}

export default function DigitalRippleCards() {
  const [cards, setCards] = useState<RippleCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<RippleCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<RippleCard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogLoading, setDialogLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');

  // Fetch all cards
  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch<any>("/admin/ripple-ids?all=1");
        let list: RippleCard[] = [];

        if (res.data?.list?.data) {
          list = res.data.list.data;
        } else if (res.data?.data) {
          list = res.data.data;
        } else if (Array.isArray(res.data)) {
          list = res.data;
        }

        setCards(list);
        setFilteredCards(list); // initially show all
      } catch (err: any) {
        console.error("Failed to load ripple cards:", err);
        setError(err.message || "Failed to load ripple cards");
        toast({
          title: "Error",
          description: err.message || "Failed to load ripple cards",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Filter cards by status whenever cards or filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredCards(cards);
    } else {
      setFilteredCards(cards.filter(c => c.status === statusFilter));
    }
  }, [statusFilter, cards]);

  // Fetch single card by ripple_id
  const fetchRippleCard = async (rippleId: string) => {
    setDialogLoading(true);
    setSelectedCard(null); // reset before loading
    try {
      const res = await apiFetch<RippleCard>(`/admin/ripple-ids/${rippleId}`);
      if (res.success && res.data) {
        setSelectedCard(res.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch ripple card",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to fetch ripple card",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading ripple cards...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (cards.length === 0) return <div className="text-center py-10">No ripple cards found.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Digital Ripple Cards</h1>
          <p className="text-muted-foreground">Manage digital cards for minors</p>
        </div>

        {/* Status Filter Dropdown */}
        <div>
          <label className="mr-2 font-medium">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'active' | 'inactive' | 'all')}
            className="border rounded p-1"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cards.length}</div>
            <p className="text-xs text-muted-foreground">Generated cards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cards.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cards.reduce((sum, card) => sum + card.stories, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Logged stories</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Digital Ripple Cards</CardTitle>
          <CardDescription>View and manage all generated digital Ripple Cards</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ripple ID</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Stories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.map(card => (
                <TableRow key={card.ripple_id}>
                  <TableCell className="font-medium">{card.ripple_id}</TableCell>
                  <TableCell>{card.user_nickname || "Unassigned"}</TableCell>
                  <TableCell>{new Date(card.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{card.stories}</TableCell>
                  <TableCell>
                    <Badge variant={card.status === 'active' ? 'default' : 'secondary'}>
                      {card.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => fetchRippleCard(card.ripple_id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Card Dialog */}
      {selectedCard && (
        <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Digital Ripple Card</DialogTitle>
              <DialogDescription>
                Card details for {selectedCard.assigned_to || "Unassigned"}
              </DialogDescription>
            </DialogHeader>

            {dialogLoading ? (
              <div className="text-center py-10">Loading card details...</div>
            ) : (
              <div className="space-y-4 mt-4">
                <div className="text-center">
                  {selectedCard.qr_code_url && (
                    <img
                      src={selectedCard.qr_code_url}
                      alt="QR Code"
                      className="mx-auto w-48 h-48"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ripple ID:</span>
                    <span className="font-medium">{selectedCard.ripple_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Shareable Link:</span>
                    <a
                      href={selectedCard.shareable_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600"
                    >
                      Open Link
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stories:</span>
                    <span className="font-medium">{selectedCard.stories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={selectedCard.status === 'active' ? 'default' : 'secondary'}>
                      {selectedCard.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}