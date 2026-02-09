import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Plus,
  Target,
  Calendar,
  Image as ImageIcon,
  Palette,
  Trophy,
  CheckCircle,
  XCircle,
  Edit3,
  PenTool,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload,
  Layers,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData } from '@/config/api';
import { getImageUrl } from '@/utils/imageUrl';
import CardCanvas, { CardElement, DEFAULT_ELEMENTS } from '@/components/admin/CardCanvas';
import { DEFAULT_ELEMENT_STYLE } from '@/components/admin/ElementStyleToolbar';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

interface ChallengeCard {
  id: number;
  name: string;
  description: string | null;
  layout_id: number | null;
  layout_color: string | null;
  card_config: any;
  challenge_type: string;
  timing_type: string;
  tier_id: number | null;
  badge_id: number | null;
  badge_count: number;
  ripple_category_id: number | null;
  start_date: string | null;
  end_date: string | null;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  is_active: boolean;
  image_path?: string | null;
}

interface ChallengeCardLayout {
  id: number;
  name: string;
  category: string;
  layout_image_path: string | null;
  image_url?: string;
  is_active: boolean;
}

interface TierData {
  id: number;
  name: string;
  level: number;
  color: string;
}

interface BadgeData {
  id: number;
  name: string;
  description: string | null;
  badge_image_path: string | null;
  tier_id: number;
  is_active: boolean;
}



interface RippleCategoryData {
  id: number;
  name: string;
  icon: string | null;
  icon_url: string | null;
}

const CHALLENGE_TYPES = [
  { value: 'daily', label: 'Daily', icon: '☀️', unit: 'Day' },
  { value: 'weekly', label: 'Weekly', icon: '📅', unit: 'Week' },
  { value: 'monthly', label: 'Monthly', icon: '🌙', unit: 'Month' },
  { value: 'yearly', label: 'Yearly', icon: '🎯', unit: 'Year' },
  { value: 'custom', label: 'Custom', icon: '⚙️', unit: 'Custom' }
];

