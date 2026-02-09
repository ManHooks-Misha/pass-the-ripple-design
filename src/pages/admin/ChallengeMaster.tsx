import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Layout, Trophy } from "lucide-react";
import ChallengeType from "./ChallengeType";
import ChallengeCardLayouts from "./ChallengeCardLayouts";

export default function ChallengeMaster() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Challenge Master</h1>
                    <p className="text-muted-foreground">Manage challenge configurations and layouts</p>
                </div>
            </div>

            <Tabs defaultValue="types" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="types" className="gap-2">
                        <Layers className="h-4 w-4" />
                        Challenge Types
                    </TabsTrigger>
                    <TabsTrigger value="layouts" className="gap-2">
                        <Layout className="h-4 w-4" />
                        Card Layouts
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="types" className="space-y-4 outline-none">
                    <div className="border rounded-lg p-6 bg-background shadow-sm">
                        <ChallengeType />
                    </div>
                </TabsContent>
                <TabsContent value="layouts" className="space-y-4 outline-none">
                    <div className="border rounded-lg p-6 bg-background shadow-sm">
                        <ChallengeCardLayouts />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
