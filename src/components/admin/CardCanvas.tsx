import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Type,
    Image as ImageIcon,
    Award,
    List,
    MessageSquare,
    Plus,
    Trash2,
    Eye,
    Settings2,
    Move,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import DraggableElement from './DraggableElement';
import ElementStyleToolbar, { ElementStyle, DEFAULT_ELEMENT_STYLE } from './ElementStyleToolbar';
import { getImageUrl } from '@/utils/imageUrl';

interface CardElement {
    id: string;
    type: 'title' | 'badge' | 'description' | 'action' | 'image' | 'tagline' | 'week' | 'layout-image' | 'text' | 'actions-detail';
    content: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    style: ElementStyle;
    visible: boolean;
    locked: boolean;
    behindLayout?: boolean;
}

interface CardCanvasProps {
    layoutImageUrl?: string | null;
    layoutColor: string;
    title: string;
    description: string;
    badgeName: string;
    badgeImageUrl?: string | null;
    weekNumber: number;
    actionItems: string[];
    tagline: string;
    elements: CardElement[];
    onElementsChange: (elements: CardElement[]) => void;
    width?: number;
    height?: number;
}

const DEFAULT_ELEMENTS: CardElement[] = [
    {
        id: 'week',
        type: 'week',
        content: '1',
        position: { x: 20, y: 20 },
        size: { width: 60, height: 60 },
        style: { ...DEFAULT_ELEMENT_STYLE, borderRadius: 50, backgroundColor: '#fbbf24' },
        visible: true,
        locked: false
    },
    {
        id: 'title',
        type: 'title',
        content: 'Challenge Title',
        position: { x: 90, y: 25 },
        size: { width: 350, height: 50 },
        style: { ...DEFAULT_ELEMENT_STYLE, fontWeight: 'bold' },
        visible: true,
        locked: false
    },
    {
        id: 'badge',
        type: 'badge',
        content: 'Win: Badge Name',
        position: { x: 450, y: 20 },
        size: { width: 120, height: 60 },
        style: { ...DEFAULT_ELEMENT_STYLE, borderRadius: 8, fontSize: 14 },
        visible: true,
        locked: false
    },
    {
        id: 'illustration',
        type: 'image',
        content: '',
        position: { x: 30, y: 100 },
        size: { width: 800, height: 500 },
        style: { ...DEFAULT_ELEMENT_STYLE, borderRadius: 8 },
        visible: true,
        locked: false
    },
    {
        id: 'description',
        type: 'description',
        content: 'What the challenge is:',
        position: { x: 30, y: 450 },
        size: { width: 540, height: 100 },
        style: DEFAULT_ELEMENT_STYLE,
        visible: true,
        locked: false
    },
    // Actions removed from default as they are now dynamically added
    {
        id: 'footer-badge',
        type: 'badge',
        content: '',
        position: { x: 450, y: 750 },
        size: { width: 120, height: 120 },
        style: { ...DEFAULT_ELEMENT_STYLE, borderRadius: 60 },
        visible: true,
        locked: false
    },
    {
        id: 'tagline',
        type: 'tagline',
        content: 'Small kindness always counts!',
        position: { x: 150, y: 850 },
        size: { width: 300, height: 30 },
        style: { ...DEFAULT_ELEMENT_STYLE, textAlign: 'center', fontStyle: 'italic' },
        visible: true,
        locked: false
    }
];

export { DEFAULT_ELEMENTS };

