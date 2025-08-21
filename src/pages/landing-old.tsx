import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Calendar, FileText, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-becs-soft to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 becs-gradient rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-becs-navy">BECS Consultancy</h1>
              <p className="text-becs-gray text-lg">LLP</p>
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-becs-navy mb-4">
            Task & Project Management System
          </h2>
          <p className="text-xl text-becs-gray max-w-2xl mx-auto">
            Streamline your workflow with our comprehensive management platform designed
            for modern consultancy operations.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 border-transparent hover:border-becs-blue transition-colors">
            <CardHeader>
              <div className="w-12 h-12 becs-gradient rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-becs-navy">Staff Management</CardTitle>
              <CardDescription>
                Comprehensive staff tracking with role-based access control and workload monitoring.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-transparent hover:border-becs-blue transition-colors">
            <CardHeader>
              <div className="w-12 h-12 becs-gold-gradient rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-becs-navy">Task Allocation</CardTitle>
              <CardDescription>
                Efficient task assignment and tracking with automated notifications and progress monitoring.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-transparent hover:border-becs-blue transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-becs-navy">Attendance Tracking</CardTitle>
              <CardDescription>
                Real-time attendance monitoring with clock-in/out functionality and detailed reporting.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-transparent hover:border-becs-blue transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-becs-navy">Project Dashboard</CardTitle>
              <CardDescription>
                Centralized project overview with deliverables tracking and progress visualization.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-transparent hover:border-becs-blue transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-becs-red to-red-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-becs-navy">Analytics & Reports</CardTitle>
              <CardDescription>
                Comprehensive reporting with efficiency scoring and performance analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-transparent hover:border-becs-blue transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-becs-navy">Templates Library</CardTitle>
              <CardDescription>
                Accessible repository of templates for contracts, letters, and documentation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-md mx-auto bg-white shadow-xl border-2 border-becs-blue/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-becs-navy mb-2">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Access your personalized dashboard and start managing your projects efficiently.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-becs-blue hover:bg-becs-navy text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                size="lg"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
