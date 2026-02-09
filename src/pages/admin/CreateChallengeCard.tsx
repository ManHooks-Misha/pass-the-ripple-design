import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Sparkles,
  PenTool,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload,
  Award,
  Layers,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData } from '@/config/api';
import { getImageUrl } from '@/utils/imageUrl';
import CardCanvas, { CardElement, DEFAULT_ELEMENTS } from '@/components/admin/CardCanvas';
import { DEFAULT_ELEMENT_STYLE } from '@/components/admin/ElementStyleToolbar';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

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
  description?: string;
}

interface BadgeData {
  id: number;
  name: string;
  description: string | null;
  badge_image_path: string | null;
  tier_id: number;
  is_active: boolean;
}

interface ActionItem {
  text: string;
  subActions: string[];
}

interface RippleCategoryData {
  id: number;
  name: string;
  icon: string | null;
  icon_url: string | null;
}

const CHALLENGE_TYPES = [
  { value: 'daily', label: 'Daily Challenge', icon: '☀️', unit: 'Day' },
  { value: 'weekly', label: 'Weekly Challenge', icon: '📅', unit: 'Week' },
  { value: 'monthly', label: 'Monthly Challenge', icon: '🌙', unit: 'Month' },
  { value: 'yearly', label: 'Yearly Challenge', icon: '🎯', unit: 'Year' },
  { value: 'custom', label: 'Custom Challenge', icon: '⚙️', unit: 'Custom' }
];

