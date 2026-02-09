import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, QrCode, Link2, Activity, HelpCircle, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from "@/config/api";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { teacherRippleCardTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import Seo from "@/components/Seo";

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
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_ripple_card_tutorial_completed",
    steps: teacherRippleCardTutorialSteps,
  });
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

  // Download QR code with high quality
  const handleDownloadQR = async (rippleId: string, qrUrl: string) => {
    try {
      // Create a high-resolution canvas for the QR code
      const scale = 4; // 4x resolution for crisp output
      const outputSize = 800; // Final size in pixels
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast({
          title: "Error",
          description: "Failed to create canvas",
          variant: "destructive",
        });
        return;
      }

      // Set high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Load the QR code image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Draw the image at high resolution
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputSize, outputSize);
        ctx.drawImage(img, 0, 0, outputSize, outputSize);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ripple-qr-${rippleId}-high-quality.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast({
              title: "Success",
              description: "QR code downloaded successfully",
            });
          }
        }, 'image/png', 1.0); // Maximum quality
      };

      img.onerror = () => {
        // Fallback: try to download the image directly
        const a = document.createElement('a');
        a.href = qrUrl;
        a.download = `ripple-qr-${rippleId}.png`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Downloaded",
          description: "QR code downloaded (may be lower quality)",
        });
      };

      img.src = qrUrl;
    } catch (error: any) {
      console.error('Error downloading QR code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="text-center py-10">Loading ripple cards...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (cards.length === 0) return <div className="text-center py-10">No ripple cards found.</div>;

  return (
    <>
      <Seo title="Ripple Card - Teacher Panel" description="Manage and share your Ripple Card" />
      
      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="teacher_ripple_card_tutorial_completed"
      />
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Digital Ripple Cards
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage digital cards for minors
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={startTutorial}
              variant="outline"
              size="sm"
              className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
              title="Take a tour of this page"
            >
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help</span>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'active' | 'inactive' | 'all')}
                className="flex-1 sm:flex-initial border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
        <Card data-tutorial-target="ripple-card-display" className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl">All Digital Ripple Cards</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1">View and manage all generated digital Ripple Cards</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => fetchRippleCard(card.ripple_id)}
                      data-tutorial-target={filteredCards.indexOf(card) === 0 ? "share-button" : undefined}
                    >
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
          <DialogContent className="max-w-md sm:max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Digital Ripple Card</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Card details for {selectedCard.assigned_to || "Unassigned"}
              </DialogDescription>
            </DialogHeader>

            {dialogLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading card details...</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 mt-4">
                <div className="text-center" data-tutorial-target="qr-code">
                  {selectedCard.qr_code_url && (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={selectedCard.qr_code_url}
                        alt="QR Code"
                        className="mx-auto w-40 h-40 sm:w-48 sm:h-48 object-contain border-2 border-gray-200 rounded-lg p-2"
                        id={`qr-image-${selectedCard.ripple_id}`}
                        crossOrigin="anonymous"
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">Scan to join with this card</p>
                      <Button
                        onClick={() => handleDownloadQR(selectedCard.ripple_id, selectedCard.qr_code_url!)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download QR Code
                      </Button>
                    </div>
                  )}
                </div>

                  <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-lg p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">Ripple ID:</span>
                      <span className="font-mono text-sm sm:text-base font-semibold text-gray-900 break-all">{selectedCard.ripple_id}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">Shareable Link:</span>
                      <a
                        href={selectedCard.shareable_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700 underline text-sm sm:text-base break-all text-right sm:text-left"
                      >
                        Open Link
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">Stories:</span>
                      <span className="font-semibold text-sm sm:text-base text-gray-900">{selectedCard.stories}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">Status:</span>
                      <Badge variant={selectedCard.status === 'active' ? 'default' : 'secondary'} className="w-fit">
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
    </>
  );
}