import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Move, Type, Image, FileText } from 'lucide-react';
import { CardConfig } from './CardPreview';

interface ElementPositionerProps {
    config: CardConfig;
    onChange: (config: CardConfig) => void;
    canvasWidth?: number;
    canvasHeight?: number;
}

export default function ElementPositioner({
    config,
    onChange,
    canvasWidth = 600,
    canvasHeight = 400
}: ElementPositionerProps) {

    const updateTitle = (updates: Partial<CardConfig['title']>) => {
        onChange({ ...config, title: { ...config.title, ...updates } });
    };

    const updateBadge = (updates: Partial<CardConfig['badge']>) => {
        onChange({ ...config, badge: { ...config.badge, ...updates } });
    };

    const updateDescription = (updates: Partial<CardConfig['description']>) => {
        onChange({ ...config, description: { ...config.description, ...updates } });
    };

    return (
        <div className="space-y-4">
            {/* Title Positioning */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Title Position
                        </span>
                        <Switch
                            checked={config.title.visible}
                            onCheckedChange={(visible) => updateTitle({ visible })}
                        />
                    </CardTitle>
                </CardHeader>
                {config.title.visible && (
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">X: {config.title.x}</Label>
                                <Slider
                                    value={[config.title.x]}
                                    min={0}
                                    max={canvasWidth - 100}
                                    step={5}
                                    onValueChange={([x]) => updateTitle({ x })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Y: {config.title.y}</Label>
                                <Slider
                                    value={[config.title.y]}
                                    min={0}
                                    max={canvasHeight - 50}
                                    step={5}
                                    onValueChange={([y]) => updateTitle({ y })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Size: {config.title.fontSize}px</Label>
                                <Slider
                                    value={[config.title.fontSize]}
                                    min={14}
                                    max={48}
                                    step={2}
                                    onValueChange={([fontSize]) => updateTitle({ fontSize })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Color</Label>
                                <Input
                                    type="color"
                                    value={config.title.color}
                                    onChange={(e) => updateTitle({ color: e.target.value })}
                                    className="h-8 w-full p-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Badge Positioning */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Badge Position
                        </span>
                        <Switch
                            checked={config.badge.visible}
                            onCheckedChange={(visible) => updateBadge({ visible })}
                        />
                    </CardTitle>
                </CardHeader>
                {config.badge.visible && (
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">X: {config.badge.x}</Label>
                                <Slider
                                    value={[config.badge.x]}
                                    min={0}
                                    max={canvasWidth - 80}
                                    step={5}
                                    onValueChange={([x]) => updateBadge({ x })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Y: {config.badge.y}</Label>
                                <Slider
                                    value={[config.badge.y]}
                                    min={0}
                                    max={canvasHeight - 80}
                                    step={5}
                                    onValueChange={([y]) => updateBadge({ y })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Size: {config.badge.size}px</Label>
                            <Slider
                                value={[config.badge.size]}
                                min={40}
                                max={120}
                                step={5}
                                onValueChange={([size]) => updateBadge({ size })}
                            />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Description Positioning */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Description Position
                        </span>
                        <Switch
                            checked={config.description.visible}
                            onCheckedChange={(visible) => updateDescription({ visible })}
                        />
                    </CardTitle>
                </CardHeader>
                {config.description.visible && (
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">X: {config.description.x}</Label>
                                <Slider
                                    value={[config.description.x]}
                                    min={0}
                                    max={canvasWidth - 200}
                                    step={5}
                                    onValueChange={([x]) => updateDescription({ x })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Y: {config.description.y}</Label>
                                <Slider
                                    value={[config.description.y]}
                                    min={0}
                                    max={canvasHeight - 50}
                                    step={5}
                                    onValueChange={([y]) => updateDescription({ y })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Size: {config.description.fontSize}px</Label>
                                <Slider
                                    value={[config.description.fontSize]}
                                    min={10}
                                    max={24}
                                    step={1}
                                    onValueChange={([fontSize]) => updateDescription({ fontSize })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Color</Label>
                                <Input
                                    type="color"
                                    value={config.description.color}
                                    onChange={(e) => updateDescription({ color: e.target.value })}
                                    className="h-8 w-full p-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
