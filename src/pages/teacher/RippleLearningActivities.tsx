import React, { useState } from 'react';
import { 
  BookOpen, 
  Heart, 
  Star, 
  Users, 
  PenTool, 
  Brain,
  ChevronDown,
  ChevronUp,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  Share2,
  Map as MapIcon,
  Plus,
  FileText,
  Image
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface Module {
  id: number;
  title: string;
  icon: any;
  objective: string;
  activity: string;
  tieIn: string;
  followUp: string;
  color: string;
  assignments: Assignment[];
}

interface Assignment {
  id: string;
  studentIds: string[];
  dueDate: string;
  status: 'active' | 'completed';
  submissions: number;
  totalStudents: number;
}

const modules: Module[] = [
  {
    id: 1,
    title: "Social-Emotional Learning (SEL) Lesson",
    icon: Heart,
    objective: "Teach empathy, perspective-taking, and small actions that create big change.",
    activity: "Students brainstorm kind acts, pick one to complete, and share in group circle discussion.",
    tieIn: "Spread 5 (ripples expand), Spread 12 (rebuilding together through collective action).",
    followUp: "Map ripples on a classroom poster showing how kindness spreads through the community.",
    color: "text-pink-500",
    assignments: []
  },
  {
    id: 2,
    title: "Character Education / Virtue Practice",
    icon: Star,
    objective: "Build habits of compassion, gratitude, and service through daily practice.",
    activity: "Weekly 'Ripple Roles' - students rotate as gratitude writer, helper, or encourager.",
    tieIn: "Link with character strengths (Wren = optimism, Zin = persistence, Sage = empathy).",
    followUp: "Kids reflect on which character they resembled and write journal entries.",
    color: "text-yellow-500",
    assignments: []
  },
  {
    id: 3,
    title: "Faith-Based Application",
    icon: BookOpen,
    objective: "Show kindness and service as spiritual practices that honor our values.",
    activity: "Connect ripples with scripture (e.g., Matthew 5:16 - 'Let your light shine').",
    tieIn: "Easter themes of renewal & transformation (Spreads 9-12).",
    followUp: "Kids share testimonies of how they saw God at work through acts of kindness.",
    color: "text-purple-500",
    assignments: []
  },
  {
    id: 4,
    title: "Service Learning / Community Outreach",
    icon: Users,
    objective: "Connect student actions to real-world change in the community.",
    activity: "Partner with local food bank, nursing home, or shelter for service project.",
    tieIn: "Spread 12 (working together to rebuild and restore hope).",
    followUp: "Post ripple maps and project photos to bulletin board or school website.",
    color: "text-green-500",
    assignments: []
  },
  {
    id: 5,
    title: "Writing & Storytelling Project",
    icon: PenTool,
    objective: "Encourage creative expression around kindness themes.",
    activity: "Students write a short story, comic, or poem about kindness in action.",
    tieIn: "Spread 7 (Luma's stories taking flight and inspiring others).",
    followUp: "Display work on a 'Ripple Wall' or publish as class booklet.",
    color: "text-blue-500",
    assignments: []
  },
  {
    id: 6,
    title: "Science of Kindness Mini-Unit",
    icon: Brain,
    objective: "Teach neuroscience of kindness and mirror neurons.",
    activity: "Kids do a kind act, journal feelings, and observe recipient's response.",
    tieIn: "Discuss how positive actions ripple through brain chemistry and social networks.",
    followUp: "Chart mood shifts before/after acts of kindness using scientific method.",
    color: "text-indigo-500",
    assignments: []
  }
];

export default function RippleLearningActivities() {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [reflection, setReflection] = useState('');

  const handleAssignModule = (module: Module) => {
    setSelectedModule(module);
    setAssignmentDialog(true);
  };

  const handleCreateAssignment = () => {
    if (selectedStudents.length === 0 || !dueDate) {
      toast.error('Please select students and due date');
      return;
    }
    
    toast.success(`Module "${selectedModule?.title}" assigned to ${selectedStudents.length} students`);
    setAssignmentDialog(false);
    setSelectedStudents([]);
    setDueDate('');
  };

  const handleUploadWork = () => {
    toast.success('Student work uploaded successfully');
    setUploadDialog(false);
  };

  const handleShareHighlights = () => {
    toast.success('Highlights shared to school bulletin board');
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ripple Learning Activities</h1>
          <p className="text-muted-foreground mt-1">
            Structured modules to teach kindness and track ripple effects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Work
          </Button>
          <Button variant="outline" onClick={handleShareHighlights}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Highlights
          </Button>
        </div>
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="assignments">Active Assignments</TabsTrigger>
          <TabsTrigger value="impact">Ripple Impact Map</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              const isExpanded = expandedModule === module.id;
              
              return (
                <Card key={module.id} className="overflow-hidden">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleModule(module.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="p-6 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg bg-muted ${module.color}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-lg font-semibold">{module.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {module.objective}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignModule(module);
                              }}
                            >
                              Assign
                            </Button>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              Activity
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {module.activity}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <BookOpen className="h-4 w-4 text-primary" />
                              Tie-In
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {module.tieIn}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <MapIcon className="h-4 w-4 text-primary" />
                              Follow-Up
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {module.followUp}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t">
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            45-60 min
                          </Badge>
                          <Badge variant="secondary">
                            Ages 8-14
                          </Badge>
                          <Badge variant="secondary">
                            Group Activity
                          </Badge>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Assignments</CardTitle>
                <CardDescription>Track student progress on assigned modules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Heart className="h-5 w-5 text-pink-500" />
                      <div>
                        <p className="font-medium">SEL Lesson - Empathy Practice</p>
                        <p className="text-sm text-muted-foreground">Due: March 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={75} className="w-24" />
                      <span className="text-sm">18/24 submitted</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <PenTool className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Storytelling Project</p>
                        <p className="text-sm text-muted-foreground">Due: March 20, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={45} className="w-24" />
                      <span className="text-sm">11/24 submitted</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Users className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Community Service Project</p>
                        <p className="text-sm text-muted-foreground">Due: March 25, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={20} className="w-24" />
                      <span className="text-sm">5/24 submitted</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Ripple Impact Visualization</CardTitle>
              <CardDescription>See how kindness actions spread through your classroom</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full"></div>
                    <div className="relative bg-primary text-primary-foreground rounded-full h-24 w-24 flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold">156</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Total Ripple Actions</p>
                    <p className="text-sm text-muted-foreground">Impacting 450+ people</p>
                  </div>
                  <div className="flex justify-center gap-4 pt-4">
                    <Badge variant="secondary">24 Students</Badge>
                    <Badge variant="secondary">6 Modules</Badge>
                    <Badge variant="secondary">3 Weeks</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialog} onOpenChange={setAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Module</DialogTitle>
            <DialogDescription>
              Assign "{selectedModule?.title}" to your students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Students</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose students or entire class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Entire Class (24 students)</SelectItem>
                  <SelectItem value="group1">Group 1 (8 students)</SelectItem>
                  <SelectItem value="group2">Group 2 (8 students)</SelectItem>
                  <SelectItem value="group3">Group 3 (8 students)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Due Date</Label>
              <Input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Instructions (Optional)</Label>
              <Textarea 
                placeholder="Add any special instructions for this assignment..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment}>
                Create Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Work Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Student Work</DialogTitle>
            <DialogDescription>
              Upload stories, photos, or testimonies from student activities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Module</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Student Name</Label>
              <Input placeholder="Enter student name" />
            </div>
            
            <div>
              <Label>Upload Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-xs">Story/Text</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Image className="h-5 w-5 mb-1" />
                  <span className="text-xs">Photo</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <PenTool className="h-5 w-5 mb-1" />
                  <span className="text-xs">Artwork</span>
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Reflection</Label>
              <Textarea placeholder="Add student reflection or teacher notes..." />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadWork}>
                Upload Work
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}