export default function EditChallengeCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [card, setCard] = useState<ChallengeCard | null>(null);
  const [layouts, setLayouts] = useState<ChallengeCardLayout[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [rippleCategories, setRippleCategories] = useState<RippleCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [challengeImage, setChallengeImage] = useState<File | null>(null);
  const [challengeImagePreview, setChallengeImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    layout_id: 'none',
    layout_color: '#1e3a5f',
    challenge_type: 'weekly',
    tier_id: 'none',
    badge_id: 'none',
    badge_count: 1,
    ripple_category_id: 'none',
    start_date: '',
    end_date: '',
    is_active: true,
    period_number: 1,
    tagline: 'Small kindness always counts!'
  });

  const [actionsHtml, setActionsHtml] = useState<string>('');
  const [cardElements, setCardElements] = useState<CardElement[]>(DEFAULT_ELEMENTS);
  // expandedActions removed

  const timeUnit = useMemo(() => {
    const type = CHALLENGE_TYPES.find(t => t.value === formData.challenge_type);
    return type?.unit || 'Week';
  }, [formData.challenge_type]);

  const filteredBadges = useMemo(() => {
    if (formData.tier_id === 'none') return badges;
    return badges.filter(b => b.tier_id === parseInt(formData.tier_id));
  }, [badges, formData.tier_id]);

  const selectedLayout = useMemo(() => {
    if (formData.layout_id === 'none') return null;
    return layouts.find(l => l.id.toString() === formData.layout_id) || null;
  }, [formData.layout_id, layouts]);

  const filteredLayouts = useMemo(() => {
    return layouts.filter(l => selectedCategory === 'all' || l.category === selectedCategory);
  }, [layouts, selectedCategory]);

  // Sync all form data to card elements (Title, Description, Week, Tagline, Image, Badge)
  useEffect(() => {
    if (!card) return;

    setCardElements(prev => {
      const newElements = prev.map(el => {
        switch (el.id) {
          case 'title':
            return { ...el, content: formData.name || 'Challenge Title' };
          case 'description':
            return { ...el, content: formData.description || 'What the challenge is:' };
          case 'tagline':
            return { ...el, content: formData.tagline || 'Small kindness always counts!' };
          case 'week-number':
            return { ...el, content: `Week ${formData.period_number || 1}` };
          case 'illustration':
            if (challengeImagePreview && el.content !== challengeImagePreview) {
              return { ...el, content: challengeImagePreview };
            }
            // If no new preview but we have saved image path and it's not set
            return el;
          case 'footer-badge':
            // Same logic as create
            return el;
          default:
            return el;
        }
      });
      return newElements;
    });
  }, [formData.name, formData.description, formData.tagline, formData.period_number, challengeImagePreview, card]); // Added card dependency

  // Sync actions HTML to card elements
  useEffect(() => {
    setCardElements(prev => {
      let newElements = [...prev];

      // Remove legacy action elements and existing actions-detail
      newElements = newElements.filter(e => !e.id.startsWith('action-') && e.id !== 'actions' && e.id !== 'actions-detail');

      if (actionsHtml.trim()) {
        // Check if we need to preserve position/style from existing element or use default
        const existingDetails = prev.find(e => e.id === 'actions-detail');

        if (existingDetails) {
          newElements.push({ ...existingDetails, content: actionsHtml });
        } else {
          newElements.push({
            id: 'actions-detail',
            type: 'actions-detail',
            content: actionsHtml,
            position: { x: 30, y: 550 },
            size: { width: 540, height: 200 },
            style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 16, textAlign: 'left', lineHeight: 1.6 },
            visible: true,
            locked: false
          });
        }
      }

      return newElements;
    });
  }, [actionsHtml]);

  // Sync layout image to card elements as a layer
  useEffect(() => {
    if (selectedLayout?.image_url) {
      setCardElements(prev => {
        const existingIndex = prev.findIndex(e => e.type === 'layout-image');
        // Prevent unnecessary updates if content is same (avoid loops if any)
        if (existingIndex >= 0 && prev[existingIndex].content === selectedLayout.image_url) {
          return prev;
        }

        const newElement: CardElement = {
          id: 'layout-bg',
          type: 'layout-image',
          content: selectedLayout.image_url!,
          position: { x: 0, y: 0 },
          size: { width: 600, height: 900 },
          style: { ...DEFAULT_ELEMENT_STYLE, opacity: 100 },
          visible: true,
          locked: true, // Default to locked
          behindLayout: false
        };

        if (existingIndex >= 0) {
          const newElements = [...prev];
          newElements[existingIndex] = { ...newElements[existingIndex], content: selectedLayout.image_url! };
          return newElements;
        } else {
          // Add to bottom (start of array)
          return [newElement, ...prev];
        }
      });
    } else if (formData.layout_id === 'none') {
      setCardElements(prev => prev.filter(e => e.type !== 'layout-image'));
    }
  }, [selectedLayout?.image_url, formData.layout_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch card details (also disable cache to ensure we get latest edits)
      const cardResponse = await apiFetch<{ data: ChallengeCard }>(`/admin/challenge-cards/${id}`, {}, { disableCache: true });
      const cardData = cardResponse.data;
      setCard(cardData);

      // Fetch options (disable cache to ensure we get latest tiers/badges)
      const optionsResponse = await apiFetch<{ data: { layouts: ChallengeCardLayout[], badges: BadgeData[], tiers: TierData[], ripple_categories: RippleCategoryData[], categories: string[] } }>(
        '/admin/challenge-cards/form-options',
        {},
        { disableCache: true }
      );
      setLayouts(optionsResponse.data.layouts || []);
      setBadges(optionsResponse.data.badges || []);
      setTiers(optionsResponse.data.tiers || []);
      setRippleCategories(optionsResponse.data.ripple_categories || []);
      setCategories(optionsResponse.data.categories || []);

      setFormData({
        name: cardData.name,
        description: cardData.description || '',
        layout_id: cardData.layout_id?.toString() || 'none',
        layout_color: cardData.layout_color || '#1e3a5f',
        challenge_type: cardData.challenge_type || 'weekly',
        tier_id: cardData.tier_id?.toString() || 'none',
        badge_id: cardData.badge_id?.toString() || 'none',
        badge_count: cardData.badge_count || 1,
        ripple_category_id: cardData.ripple_category_id?.toString() || 'none',
        start_date: cardData.start_date ? new Date(cardData.start_date).toISOString().slice(0, 16) : '',
        end_date: cardData.end_date ? new Date(cardData.end_date).toISOString().slice(0, 16) : '',
        is_active: cardData.status === 'active',
        period_number: cardData.card_config?.period_number || 1,
        tagline: cardData.card_config?.tagline || 'Small kindness always counts!'
      });

      if (cardData.card_config?.action_html) {
        setActionsHtml(cardData.card_config.action_html);
      } else if (cardData.card_config?.action_items?.length) {
        // Legacy migration
        const listItems = cardData.card_config.action_items.map((a: any) => {
          const text = typeof a === 'string' ? a : a.text;
          const sub = (a.subActions || []).map((s: string) => `<li>${s}</li>`).join('');
          return `<li>${text}${sub ? `<ul>${sub}</ul>` : ''}</li>`;
        }).join('');
        setActionsHtml(`<ul>${listItems}</ul>`);
      }

      if (cardData.card_config?.elements) setCardElements(cardData.card_config.elements);
      if (cardData.image_path) setChallengeImagePreview(getImageUrl(cardData.image_path));
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to fetch card', variant: 'destructive' });
      navigate('/admin/challenge-cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  useEffect(() => {
    if (formData.badge_id !== 'none') {
      setSelectedBadge(badges.find(b => b.id === parseInt(formData.badge_id)) || null);
    } else { setSelectedBadge(null); }
  }, [formData.badge_id, badges]);

  useEffect(() => {
    if (formData.tier_id !== 'none' && formData.badge_id !== 'none') {
      const badge = badges.find(b => b.id === parseInt(formData.badge_id));
      if (badge && badge.tier_id !== parseInt(formData.tier_id)) {
        setFormData(prev => ({ ...prev, badge_id: 'none' }));
      }
    }
  }, [formData.tier_id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setChallengeImage(file); const reader = new FileReader(); reader.onload = () => setChallengeImagePreview(reader.result as string); reader.readAsDataURL(file); }
  };
  const removeImage = () => { setChallengeImage(null); setChallengeImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast({ title: 'Error', description: 'Card name is required', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('_method', 'PUT');
      formDataObj.append('name', formData.name.trim());
      formDataObj.append('description', formData.description.trim() || '');
      formDataObj.append('layout_id', formData.layout_id !== 'none' ? formData.layout_id : '');
      formDataObj.append('layout_color', formData.layout_color);
      formDataObj.append('challenge_type', formData.challenge_type);
      formDataObj.append('tier_id', formData.tier_id !== 'none' ? formData.tier_id : '');
      formDataObj.append('badge_id', formData.badge_id !== 'none' ? formData.badge_id : '');
      formDataObj.append('badge_count', formData.badge_count.toString());
      formDataObj.append('ripple_category_id', formData.ripple_category_id !== 'none' ? formData.ripple_category_id : '');
      formDataObj.append('start_date', formData.start_date);
      formDataObj.append('end_date', formData.end_date);
      formDataObj.append('is_active', formData.is_active ? '1' : '0');
      formDataObj.append('card_config', JSON.stringify({ elements: cardElements, period_number: formData.period_number, action_html: actionsHtml, action_items: [], tagline: formData.tagline }));
      if (challengeImage) formDataObj.append('challenge_image', challengeImage);

      await apiFetchFormData(`/admin/challenge-cards/${id}`, {
        method: 'POST',
        body: formDataObj
      });
      toast({ title: 'Success', description: 'Challenge card updated!' });
      navigate('/admin/challenge-cards');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleResetElements = () => {
    const newElements = DEFAULT_ELEMENTS.map(el => {
      // Hydrate default elements with current form data immediately
      switch (el.id) {
        case 'title':
          return { ...el, content: formData.name || 'Challenge Title' };
        case 'description':
          return { ...el, content: formData.description || 'What the challenge is:' };
        case 'tagline':
          return { ...el, content: formData.tagline || 'Small kindness always counts!' };
        case 'illustration':
          return { ...el, content: challengeImagePreview || '' };
        case 'footer-badge':
          return { ...el, content: selectedBadge?.badge_image_path || '' };
        default:
          return el;
      }
    });

    // Manually add week element if not in default
    if (!newElements.find(e => e.id === 'week-number')) {
      newElements.push({
        id: 'week-number',
        type: 'week',
        content: `Week ${formData.period_number || 1}`,
        position: { x: 480, y: 30 },
        size: { width: 100, height: 100 },
        style: { ...DEFAULT_ELEMENT_STYLE, borderRadius: 50, backgroundColor: 'transparent' },
        visible: true,
        locked: false
      });
    }

    // Restore Layout Image
    if (selectedLayout?.image_url) {
      newElements.unshift({
        id: 'layout-bg',
        type: 'layout-image',
        content: selectedLayout.image_url,
        position: { x: 0, y: 0 },
        size: { width: 600, height: 900 },
        style: { ...DEFAULT_ELEMENT_STYLE, opacity: 100 },
        visible: true,
        locked: true,
        behindLayout: false
      });
    }

    // Restore Action Detail
    if (actionsHtml.trim()) {
      newElements.push({
        id: 'actions-detail',
        type: 'actions-detail',
        content: actionsHtml,
        position: { x: 30, y: 550 },
        size: { width: 540, height: 200 },
        style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 16, textAlign: 'left', lineHeight: 1.6 },
        visible: true,
        locked: false
      });
    }

    setCardElements(newElements);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!card) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><Target className="h-12 w-12 mx-auto mb-4" /><h2 className="text-xl font-semibold mb-2">Not Found</h2><Button onClick={() => navigate('/admin/challenge-cards')}>Back</Button></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4 mb-2"><Button variant="ghost" size="sm" onClick={() => navigate('/admin/challenge-cards')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></div>
          <div className="flex items-start justify-between">
            <div><h1 className="text-2xl font-bold">Edit Challenge Card</h1><p className="text-muted-foreground text-sm">{card.name}</p></div>
            <Badge variant="secondary"><Edit3 className="h-4 w-4 mr-2" />#{card.id}</Badge>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="content"><Target className="h-4 w-4 mr-2" />Content & Layout</TabsTrigger>
              <TabsTrigger value="design"><PenTool className="h-4 w-4 mr-2" />Design</TabsTrigger>
            </TabsList>

            <div className="absolute right-0 top-0 mt-[-60px] hidden lg:block">
              {/* Placeholder for header actions if needed */}
            </div>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Basic Info</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Title *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Type</Label>
                        <Select value={formData.challenge_type} onValueChange={(v) => setFormData({ ...formData, challenge_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CHALLENGE_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>))}</SelectContent></Select>
                      </div>
                      <div className="space-y-2"><Label>{timeUnit} #</Label><Input type="number" min="1" value={formData.period_number} onChange={(e) => setFormData({ ...formData, period_number: parseInt(e.target.value) || 1 })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} /></div>
                    <div className="space-y-2"><Label>Tagline</Label><Input value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} /></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" />Tier & Badge</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Tier</Label>
                        <Select value={formData.tier_id} onValueChange={(v) => setFormData({ ...formData, tier_id: v })}><SelectTrigger><SelectValue placeholder="Tier" /></SelectTrigger><SelectContent><SelectItem value="none">All</SelectItem>{tiers.map(t => (<SelectItem key={t.id} value={t.id.toString()}><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />{t.name}</div></SelectItem>))}</SelectContent></Select>
                      </div>
                      <div className="space-y-2"><Label>Badge Count</Label><Input type="number" min="1" max="10" value={formData.badge_count} onChange={(e) => setFormData({ ...formData, badge_count: parseInt(e.target.value) || 1 })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Badge</Label>
                      <Select value={formData.badge_id} onValueChange={(v) => setFormData({ ...formData, badge_id: v })}><SelectTrigger><SelectValue placeholder="Badge" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{filteredBadges.map(b => (<SelectItem key={b.id} value={b.id.toString()}><div className="flex items-center gap-2">{b.badge_image_path && <img src={getImageUrl(b.badge_image_path)} alt="" className="w-5 h-5 rounded-full" />}{b.name}</div></SelectItem>))}</SelectContent></Select>
                    </div>
                    {selectedBadge && <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">{selectedBadge.badge_image_path ? <img src={getImageUrl(selectedBadge.badge_image_path)} alt="" className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Trophy className="h-5 w-5" /></div>}<div><h4 className="font-semibold text-sm">{selectedBadge.name}</h4></div></div>}
                    <div className="space-y-2 pt-3 border-t"><Label>Ripple Category</Label>
                      <Select value={formData.ripple_category_id} onValueChange={(v) => setFormData({ ...formData, ripple_category_id: v })}><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{rippleCategories.map(c => (<SelectItem key={c.id} value={c.id.toString()}><div className="flex items-center gap-2">{c.icon_url && <img src={c.icon_url} alt="" className="w-5 h-5 rounded" />}{c.name}</div></SelectItem>))}</SelectContent></Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Schedule</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Start</Label><Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} /></div><div className="space-y-2"><Label>End</Label><Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} /></div></div>
                    <div className="flex items-center justify-between pt-2 border-t"><div><Label>Active</Label></div><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} /></div>
                  </CardContent>
                </Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Layout</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Category</Label><Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{categories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label>Color</Label><div className="flex gap-2"><Input type="color" value={formData.layout_color} onChange={(e) => setFormData({ ...formData, layout_color: e.target.value })} className="h-9 w-12 p-1" /><Input value={formData.layout_color} onChange={(e) => setFormData({ ...formData, layout_color: e.target.value })} className="flex-1" /></div></div></div>
                    <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto">{filteredLayouts.map(layout => (<div key={layout.id} onClick={() => setFormData({ ...formData, layout_id: layout.id.toString() })} className={`cursor-pointer rounded-lg border-2 overflow-hidden ${formData.layout_id === layout.id.toString() ? 'border-primary ring-2 ring-primary' : 'border-border'}`}><div className="bg-muted relative" style={{ backgroundColor: formData.layout_color }}>{layout.image_url ? <img src={layout.image_url} alt="" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center w-full h-full"><ImageIcon className="h-5 w-5" /></div>}{formData.layout_id === layout.id.toString() && <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5"><CheckCircle className="h-3 w-3" /></div>}</div><div className="p-1 text-xs text-center truncate">{layout.name}</div></div>))}</div>
                  </CardContent>
                </Card>
              </div>

              <Card><CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Image</CardTitle></CardHeader><CardContent><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />{challengeImagePreview ? <div className="relative inline-block"><img src={challengeImagePreview} alt="" className="max-w-xs h-32 object-cover rounded-lg border" /><Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={removeImage}><XCircle className="h-4 w-4" /></Button></div> : <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-20 w-full max-w-xs border-dashed"><div className="flex flex-col items-center gap-1"><Upload className="h-5 w-5" /><span className="text-xs">Upload</span></div></Button>}</CardContent></Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Actions Detail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RichTextEditor
                    value={actionsHtml}
                    onChange={setActionsHtml}
                    minHeight="250px"
                    placeholder="Describe the actions required to complete this challenge..."
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design">
              <div className="mb-4 flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={handleResetElements}>
                  <RotateCcw className="h-4 w-4 mr-2" />Reset Elements
                </Button>
              </div>
              <CardCanvas layoutColor={formData.layout_color} title={formData.name} description={formData.description} badgeName={selectedBadge?.name || 'Badge'} badgeImageUrl={selectedBadge?.badge_image_path} weekNumber={formData.period_number} actionItems={[]} tagline={formData.tagline} elements={cardElements} onElementsChange={setCardElements} width={600} height={900} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t"><Button type="button" variant="outline" onClick={() => navigate('/admin/challenge-cards')}><XCircle className="h-4 w-4 mr-2" />Cancel</Button><Button type="submit" disabled={submitting || !formData.name.trim()}>{submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</> : <><CheckCircle className="h-4 w-4 mr-2" />Save</>}</Button></div>
        </form>
      </div>
    </div>
  );
}