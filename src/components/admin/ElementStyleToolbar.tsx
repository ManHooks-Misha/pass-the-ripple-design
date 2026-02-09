import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    Square,
    Circle,
    Lock,
    Unlock,
    Trash2,
    Copy,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    MoveUp,
    MoveDown,
    Type,
    Layers,
    Palette,
    ArrowUp,
    ArrowDown,
    Image as ImageIcon,
    FileText,
    RotateCcw
} from 'lucide-react';

interface ElementStyle {
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
    backgroundColor: string;
    opacity: number;
    rotation: number;
    shadow: boolean;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    fontFamily?: string;
    fontSize?: number;
    letterSpacing?: number;
    lineHeight?: number;
    textStrokeWidth?: number;
    textStrokeColor?: string;
    color?: string;
    textShadowColor?: string;
    textShadowBlur?: number;
    textShadowOffsetX?: number;
    textShadowOffsetY?: number;
    isCurved?: boolean;
    curveRadius?: number;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
    useGradient?: boolean;
    gradientStart?: string;
    gradientEnd?: string;
    gradientDirection?: number;
}

export const DEFAULT_ELEMENT_STYLE: ElementStyle = {
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#000000',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    opacity: 100,
    rotation: 0,
    shadow: false,
    textAlign: 'left',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'Inter',
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 1.5,
    textStrokeWidth: 0,
    textStrokeColor: 'transparent',
    color: '#000000',
    textShadowColor: 'transparent',
    textShadowBlur: 0,
    textShadowOffsetX: 0,
    textShadowOffsetY: 0,
    isCurved: false,
    curveRadius: 50,
    objectFit: 'cover',
    useGradient: false,
    gradientStart: '#FFD700',
    gradientEnd: '#FFA500',
    gradientDirection: 180
};

const FONT_FAMILIES = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Lilita One', label: 'Lilita One (Game)' },
    { value: 'Fuzzy Bubbles', label: 'Fuzzy Bubbles (Fun)' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Playfair Display', label: 'Playfair (Serif)' },
    { value: 'Comic Neue', label: 'Comic (Hand)' },
    { value: 'Courier New', label: 'Courier (Mono)' },
];

interface ElementStyleToolbarProps {
    style: ElementStyle;
    onChange: (style: ElementStyle) => void;
    elementType?: string;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onLock?: () => void;
    onLayerAction?: (action: 'bringForward' | 'sendBackward') => void;
    isLocked?: boolean;
    // Layer/Position Management
    layers?: { id: string; type: string; name?: string }[];
    selectedLayerId?: string | null;
    onSelectLayer?: (id: string) => void;
    // Dimension Control
    size?: { width: number; height: number };
    onSizeChange?: (size: { width: number; height: number }) => void;
    // Content Control
    content?: string;
    onContentChange?: (content: string) => void;
}