export default function CardCanvas({
    layoutImageUrl,
    layoutColor,
    title,
    description,
    badgeName,
    badgeImageUrl,
    weekNumber,
    actionItems,
    tagline,
    elements,
    onElementsChange,
    width = 600,
    height = 900
}: CardCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [editingElementId, setEditingElementId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [activeTab, setActiveTab] = useState('canvas');

    const selectedElement = elements.find(e => e.id === selectedElementId);

    const handleTransformChange = useCallback((id: string, updates: { x: number; y: number; width: number; height: number }) => {
        onElementsChange(elements.map(el =>
            el.id === id ? { ...el, position: { x: updates.x, y: updates.y }, size: { width: updates.width, height: updates.height } } : el
        ));
    }, [elements, onElementsChange]);

    const handlePositionChange = useCallback((id: string, position: { x: number; y: number }) => {
        onElementsChange(elements.map(el =>
            el.id === id ? { ...el, position } : el
        ));
    }, [elements, onElementsChange]);

    const handleSizeChange = useCallback((id: string, size: { width: number; height: number }) => {
        onElementsChange(elements.map(el =>
            el.id === id ? { ...el, size } : el
        ));
    }, [elements, onElementsChange]);

    const handleStyleChange = useCallback((style: ElementStyle) => {
        if (!selectedElementId) return;
        onElementsChange(elements.map(el =>
            el.id === selectedElementId ? { ...el, style } : el
        ));
    }, [selectedElementId, elements, onElementsChange]);

    const handleDeleteElement = useCallback(() => {
        if (!selectedElementId) return;
        onElementsChange(elements.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
    }, [selectedElementId, elements, onElementsChange]);

    const handleToggleLock = useCallback(() => {
        if (!selectedElementId) return;
        onElementsChange(elements.map(el =>
            el.id === selectedElementId ? { ...el, locked: !el.locked } : el
        ));
    }, [selectedElementId, elements, onElementsChange]);

    const handleLayerAction = useCallback((action: 'bringForward' | 'sendBackward') => {
        if (!selectedElementId) return;
        const index = elements.findIndex(el => el.id === selectedElementId);
        if (index === -1) return;

        const newElements = [...elements];
        if (action === 'bringForward') {
            if (index < newElements.length - 1) {
                [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
            }
        } else {
            if (index > 0) {
                [newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]];
            }
        }
        onElementsChange(newElements);
    }, [selectedElementId, elements, onElementsChange]);

    const handleDuplicateElement = useCallback(() => {
        if (!selectedElement) return;
        const newElement: CardElement = {
            ...selectedElement,
            id: `${selectedElement.type}-${Date.now()}`,
            position: { x: selectedElement.position.x + 20, y: selectedElement.position.y + 20 }
        };
        onElementsChange([...elements, newElement]);
        setSelectedElementId(newElement.id);
    }, [selectedElement, elements, onElementsChange]);

    const renderElementContent = (element: CardElement) => {
        const cssStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            borderRadius: `${element.style.borderRadius}px`,
            borderWidth: `${element.style.borderWidth}px`,
            borderColor: element.style.borderColor,
            borderStyle: element.style.borderStyle,
            backgroundColor: element.style.backgroundColor,
            opacity: element.style.opacity / 100,
            transform: `rotate(${element.style.rotation}deg)`,
            textAlign: element.style.textAlign,
            fontWeight: element.style.fontWeight,
            fontStyle: element.style.fontStyle,
            fontFamily: element.style.fontFamily || 'Inter',
            fontSize: `${element.style.fontSize || 16}px`,
            letterSpacing: `${element.style.letterSpacing || 0}px`,
            lineHeight: element.style.lineHeight || 1.5,
            WebkitTextStroke: element.style.textStrokeWidth ? `${element.style.textStrokeWidth}px ${element.style.textStrokeColor || 'transparent'}` : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: element.style.textAlign === 'center' ? 'center' :
                element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
            overflow: 'hidden',
            color: element.style.color || '#000000',
            textShadow: element.style.textShadowColor && element.style.textShadowColor !== 'transparent' ?
                `${element.style.textShadowOffsetX || 0}px ${element.style.textShadowOffsetY || 0}px ${element.style.textShadowBlur || 0}px ${element.style.textShadowColor}` : undefined,
            objectFit: element.style.objectFit || 'cover'
        };

        // Helper for Rich Text
        const renderTextContent = (text: string) => {
            const isEditing = element.id === editingElementId;
            // Only use SVG for curved text. For everything else (Gradient, Stroke, HTML), utilize CSS/HTML.
            const isCurved = element.style.isCurved;

            const w = element.size.width;
            const h = element.size.height;
            const fontSize = element.style.fontSize || 16;
            const fontFamily = element.style.fontFamily || 'Inter';
            const fontWeight = element.style.fontWeight || 'normal';
            const letterSpacing = element.style.letterSpacing || 0;
            const textAlign = element.style.textAlign || 'left';
            const lineHeight = element.style.lineHeight || 1.5;

            // --- CURVED TEXT (SVG - No HTML Tags) ---
            if (isCurved) {
                const radius = element.style.curveRadius || 100;
                const pathId = `curve-path-${element.id}`;
                const gradId = `grad-${element.id}`;
                const useGradient = element.style.useGradient;

                const gradientDef = useGradient ? (
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%" gradientTransform={`rotate(${element.style.gradientDirection || 0})`}>
                        <stop offset="0%" stopColor={element.style.gradientStart || '#FFD700'} />
                        <stop offset="100%" stopColor={element.style.gradientEnd || '#FFA500'} />
                    </linearGradient>
                ) : null;

                const fill = useGradient ? `url(#${gradId})` : (element.style.color || '#000000');
                const stroke = element.style.textStrokeColor || 'transparent';
                const strokeWidth = element.style.textStrokeWidth || 0;
                const pathD = `M 0,${h / 2 + radius / 4} Q ${w / 2},${-radius / 2} ${w},${h / 2 + radius / 4}`;

                return (
                    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
                        <defs>{gradientDef}</defs>
                        <path id={pathId} d={pathD} fill="transparent" />
                        <text width={w} style={{ paintOrder: 'stroke fill' }}>
                            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle" style={{
                                fill: fill,
                                stroke: stroke,
                                strokeWidth: strokeWidth,
                                fontSize: fontSize,
                                fontFamily: fontFamily,
                                fontWeight: fontWeight,
                                letterSpacing: letterSpacing,
                                dominantBaseline: 'middle'
                            }}>
                                {text.replace(/<[^>]*>/g, '') /* Strip HTML for SVG */}
                            </textPath>
                        </text>
                    </svg>
                );
            }

            // --- STRAIGHT / RICH TEXT (HTML) ---
            const useGradient = element.style.useGradient;

            // Container Style
            const containerStyle: React.CSSProperties = {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
                textAlign: textAlign as any,
                fontSize: fontSize,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
                letterSpacing: letterSpacing,
                lineHeight: lineHeight,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
            };

            // Text Inner Style
            const textStyle: React.CSSProperties = {
                color: element.style.color || '#000000',
            };

            if (useGradient) {
                textStyle.backgroundImage = `linear-gradient(${element.style.gradientDirection || 180}deg, ${element.style.gradientStart || '#FFD700'}, ${element.style.gradientEnd || '#FFA500'})`;
                textStyle.WebkitBackgroundClip = 'text';
                textStyle.backgroundClip = 'text';
                textStyle.color = 'transparent';
                textStyle.WebkitTextFillColor = 'transparent';
            }

            if ((element.style.textStrokeWidth || 0) > 0) {
                textStyle.WebkitTextStroke = `${element.style.textStrokeWidth}px ${element.style.textStrokeColor || 'transparent'}`;
            }

            if (isEditing) {
                // Content Editable Mode
                return (
                    <div style={containerStyle} className="cursor-text">
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            className="outline-none min-w-[20px] min-h-[20px]"
                            style={{
                                ...textStyle,
                                cursor: 'text',
                                color: useGradient ? 'black' : (element.style.color || '#000000'), // Use black caret color fallback if gradient attempts to hide it
                                WebkitTextFillColor: useGradient ? 'initial' : undefined, // Reset fill color so we can see text while editing? Or keep same?
                                // If we keep gradient fill, caret might be invisible.
                                // Let's simplify: while editing, remove gradient fill so user can see clearly?
                                // Or better: user wants to see WYSIWYG.
                                // If caret is missing, we can try `caret-color: black`.
                                caretColor: element.style.color === 'transparent' ? '#000000' : 'auto'
                            }}
                            dangerouslySetInnerHTML={{ __html: text || '' }}
                            onBlur={(e) => {
                                setEditingElementId(null);
                                const newContent = e.currentTarget.innerHTML;
                                onElementsChange(elements.map(el => el.id === element.id ? { ...el, content: newContent } : el));
                            }}
                            onKeyDown={(e) => {
                                e.stopPropagation(); // Stop propagation to prevent deleting element when pressing Backspace
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                    </div>
                );
            }

            return (
                <div style={containerStyle}>
                    <div
                        style={textStyle}
                        dangerouslySetInnerHTML={{ __html: text || '' }}
                    />
                </div>
            );
        };

        switch (element.type) {
            case 'week':
                return (
                    <div style={cssStyle} className="text-white font-bold justify-center bg-amber-500 rounded-full">
                        <div className="text-center">
                            <div className="text-[0.6em] uppercase tracking-wider">Week</div>
                            <div className="text-[1.5em] leading-none" style={{ color: cssStyle.color, textShadow: cssStyle.textShadow }}>{element.content || weekNumber}</div>
                        </div>
                    </div>
                );
            case 'title':
                // Force center wrapper for SVG text centering
                return (
                    <div style={{ ...cssStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="drop-shadow-md">
                        {renderTextContent(element.content || title || 'Challenge Title')}
                    </div>
                );
            case 'badge':
                return (
                    <div style={{ ...cssStyle, flexDirection: 'column' }} className="rounded-lg">
                        {element.content ? (
                            <img src={getImageUrl(element.content)} alt="Badge" className="w-[80%] h-[80%] object-contain" />
                        ) : badgeImageUrl ? (
                            <img src={getImageUrl(badgeImageUrl)} alt="Badge" className="w-[80%] h-[80%] object-contain" />
                        ) : (
                            <span className="text-[0.8em] text-center w-full truncate px-1">Win: {badgeName || 'Badge'}</span>
                        )}
                    </div>
                );
            case 'image':
                return (
                    <div style={cssStyle} className="bg-gradient-to-br from-blue-200 to-purple-200">
                        {element.content ? <img src={element.content} className="w-full h-full object-cover" /> : <div className="text-muted-foreground text-xs p-2 text-center">Image Placeholder</div>}
                    </div>
                );
            case 'description':
                return (
                    <div style={cssStyle} className="text-sm text-gray-800">
                        <div>
                            <strong>What the challenge is:</strong>
                            <div className="mt-1">{renderTextContent(element.content || description || 'Description text...')}</div>
                        </div>
                    </div>
                );
            case 'action':
                // For actions, we probably don't want giant gradients usually, but if user wants...
                return (
                    <div style={cssStyle} className="text-sm text-gray-700 flex-col items-start">
                        {/* Legacy View */}
                        {actionItems.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 mb-1">
                                <span>🌟</span>
                                <span>{item || `Action item ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'tagline':
                return (
                    <div style={{ ...cssStyle, display: 'flex', justifyContent: 'center' }} className="text-white drop-shadow-sm italic">
                        {renderTextContent(element.content || tagline || 'Tagline')}
                    </div>
                );
            case 'layout-image':
                return (
                    <img
                        src={element.content}
                        alt="Layout Background"
                        className="w-full h-full object-cover pointer-events-none"
                        style={{ ...cssStyle, pointerEvents: 'none' }}
                    />
                );
            case 'actions-detail':
                return (
                    <div style={cssStyle} className="text-gray-800">
                        {renderTextContent(element.content)}
                    </div>
                );
            case 'text':
                // Generic text
                return (
                    <div style={{ ...cssStyle, display: 'flex', justifyContent: element.style.textAlign === 'center' ? 'center' : 'flex-start' }}>
                        {renderTextContent(element.content || 'Text')}
                    </div>
                );
            default:
                return (
                    <div style={cssStyle} className="text-gray-800">
                        {element.content}
                    </div>
                );
        }
    };

    const handleToggleBehindLayout = useCallback((behind: boolean) => {
        // Deprecated: No longer needed as we use full layer ordering
    }, []);

    const handleSelectLayer = useCallback((id: string) => {
        setSelectedElementId(id);
    }, []);

    const layers = elements.map(el => ({
        id: el.id,
        type: el.type,
        name: el.type === 'layout-image' ? 'Layout Background' : el.type
    })).reverse(); // Reverse for display (Top layer first)

    return (
        <div className="space-y-4">
            {/* Zoom Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
                    <Button type="button" variant="outline" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
                <Badge variant="outline">
                    <Move className="h-3 w-3 mr-1" />
                    Drag elements to position
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Canvas Area (Span 2) */}
                <div className="lg:col-span-2 flex justify-center bg-gray-100 rounded-xl overflow-auto min-h-[600px] items-start">
                    <div
                        ref={canvasRef}
                        className="relative bg-white shadow-2xl transition-all duration-200 ease-in-out"
                        style={{
                            width: `${width * zoom}px`,
                            height: `${height * zoom}px`,
                            backgroundColor: layoutColor,
                            transformOrigin: 'top left'
                        }}
                        onMouseDown={() => setSelectedElementId(null)}
                    >
                        {/* Content Wrapper */}
                        <div className="absolute inset-0 overflow-hidden">
                            {elements.map(element => (
                                <DraggableElement
                                    key={element.id}
                                    id={element.id}
                                    initialPosition={element.position}
                                    initialSize={element.size}
                                    onPositionChange={handlePositionChange}
                                    onSizeChange={handleSizeChange}
                                    onTransform={handleTransformChange}
                                    onSelect={setSelectedElementId}
                                    isSelected={selectedElementId === element.id}
                                    locked={element.locked || element.type === 'layout-image'} // detailed lock override if needed
                                    resizable={!element.locked && element.type !== 'layout-image'}
                                    elementType={element.type}
                                >
                                    {renderElementContent(element)}
                                </DraggableElement>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Layers Panel (Span 1 - New Dedicated Section) */}
                <div className="lg:col-span-1">
                    <Card className="h-full max-h-[800px] flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <List className="h-4 w-4" />
                                Layers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            <div className="space-y-1">
                                {layers.map(layer => (
                                    <div
                                        key={layer.id}
                                        onClick={(e) => { e.stopPropagation(); handleSelectLayer(layer.id); }}
                                        className={`p-2 rounded text-xs cursor-pointer flex items-center border transition-colors group ${selectedElementId === layer.id
                                            ? 'bg-primary/10 border-primary text-primary font-medium'
                                            : 'border-transparent hover:bg-muted hover:border-border'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full mr-2 ${layer.name?.includes('Behind') ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                        <span className="flex-1 capitalize truncate">{layer.type}</span>
                                        {layer.name?.includes('Behind') && <span className="text-[10px] text-muted-foreground ml-2 shrink-0">(Back)</span>}
                                        {selectedElementId === layer.id && <div className="ml-2 w-2 h-2 bg-primary rounded-full"></div>}
                                    </div>
                                ))}
                                {layers.length === 0 && <div className="text-xs italic p-2 text-muted-foreground">No elements</div>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Style Panel (Span 1 - Dedicated Style) */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Settings2 className="h-4 w-4" />
                                {selectedElement ? `Edit: ${selectedElement.type}` : 'Properties'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedElement ? (
                                <ElementStyleToolbar
                                    style={selectedElement.style}
                                    onChange={handleStyleChange}
                                    elementType={selectedElement.type}
                                    onDelete={handleDeleteElement}
                                    onDuplicate={handleDuplicateElement}
                                    onLock={handleToggleLock}
                                    onLayerAction={handleLayerAction}
                                    isLocked={selectedElement.locked}
                                    // Layer Props (Only for toolbar use if needed, separate panel handles list)
                                    layers={layers}
                                    selectedLayerId={selectedElementId}
                                    onSelectLayer={handleSelectLayer}
                                    size={selectedElement.size}
                                    onSizeChange={(newSize) => handleSizeChange(selectedElement.id, newSize)}
                                    content={selectedElement.content}
                                    onContentChange={(newContent) => {
                                        const el = elements.find(e => e.id === selectedElement.id);
                                        if (el) onElementsChange(elements.map(e => e.id === selectedElement.id ? { ...e, content: newContent } : e));
                                    }}
                                />
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-12 flex flex-col items-center gap-4">
                                    <div className="p-4 bg-muted rounded-full">
                                        <Move className="h-6 w-6 opacity-50" />
                                    </div>
                                    <p>Select an element from the canvas or the layers list to edit its style.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export type { CardElement };

