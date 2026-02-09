import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Target,
  Search,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  Calendar,
  Grid as GridIcon,
  List as ListIcon,
  Filter,
  RefreshCw,
  Layout,
  Layers,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/config/api';
import { getImageUrl } from '@/utils/imageUrl';
import ChallengeCardDisplay from '@/components/admin/ChallengeCardDisplay';
import { DEFAULT_ELEMENTS, CardElement } from '@/components/admin/CardCanvas';

// --- TYPES ---

interface ChallengeCard {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  layout_id: number | null;
  layout_color: string | null;
  tier_id: number | null;
  badge_id: number | null;
  badge_count: number;
  ripple_category_id: number | null;
  challenge_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  start_date: string | null;
  end_date: string | null;
  image_path: string | null;
  card_config: {
    elements?: CardElement[];
    period_number?: number;
    action_items?: { text: string; subActions: string[] }[];
    tagline?: string;
  } | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  layout?: {
    id: number;
    name: string;
    image_url?: string;
  };
  badge?: {
    id: number;
    name: string;
    badge_image_path: string | null;
  };
}

interface FilterOptions {
  layouts: { id: number; name: string; category: string }[];
  badges: { id: number; name: string }[];
  tiers: { id: number; name: string; color: string; level: number }[];
  ripple_categories: { id: number; name: string }[];
  categories: string[]; // layout categories
}

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  { value: 'archived', label: 'Archived', color: 'bg-yellow-100 text-yellow-800' }
];

const CHALLENGE_TYPES = [
  { value: 'daily', label: 'Daily', icon: '☀️' },
  { value: 'weekly', label: 'Weekly', icon: '📅' },
  { value: 'monthly', label: 'Monthly', icon: '🌙' },
  { value: 'yearly', label: 'Yearly', icon: '🎯' },
  { value: 'custom', label: 'Custom', icon: '⚙️' }
];