export default function ElementStyleToolbar({
    style,
    onChange,
    elementType = 'text',
    onDelete,
    onDuplicate,
    onLock,
    onLayerAction,
    isLocked = false,
    layers = [],
    selectedLayerId,
    onSelectLayer,
    size,
    onSizeChange,
    content,
    onContentChange
}: ElementStyleToolbarProps) {

    const updateStyle = (updates: Partial<ElementStyle>) => {
        onChange({ ...style, ...updates });
    };

    const execCmd = (cmd: string) => {
        document.execCommand(cmd, false);
    };

    const isTextElement = ['text', 'title', 'tagline', 'description', 'action', 'week', 'actions-detail'].includes(elementType);
    const isImageElement = ['image', 'layout-image', 'badge'].includes(elementType);
    const onToggleBehindLayout = undefined; // Deprecated, hiding UI

    return (
        <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-1 p-2 bg-muted/50 rounded-lg justify-between">
                <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onLock} title={isLocked ? 'Unlock' : 'Lock'}>
                        {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate} title="Duplicate">
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete} title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                {onLayerAction && (
                    <div className="flex gap-1 border-l pl-1">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onLayerAction('bringForward')} title="Bring Forward">
                            <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onLayerAction('sendBackward')} title="Send Backward">
                            <MoveDown className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <Tabs defaultValue="style" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-2">
                    <TabsTrigger value="style"><Palette className="h-3 w-3 mr-1" />Style</TabsTrigger>
                    {isTextElement && <TabsTrigger value="text"><Type className="h-3 w-3 mr-1" />Text</TabsTrigger>}
                    {isImageElement && <TabsTrigger value="image"><ImageIcon className="h-3 w-3 mr-1" />Image</TabsTrigger>}
                    <TabsTrigger value="layout"><Layers className="h-3 w-3 mr-1" />Layout</TabsTrigger>
                </TabsList>

                {/* STYLE TAB */}
                <TabsContent value="style" className="space-y-4">
                    {/* Background & Opacity */}
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-xs">Background</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Color</Label>
                                <div className="flex gap-2">
                                    <Input type="color" value={style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} className="h-6 w-8 p-0" />
                                    <Select value={style.backgroundColor === 'transparent' ? 'transparent' : 'color'} onValueChange={(v) => updateStyle({ backgroundColor: v === 'transparent' ? 'transparent' : '#ffffff' })}>
                                        <SelectTrigger className="h-6 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="color">Color</SelectItem><SelectItem value="transparent">None</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Opacity: {style.opacity}%</Label>
                                <Slider value={[style.opacity]} min={0} max={100} step={5} onValueChange={([v]) => updateStyle({ opacity: v })} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Border */}
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-xs">Border</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Width</Label>
                                    <Slider value={[style.borderWidth]} min={0} max={10} step={1} onValueChange={([v]) => updateStyle({ borderWidth: v })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Color</Label>
                                    <Input type="color" value={style.borderColor} onChange={(e) => updateStyle({ borderColor: e.target.value })} className="h-6 w-full p-0" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Radius: {style.borderRadius}px</Label>
                                <Slider value={[style.borderRadius]} min={0} max={50} step={1} onValueChange={([v]) => updateStyle({ borderRadius: v })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Style</Label>
                                <Select value={style.borderStyle} onValueChange={(v: any) => updateStyle({ borderStyle: v })}>
                                    <SelectTrigger className="h-6 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="solid">Solid</SelectItem><SelectItem value="dashed">Dashed</SelectItem><SelectItem value="dotted">Dotted</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TEXT TAB */}
                {isTextElement && (
                    <TabsContent value="text" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-xs">Typography</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Text Color</Label>
                                    <div className="flex gap-2">
                                        <Input type="color" value={style.color || '#000000'} onChange={(e) => updateStyle({ color: e.target.value })} className="h-7 w-full p-0" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Font Family</Label>
                                    <Select value={style.fontFamily || 'Inter'} onValueChange={(v) => updateStyle({ fontFamily: v })}>
                                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {FONT_FAMILIES.map(f => (<SelectItem key={f.value} value={f.value}><span style={{ fontFamily: f.value }}>{f.label}</span></SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <div className="space-y-1 flex-1">
                                        <Label className="text-xs">Size</Label>
                                        <Input type="number" value={style.fontSize || 16} onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) || 16 })} className="h-7 text-xs" />
                                    </div>
                                    <div className="flex gap-1 items-end">
                                        <Button type="button" variant={style.fontWeight === 'bold' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => updateStyle({ fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' })}><Bold className="h-3 w-3" /></Button>
                                        <Button type="button" variant={style.fontStyle === 'italic' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => updateStyle({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}><Italic className="h-3 w-3" /></Button>
                                        <Button type="button" variant={style.textAlign === 'left' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => updateStyle({ textAlign: 'left' })}><AlignLeft className="h-3 w-3" /></Button>
                                        <Button type="button" variant={style.textAlign === 'center' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => updateStyle({ textAlign: 'center' })}><AlignCenter className="h-3 w-3" /></Button>
                                        <Button type="button" variant={style.textAlign === 'right' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => updateStyle({ textAlign: 'right' })}><AlignRight className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-xs">Spacing & Effects</CardTitle></CardHeader>
                            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Letter Spacing: {style.letterSpacing}px</Label>
                                    <Slider value={[style.letterSpacing || 0]} min={-5} max={20} step={1} onValueChange={([v]) => updateStyle({ letterSpacing: v })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Line Height: {style.lineHeight}</Label>
                                    <Slider value={[style.lineHeight || 1.5]} min={0.5} max={3} step={0.1} onValueChange={([v]) => updateStyle({ lineHeight: v })} />
                                </div>
                                <div className="pt-2 border-t space-y-2">
                                    <Label className="text-xs">Text Outline (Weight & Color)</Label>
                                    <div className="flex gap-2 items-center">
                                        <Slider className="flex-1" value={[style.textStrokeWidth || 0]} min={0} max={5} step={0.5} onValueChange={([v]) => updateStyle({ textStrokeWidth: v })} />
                                        <Input type="color" value={style.textStrokeColor || '#000000'} onChange={(e) => updateStyle({ textStrokeColor: e.target.value })} className="h-6 w-6 p-0" />
                                    </div>
                                </div>

                                {/* Text Shadow */}
                                <div className="pt-2 border-t space-y-2">
                                    <Label className="text-xs">Text Shadow</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Color</Label>
                                            <Input type="color" value={style.textShadowColor || 'transparent'} onChange={(e) => updateStyle({ textShadowColor: e.target.value })} className="h-6 w-full p-0" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Blur: {style.textShadowBlur || 0}px</Label>
                                            <Slider value={[style.textShadowBlur || 0]} min={0} max={20} step={1} onValueChange={([v]) => updateStyle({ textShadowBlur: v })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">X: {style.textShadowOffsetX || 0}px</Label>
                                            <Slider value={[style.textShadowOffsetX || 0]} min={-20} max={20} step={1} onValueChange={([v]) => updateStyle({ textShadowOffsetX: v })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Y: {style.textShadowOffsetY || 0}px</Label>
                                            <Slider value={[style.textShadowOffsetY || 0]} min={-20} max={20} step={1} onValueChange={([v]) => updateStyle({ textShadowOffsetY: v })} />
                                        </div>
                                    </div>
                                </div>

                                {/* Curve Text Toggle */}
                                <div className="pt-2 border-t space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Curved Text?</Label>
                                        <Switch checked={style.isCurved || false} onCheckedChange={(c) => updateStyle({ isCurved: c })} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}



                {/* IMAGE TAB */}
                {isImageElement && (
                    <TabsContent value="image" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-xs">Image Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Object Fit (Resize Behavior)</Label>
                                    <Select value={style.objectFit || 'cover'} onValueChange={(v: any) => updateStyle({ objectFit: v })}>
                                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cover">Cover (Crop to fit)</SelectItem>
                                            <SelectItem value="contain">Contain (Show all)</SelectItem>
                                            <SelectItem value="fill">Fill (Stretch)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* LAYOUT TAB - LAYERS LIST & POSITION */}
                <TabsContent value="layout" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-xs">Layer Position</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {onToggleBehindLayout && (
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Behind Layout Image?</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onLayerAction && onLayerAction('bringForward')}>
                                            <ArrowUp className="h-3 w-3 mr-2" /> Forward
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => onLayerAction && onLayerAction('sendBackward')}>
                                            <ArrowDown className="h-3 w-3 mr-2" /> Backward
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1 pt-2 border-t">
                                <Label className="text-xs">Rotation: {style.rotation}°</Label>
                                <Slider value={[style.rotation]} min={0} max={360} step={5} onValueChange={([v]) => updateStyle({ rotation: v })} />
                            </div>
                        </CardContent>
                    </Card>

                    {onSelectLayer && (
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-xs">All Layers</CardTitle></CardHeader>
                            <CardContent className="p-2 max-h-[200px] overflow-y-auto">
                                <div className="space-y-1">
                                    <div className="text-[10px] text-muted-foreground mb-1 pl-1 uppercase font-bold">Z-Order</div>
                                    <div className="overflow-y-auto max-h-[300px] space-y-1">
                                        {layers.map((layer) => (
                                            <div
                                                key={layer.id}
                                                onClick={() => onSelectLayer && onSelectLayer(layer.id)}
                                                className={`p-1.5 rounded text-xs flex items-center cursor-pointer hover:bg-muted ${selectedLayerId === layer.id ? 'bg-primary/10 font-bold text-primary border border-primary/20' : ''}`}
                                            >
                                                {layer.type === 'layout-image' ?
                                                    <ImageIcon className="h-3 w-3 mr-2 opacity-50" /> :
                                                    (isTextElement ? <Type className="h-3 w-3 mr-2 opacity-50" /> : <Square className="h-3 w-3 mr-2 opacity-50" />)
                                                }
                                                {layer.name || layer.type}
                                            </div>
                                        ))}
                                        {layers.length === 0 && <div className="p-1.5 text-xs text-muted-foreground italic">No layers</div>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export type { ElementStyle };

