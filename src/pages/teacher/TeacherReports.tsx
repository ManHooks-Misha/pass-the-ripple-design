import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Share2, Mail, Printer, HelpCircle } from 'lucide-react';
import { usePageTutorial } from "@/hooks/usePageTutorial";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TeacherReports() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_reports_tutorial_completed",
    steps: [],
  });
  const [selectedClass, setSelectedClass] = useState('5a');
  const [dateRange, setDateRange] = useState('month');
  const [selectedReportType, setSelectedReportType] = useState('summary');

  const studentReports = [
    { name: 'Alex Johnson', ripples: 45, badges: 3, milestones: 2, lastActive: '2024-01-15' },
    { name: 'Emma Wilson', ripples: 42, badges: 2, milestones: 3, lastActive: '2024-01-14' },
    { name: 'Michael Chen', ripples: 38, badges: 4, milestones: 2, lastActive: '2024-01-15' },
    { name: 'Sophia Martinez', ripples: 35, badges: 2, milestones: 1, lastActive: '2024-01-13' },
  ];

  const classroomMetrics = {
    totalRipples: 289,
    activeStudents: 24,
    totalStudents: 28,
    avgRipplesPerStudent: 10.3,
    topCategory: 'Helping Others',
    weeklyGrowth: '+15%',
  };

  const handleExportReport = (format: string) => {
    // Simulate export functionality
    console.log(`Exporting report as ${format}`);
  };

  const handleShareReport = (method: string) => {
    // Simulate share functionality
    console.log(`Sharing report via ${method}`);
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_reports_tutorial_completed"
        />
      )}
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Classroom Reports
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Generate and export detailed classroom analytics
          </p>
        </div>
        {tutorialSteps && tutorialSteps.length > 0 && (
          <Button
            onClick={startTutorial}
            variant="outline"
            size="sm"
            className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2 flex-shrink-0"
            title="Take a tour of this page"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Help</span>
          </Button>
        )}
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Classroom</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5a">Class 5A</SelectItem>
                  <SelectItem value="5b">Class 5B</SelectItem>
                  <SelectItem value="5c">Class 5C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="individual">Individual Progress</SelectItem>
                  <SelectItem value="comparative">Comparative Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Details</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="export">Export & Share</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ripples</CardTitle>
                <Badge variant="default">{classroomMetrics.weeklyGrowth}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classroomMetrics.totalRipples}</div>
                <p className="text-xs text-muted-foreground">Across all students this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classroomMetrics.activeStudents} / {classroomMetrics.totalStudents}
                </div>
                <p className="text-xs text-muted-foreground">Students participating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average per Student</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classroomMetrics.avgRipplesPerStudent}</div>
                <p className="text-xs text-muted-foreground">Ripples per active student</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kindness Categories Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Helping Others', 'Gratitude', 'Environmental Care', 'Sharing', 'Encouragement'].map((category, idx) => {
                  const percentage = [45, 25, 15, 10, 5][idx];
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Student Progress</CardTitle>
              <CardDescription>Detailed breakdown by student</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-center">Ripples</TableHead>
                    <TableHead className="text-center">Badges</TableHead>
                    <TableHead className="text-center">Milestones</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentReports.map((student) => (
                    <TableRow key={student.name}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">{student.ripples}</TableCell>
                      <TableCell className="text-center">{student.badges}</TableCell>
                      <TableCell className="text-center">{student.milestones}</TableCell>
                      <TableCell>{student.lastActive}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classroom Trends</CardTitle>
              <CardDescription>Activity patterns and growth metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Weekly Activity Pattern</h4>
                  <p className="text-sm text-muted-foreground">
                    Highest activity on Wednesdays (avg. 45 ripples), lowest on Mondays (avg. 23 ripples)
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Growth Trend</h4>
                  <p className="text-sm text-muted-foreground">
                    15% increase in ripples compared to last month, with 3 new students becoming active
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Top Performing Period</h4>
                  <p className="text-sm text-muted-foreground">
                    Morning sessions (9-11 AM) show 40% more engagement than afternoon sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleExportReport('pdf')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleExportReport('excel')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as Excel
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleExportReport('csv')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Include in Export:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="summary" defaultChecked />
                      <label htmlFor="summary" className="text-sm">Summary Statistics</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="individual" defaultChecked />
                      <label htmlFor="individual" className="text-sm">Individual Progress</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="trends" />
                      <label htmlFor="trends" className="text-sm">Trend Analysis</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleShareReport('email')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email to Parents
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleShareReport('print')}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleShareReport('dashboard')}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share to School Dashboard
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Recipients</Label>
                  <Input 
                    id="email"
                    type="text" 
                    placeholder="Enter email addresses separated by commas"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}