export default function CreateChallengeCard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { text: '', subActions: [] },
    { text: '', subActions: [] },
    { text: '', subActions: [] }
  ]);

  const [cardElements, setCardElements] = useState<CardElement[]>(DEFAULT_ELEMENTS);
  // Removed duplicate cardElements declaration
  // Removed expandedActions as it is no longer used for rich text editor mode
  const [actionsHtml, setActionsHtml] = useState<string>('<ul><li>Complete a small act of kindness</li><li>Share your experience</li></ul>');

  // Get dynamic time unit based on challenge type
  const timeUnit = useMemo(() => {
    const type = CHALLENGE_TYPES.find(t => t.value === formData.challenge_type);
    return type?.unit || 'Week';
  }, [formData.challenge_type]);

  // Filter badges by selected tier
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
            return el;
          case 'footer-badge':
            const badgeImg = selectedBadge?.badge_image_path;
            if (badgeImg && el.content !== badgeImg) {
              return { ...el, content: badgeImg };
            }
            return el;
          default:
            return el;
        }
      });
      return newElements;
    });
  }, [formData.name, formData.description, formData.tagline, formData.period_number, challengeImagePreview, selectedBadge]);

  // Sync actions HTML to card elements
  useEffect(() => {
    setCardElements(prev => {
      let newElements = [...prev];

      // Remove legacy action elements and existing actions-detail
      newElements = newElements.filter(e => !e.id.startsWith('action-') && e.id !== 'actions' && e.id !== 'actions-detail');

      if (actionsHtml.trim()) {
        newElements.push({
          id: 'actions-detail',
          type: 'actions-detail', // New type for HTML content
          content: actionsHtml,
          position: { x: 30, y: 550 },
          size: { width: 540, height: 200 },
          style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 16, textAlign: 'left', lineHeight: 1.6 },
          visible: true,
          locked: false
        });
      }

      return newElements;
    });
  }, [actionsHtml]);

  // Sync layout image to card elements as a layer (Existing)
  useEffect(() => {
    if (selectedLayout?.image_url) {
      setCardElements(prev => {
        const existingIndex = prev.findIndex(e => e.type === 'layout-image');
        const newElement: CardElement = {
          id: 'layout-bg',
          type: 'layout-image',
          content: selectedLayout.image_url!,
          position: { x: 0, y: 0 },
          size: { width: 600, height: 900 },
          style: { ...DEFAULT_ELEMENT_STYLE, opacity: 100 },
          visible: true,
          locked: true, // Default to locked so it acts as background
          behindLayout: false // Deprecated
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

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
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
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to fetch form options', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Update selected badge when badge_id changes
  useEffect(() => {
    if (formData.badge_id && formData.badge_id !== 'none') {
      const badge = badges.find(b => b.id === parseInt(formData.badge_id));
      setSelectedBadge(badge || null);
    } else {
      setSelectedBadge(null);
    }
  }, [formData.badge_id, badges]);

  // Reset badge when tier changes
  useEffect(() => {
    if (formData.tier_id !== 'none' && formData.badge_id !== 'none') {
      const badge = badges.find(b => b.id === parseInt(formData.badge_id));
      if (badge && badge.tier_id !== parseInt(formData.tier_id)) {
        setFormData(prev => ({ ...prev, badge_id: 'none' }));
      }
    }
  }, [formData.tier_id]);

  // Handle challenge image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChallengeImage(file);
      const reader = new FileReader();
      reader.onload = () => setChallengeImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setChallengeImage(null);
    setChallengeImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Action items handlers
  const handleActionChange = (index: number, value: string) => {
    const newItems = [...actionItems];
    newItems[index].text = value;
    setActionItems(newItems);
  };

  const handleSubActionChange = (actionIndex: number, subIndex: number, value: string) => {
    const newItems = [...actionItems];
    newItems[actionIndex].subActions[subIndex] = value;
    setActionItems(newItems);
  };

  const addAction = () => {
    if (actionItems.length < 10) {
      setActionItems([...actionItems, { text: '', subActions: [] }]);
    }
  };

  const removeAction = (index: number) => {
    if (actionItems.length > 1) {
      setActionItems(actionItems.filter((_, i) => i !== index));
    }
  };

  const addSubAction = (actionIndex: number) => {
    if (actionItems[actionIndex].subActions.length < 5) {
      const newItems = [...actionItems];
      newItems[actionIndex].subActions.push('');
      setActionItems(newItems);
    }
  };

  const removeSubAction = (actionIndex: number, subIndex: number) => {
    const newItems = [...actionItems];
    newItems[actionIndex].subActions = newItems[actionIndex].subActions.filter((_, i) => i !== subIndex);
    setActionItems(newItems);
  };

  const toggleActionExpanded = (index: number) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(index)) newExpanded.delete(index);
    else newExpanded.add(index);
    setExpandedActions(newExpanded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Card name is required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name.trim());
      formDataObj.append('description', formData.description.trim() || '');
      formDataObj.append('layout_id', formData.layout_id !== 'none' ? formData.layout_id : '');
      formDataObj.append('layout_color', formData.layout_color);
      formDataObj.append('challenge_type', formData.challenge_type);
      formDataObj.append('tier_id', formData.tier_id !== 'none' ? formData.tier_id : '');
      formDataObj.append('badge_id', formData.badge_id !== 'none' ? formData.badge_id : '');
      formDataObj.append('badge_count', formData.badge_count.toString());
      formDataObj.append('start_date', formData.start_date);
      formDataObj.append('end_date', formData.end_date);
      formDataObj.append('ripple_category_id', formData.ripple_category_id !== 'none' ? formData.ripple_category_id : '');
      formDataObj.append('is_active', formData.is_active ? '1' : '0');

      formDataObj.append('card_config', JSON.stringify({
        elements: cardElements,
        period_number: formData.period_number,
        action_html: actionsHtml, // New field
        // Legacy support (optional, or just send empty)
        action_items: [],
        tagline: formData.tagline
      }));

      if (challengeImage) {
        formDataObj.append('challenge_image', challengeImage);
      }

      await apiFetchFormData('/admin/challenge-cards', {
        method: 'POST',
        body: formDataObj
      });

      toast({ title: 'Success', description: 'Challenge card created successfully!' });
      navigate('/admin/challenge-cards');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create challenge card', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
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
          // Use selectedBadge image if available
          return { ...el, content: selectedBadge?.badge_image_path || '' };
        default:
          return el;
      }
    });

    // Manually add week element if not in default
    // Check if it already exists (unlikely in current default)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/challenge-cards')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Challenge Card</h1>
              <p className="text-muted-foreground text-sm">Design a rich challenge card with visual editor</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="h-4 w-4 mr-2" />Visual Builder
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Target className="h-4 w-4" /> Content & Layout
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" /> Design Editor
              </TabsTrigger>
            </TabsList>

            {/* Content & Layout Tab (Merged) */}
            <TabsContent value="content" className="space-y-6">
              {/* Row 1: Basic Info + Tier & Badge */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Card Title *</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="The Helping Hands Challenge" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Challenge Type</Label>
                        <Select value={formData.challenge_type} onValueChange={(v) => setFormData({ ...formData, challenge_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CHALLENGE_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{timeUnit} Number</Label>
                        <Input type="number" min="1" value={formData.period_number} onChange={(e) => setFormData({ ...formData, period_number: parseInt(e.target.value) || 1 })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="This week, focus on being helpful..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} placeholder="Small kindness always counts!" />
                    </div>
                  </CardContent>
                </Card>

                {/* Tier & Badge Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" />Tier & Badge</CardTitle>
                    <CardDescription>Select tier to filter badges, then choose a badge</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tier Level</Label>
                        <Select value={formData.tier_id} onValueChange={(v) => setFormData({ ...formData, tier_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">All Tiers</SelectItem>
                            {tiers.map(t => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                                  {t.name} (Level {t.level})
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Badge Count</Label>
                        <Input type="number" min="1" max="10" value={formData.badge_count} onChange={(e) => setFormData({ ...formData, badge_count: parseInt(e.target.value) || 1 })} />
                        <p className="text-xs text-muted-foreground">Badges earned on completion</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Linked Badge</Label>
                      <Select value={formData.badge_id} onValueChange={(v) => setFormData({ ...formData, badge_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Choose badge" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No badge</SelectItem>
                          {filteredBadges.map(b => (
                            <SelectItem key={b.id} value={b.id.toString()}>
                              <div className="flex items-center gap-2">
                                {b.badge_image_path && <img src={getImageUrl(b.badge_image_path)} alt="" className="w-5 h-5 rounded-full" />}
                                {b.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedBadge && (
                      <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-4">
                        {selectedBadge.badge_image_path ? (
                          <img src={getImageUrl(selectedBadge.badge_image_path)} alt={selectedBadge.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center"><Trophy className="h-6 w-6" /></div>
                        )}
                        <div>
                          <h4 className="font-semibold">{selectedBadge.name}</h4>
                          {selectedBadge.description && <p className="text-sm text-muted-foreground line-clamp-2">{selectedBadge.description}</p>}
                        </div>
                      </div>
                    )}

                    {/* Ripple Category */}
                    <div className="space-y-2 pt-4 border-t">
                      <Label>Ripple Category</Label>
                      <Select value={formData.ripple_category_id} onValueChange={(v) => setFormData({ ...formData, ripple_category_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {rippleCategories.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              <div className="flex items-center gap-2">
                                {c.icon_url && <img src={c.icon_url} alt="" className="w-5 h-5 rounded" />}
                                {c.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Schedule + Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date & Time</Label>
                        <Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date & Time</Label>
                        <Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <Label>Active</Label>
                        <p className="text-xs text-muted-foreground">Visible to users</p>
                      </div>
                      <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                    </div>
                  </CardContent>
                </Card>

                {/* Layout Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Layout</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {categories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={formData.layout_color} onChange={(e) => setFormData({ ...formData, layout_color: e.target.value })} className="h-9 w-12 p-1" />
                          <Input value={formData.layout_color} onChange={(e) => setFormData({ ...formData, layout_color: e.target.value })} className="flex-1" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto">
                      {filteredLayouts.map(layout => (
                        <div key={layout.id} onClick={() => setFormData({ ...formData, layout_id: layout.id.toString() })}
                          className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${formData.layout_id === layout.id.toString() ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-muted-foreground/50'}`}>
                          <div className="bg-muted relative" style={{ backgroundColor: formData.layout_color }}>
                            {layout.image_url ? <img src={layout.image_url} alt={layout.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center w-full h-full"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>}
                            {formData.layout_id === layout.id.toString() && <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5"><CheckCircle className="h-3 w-3" /></div>}
                          </div>
                          <div className="p-1 text-xs text-center truncate">{layout.name}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Challenge Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Challenge Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {challengeImagePreview ? (
                    <div className="relative inline-block">
                      <img src={challengeImagePreview} alt="Preview" className="max-w-sm h-40 object-cover rounded-lg border" />
                      <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={removeImage}><XCircle className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-24 w-full max-w-sm border-dashed">
                      <div className="flex flex-col items-center gap-1"><Upload className="h-6 w-6 text-muted-foreground" /><span className="text-sm text-muted-foreground">Upload image</span></div>
                    </Button>
                  )}
                </CardContent>
              </Card>

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

            {/* Design Editor Tab */}
            <TabsContent value="design">
              <div className="mb-4 flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={handleResetElements}>
                  <RotateCcw className="h-4 w-4 mr-2" />Reset Elements
                </Button>
              </div>
              <CardCanvas
                layoutColor={formData.layout_color}
                title={formData.name || 'Challenge Title'}
                description={formData.description}
                badgeName={selectedBadge?.name || 'Badge'}
                badgeImageUrl={selectedBadge?.badge_image_path}
                weekNumber={formData.period_number}
                actionItems={[]}
                tagline={formData.tagline}
                elements={cardElements}
                onElementsChange={setCardElements}
                width={600}
                height={900}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/challenge-cards')}><XCircle className="h-4 w-4 mr-2" />Cancel</Button>
            <Button type="submit" disabled={submitting || !formData.name.trim()}>
              {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Creating...</> : <><CheckCircle className="h-4 w-4 mr-2" />Create Challenge Card</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}