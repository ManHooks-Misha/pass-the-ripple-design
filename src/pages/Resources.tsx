import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  BookOpen,
  Clock, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  Target,
  TrendingUp,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

const Resources = () => {


  return (
    <main className="w-full px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto relative bg-white">
      <Seo
        title="Teacher Resources — Pass The Ripple"
        description="Comprehensive resources and tools for educators to implement Pass The Ripple in their classrooms."
        canonical={window.location.origin + "/resources"}
      />
      
      {/* Header - Dashboard Style */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              For Teachers
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Everything you need to implement Pass The Ripple in your classroom
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              asChild
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg"
            >
              <Link to="/teacher">
                <GraduationCap className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Access Teacher Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
        
        <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm mt-4">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm text-blue-800 font-medium">
            All resources are designed with child safety and privacy in mind. 
            Perfect for classroom use with students of all ages.
          </AlertDescription>
        </Alert>
      </div>

      {/* Quick Start Guide */}
      <Card className="shadow-xl border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden mb-4 sm:mb-6">
        <div className="absolute bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
        <CardHeader className="relative p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-blue-900">
                Quick Start Guide
              </CardTitle>
              <CardDescription className="text-blue-700 text-sm sm:text-base">
                Get your classroom started with Pass The Ripple in 3 simple steps
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 relative p-4 sm:p-6">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-3">
            <div className="group text-center space-y-3 sm:space-y-4 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-blue-600 font-bold text-lg sm:text-xl">1</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2">Setup & Registration</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Access your teacher dashboard and register student cards for your classroom
                </p>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                5 minutes
              </Badge>
            </div>
            
            <div className="group text-center space-y-3 sm:space-y-4 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-green-600 font-bold text-lg sm:text-xl">2</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2">Introduce the Concept</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Use our lesson plans and activities to explain kindness and ripple effects
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                30 minutes
              </Badge>
            </div>
            
            <div className="group text-center space-y-3 sm:space-y-4 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-purple-600 font-bold text-lg sm:text-xl">3</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2">Track & Celebrate</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Monitor student progress and celebrate their kindness achievements
                </p>
              </div>
              <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Ongoing
              </Badge>
            </div>
          </div>
          
          <div className="text-center pt-4 sm:pt-6 border-t border-blue-200">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-bold rounded-full"
            >
              <Link to="/teacher">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Bring Pass The Ripple to your classroom
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Teacher Dashboard Access */}
      <Card className="shadow-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 overflow-hidden relative mb-4 sm:mb-6">
        <div className="absolute  bg-gradient-to-r from-blue-500/10 to-indigo-500/10"></div>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
        
        <CardHeader className="relative p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-blue-900">
                Teacher Dashboard
              </CardTitle>
              <CardDescription className="text-blue-700 text-sm sm:text-base">
                Access your comprehensive classroom management and student tracking tools
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 sm:space-y-8 relative p-4 sm:p-6">
          <div className="grid gap-6 sm:gap-8 lg:gap-10 md:grid-cols-2">
            {/* Classroom Management */}
            <div className="group p-6 sm:p-8 lg:p-10 border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-300">
              <div className="mb-6 sm:mb-8 pb-4 border-b border-blue-100">
                <h4 className="font-bold text-gray-900 text-xl sm:text-2xl">Classroom Management</h4>
              </div>
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 rounded-xl hover:bg-white transition-colors">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Register Multiple Student Cards</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 rounded-xl hover:bg-white transition-colors">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Track Class Progress</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 rounded-xl hover:bg-white transition-colors">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">View Student Activities</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 rounded-xl hover:bg-white transition-colors">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Generate Reports</p>
                </div>
              </div>
            </div>
            
            {/* Student Management */}
            <div className="group p-6 sm:p-8 lg:p-10 border-2 border-green-200 rounded-2xl bg-gradient-to-br from-white to-green-50/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-300">
              <div className="mb-6 sm:mb-8 pb-4 border-b border-green-100">
                <h4 className="font-bold text-gray-900 text-xl sm:text-2xl">Student Management</h4>
              </div>
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 rounded-xl hover:bg-white transition-colors">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Real-Time Activity Monitoring</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 rounded-xl hover:bg-white transition-colors">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Leaderboards & Achievements</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 rounded-xl hover:bg-white transition-colors">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Interactive Learning Activities</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/80 rounded-xl hover:bg-white transition-colors">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Share Success Stories</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-6 sm:pt-8 border-t border-blue-200">
            <div className="inline-flex flex-col items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 shadow-lg border border-blue-200">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                <span className="font-medium">Ready to transform your classroom?</span>
              </div>
              <Button 
                asChild
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl hover:brightness-110 transform hover:scale-105 transition-all duration-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base lg:text-lg font-semibold"
              >
                <Link to="/teacher">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Access Teacher Dashboard</span>
                  <span className="sm:hidden">Teacher Dashboard</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Link>
              </Button>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                  Free Access
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                  No Setup Fees
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>




      {/* Safety Notice */}
      <Card className="shadow-2xl border-2 border-green-400 bg-gradient-to-br from-green-100 via-emerald-50 to-green-50 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10"></div>
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-10 translate-x-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-emerald-400/20 to-green-400/20 rounded-full translate-y-8 -translate-x-8 blur-2xl"></div>
        <CardContent className="p-4 sm:p-5 md:p-6 relative">
          <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg flex-shrink-0 ring-1 ring-green-200">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-green-900 text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 leading-tight">
                Safety & Privacy
              </h3>
              <p className="text-xs sm:text-sm text-green-800 leading-relaxed font-medium mb-3 sm:mb-4">
                Built for kids. Led by grown-ups.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 rounded-full shadow-sm border-2 border-green-200">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                  <span className="font-bold text-green-800 text-xs">Human-Moderated</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 rounded-full shadow-sm border-2 border-green-200">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                  <span className="font-bold text-green-800 text-xs">No Public Chat</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 rounded-full shadow-sm border-2 border-green-200">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                  <span className="font-bold text-green-800 text-xs">Parent Controls</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Resources;