export default function ChallengeCards() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<ChallengeCard[]>([]);
  const [viewType, setViewType] = useState<'list' | 'grid'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    category: 'all', // Layout Category
    tier_id: 'all',
    ripple_category_id: 'all'
  });

  // Options State
  const [options, setOptions] = useState<FilterOptions>({
    layouts: [],
    badges: [],
    tiers: [],
    ripple_categories: [],
    categories: []
  });

  // Fetch Options
  const fetchOptions = async () => {
    try {
      const response = await apiFetch<{ data: FilterOptions }>('/admin/challenge-cards/form-options');
      setOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch options', error);
    }
  };

  // Fetch Cards
  const fetchCards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('challenge_type', filters.type); // Backend needs to support this
      if (filters.tier_id !== 'all') params.append('tier_id', filters.tier_id);
      if (filters.ripple_category_id !== 'all') params.append('ripple_category_id', filters.ripple_category_id);

      // Note: Layout category might need complex filtering on backend or frontend
      // For now, we fetch all and filter layout specific things on frontend if backend doesn't support it 
      // OR we just send parameters and hope backend ignores if not implemented yet.
      // Based on previous code, backend accepted 'search' and 'status'.
      // We should check if backend supports other filters. If not, we filter client side.

      const response = await apiFetch<{ data: ChallengeCard[], pagination: any }>(
        `/admin/challenge-cards?${params.toString()}&t=${Date.now()}`
      );

      let fetchedCards = response.data || [];

      // Client-side filtering fallback (in case backend doesn't support all params yet)
      // Layout Category
      if (filters.category !== 'all') {
        const layoutIds = options.layouts.filter(l => l.category === filters.category).map(l => l.id);
        fetchedCards = fetchedCards.filter(c => c.layout_id && layoutIds.includes(c.layout_id));
      }

      // Tier
      if (filters.tier_id !== 'all') {
        fetchedCards = fetchedCards.filter(c => c.tier_id === Number(filters.tier_id));
      }

      // Ripple Category
      if (filters.ripple_category_id !== 'all') {
        fetchedCards = fetchedCards.filter(c => c.ripple_category_id === Number(filters.ripple_category_id));
      }

      // Challenge Type
      if (filters.type !== 'all') {
        fetchedCards = fetchedCards.filter(c => c.challenge_type === filters.type);
      }

      setCards(fetchedCards);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to fetch cards', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchCards();
  }, [filters]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this challenge card?')) return;

    try {
      await apiFetch(`/admin/challenge-cards/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Challenge card deleted!' });
      fetchCards(); // Refresh
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={statusOption?.color || 'bg-gray-100'}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      category: 'all',
      tier_id: 'all',
      ripple_category_id: 'all'
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challenge Cards</h1>
          <p className="text-muted-foreground mt-1">Manage, design, and organize your challenge cards</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted p-1 rounded-lg flex items-center">
            <Button
              variant={viewType === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewType('grid')}
              className="h-8 w-8 p-0"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewType('list')}
              className="h-8 w-8 p-0"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => navigate('/admin/challenge-cards/create')}>
            <Plus className="h-4 w-4 mr-2" /> Create Model
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search challenges..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(filters.status !== 'all' || filters.type !== 'all' || filters.category !== 'all' || filters.tier_id !== 'all' || filters.ripple_category_id !== 'all') && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">Active</Badge>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={fetchCards} title="Refresh">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2 border-t mt-2">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Status</span>
                  <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Type</span>
                  <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {CHALLENGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Layout Category</span>
                  <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {options.categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Tier</span>
                  <Select value={filters.tier_id} onValueChange={(v) => handleFilterChange('tier_id', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      {options.tiers.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Ripple Category</span>
                  <Select value={filters.ripple_category_id} onValueChange={(v) => handleFilterChange('ripple_category_id', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ripple Cats</SelectItem>
                      {options.ripple_categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 md:col-span-3 lg:col-span-5 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive">Clear Filters</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-muted-foreground/25">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No challenge cards found</h3>
          <p className="mb-6">Try adjusting your filters or create a new card.</p>
          <Button onClick={() => navigate('/admin/challenge-cards/create')}>
            <Plus className="h-4 w-4 mr-2" /> Create First Challenge
          </Button>
        </div>
      ) : viewType === 'grid' ? (
        // GRID VIEW
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {cards.map(card => {
            // Prepare elements for display
            const elements = card.card_config?.elements
              ? card.card_config.elements
              : DEFAULT_ELEMENTS; // Fallback? Or maybe empty array?

            // If fallback, we might want to minimally hydrate it for preview if possible
            // But usually saved cards have config. 

            return (
              <div key={card.id} className="group relative flex flex-col gap-2">
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-sm border bg-gray-100 transition-all group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary/20">
                  {/* Card Preview */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ChallengeCardDisplay
                      layoutColor={card.layout_color || '#ffffff'}
                      title={card.name}
                      description={card.description}
                      badgeName={card.badge?.name || 'Badge'}
                      badgeImageUrl={card.badge?.badge_image_path}
                      weekNumber={card.card_config?.period_number || 1}
                      actionItems={card.card_config?.action_items?.map(a => a.text) || []}
                      tagline={card.card_config?.tagline || ''}
                      elements={elements}
                      scale={0.5} // Base scale, but we need responsive scaling or fluid
                      width={600}
                      height={900}
                    />
                    {/* Overlay Scale Fix: 
                         CardDisplay is fixed pixel size (600x900). 
                         We need to scale it to fit container.
                         Container is aspect 2/3. 
                         If container width is W, scale = W / 600.
                         Since we can't easily adhere to DOM width in react without ref, 
                         we can stick to CSS 'transform: scale()' on a wrapper that is 600x900 but scaled down.
                      */}
                  </div>

                  {/* CSS-only responsive scaling using container query logic or simple absolute positioning */}
                  <div className="absolute inset-0 bg-transparent z-10" /> {/* blocker */}

                  {/* Top Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm" onClick={(e) => { e.stopPropagation(); navigate(`/admin/challenge-cards/${card.id}/edit`); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status Badge Over Preview */}
                  <div className="absolute top-2 left-2 z-20">
                    {getStatusBadge(card.status)}
                  </div>
                </div>

                {/* Card Meta */}
                <div className="px-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate pr-2" title={card.name}>{card.name}</h3>
                    <Badge variant="outline" className="text-[10px] h-5">{card.layout?.name || 'Layout'}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(card.start_date)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // LIST VIEW
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Found {cards.length} cards</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type/Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell>
                        <div className="w-10 h-14 bg-gray-100 rounded border overflow-hidden relative">
                          {card.layout?.image_url ? (
                            <img src={card.layout.image_url} className="w-full h-full object-cover opacity-50" alt="" />
                          ) : (
                            <div className="w-full h-full bg-muted" style={{ backgroundColor: card.layout_color || undefined }} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{card.name}</div>
                          {card.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {card.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {card.badge && (
                            <div className="flex items-center gap-1 text-xs">
                              <Trophy className="h-3 w-3 text-yellow-500" />
                              {card.badge.name}
                            </div>
                          )}
                          <div className="flex gap-1">
                            {/* We don't have direct access to Tier Name inside card root unless we joined it differently, 
                                  but we have tier_id. Ideally backend provides tier relation. 
                                  Assuming backend output includes it or we map it from options. 
                              */}
                            {card.tier_id && options.tiers.find(t => t.id === card.tier_id)?.name && (
                              <Badge variant="outline" className="text-[10px]">
                                {options.tiers.find(t => t.id === card.tier_id)?.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(card.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(card.start_date)}
                          </div>
                          <div className="text-xs text-muted-foreground ml-4">{formatDate(card.end_date)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/challenge-cards/${card.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(card.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

