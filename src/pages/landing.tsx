import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, LogIn, UserPlus, Shield, Users, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [portalType, setPortalType] = useState<'staff' | 'admin' | null>(null);
  const [loginForm, setLoginForm] = useState({ staffId: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    staffId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
    position: "",
    password: "",
    confirmPassword: ""
  });
  
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { staffId: string; password: string }) => {
      const response = await fetch("/api/auth/staff-login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome to BECS Task Management System",
      });
      window.location.reload(); // Reload to trigger auth state change
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/staff-register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Registration Submitted",
        description: data.message || "Your registration has been submitted for approval",
      });
      setRegisterForm({
        staffId: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        department: "",
        position: "",
        password: "",
        confirmPassword: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.staffId || !loginForm.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both Staff ID and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    const { confirmPassword, ...submitData } = registerForm;
    registerMutation.mutate(submitData);
  };

  const handlePortalSelect = (type: 'staff' | 'admin') => {
    setPortalType(type);
    setShowAuth(true);
  };

  const handleBackToPortals = () => {
    setShowAuth(false);
    setPortalType(null);
  };

  // Portal Selection Screen
  if (!showAuth) {
    return (
      <div className="min-h-screen becs-warm-gradient flex items-center justify-center">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 becs-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-becs-text-primary mb-4">
              BECS Consultancy
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-becs-maroon mb-6">
              Limited Liability Partnership
            </h2>
            <p className="text-lg text-becs-text-secondary mb-8 leading-relaxed">
              Choose your access portal to continue
            </p>
          </div>

          {/* Portal Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Staff Portal */}
            <Card className="becs-professional-card border-2 border-becs-soft-gray hover:border-becs-navy transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-becs-navy rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-semibold text-becs-text-primary">
                  Staff Portal
                </CardTitle>
                <CardDescription className="text-becs-text-secondary">
                  Access for regular staff members and external users
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4 mb-6">
                  <div className="text-sm text-becs-text-secondary">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-becs-navy rounded-full"></div>
                      <span>Task Management</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-becs-navy rounded-full"></div>
                      <span>Attendance Tracking</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-becs-navy rounded-full"></div>
                      <span>Leave Applications</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handlePortalSelect('staff')}
                  className="w-full bg-becs-navy hover:bg-becs-navy-dark text-white py-3"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Staff Sign In
                </Button>
              </CardContent>
            </Card>

            {/* Admin Portal */}
            <Card className="becs-professional-card border-2 border-becs-soft-gray hover:border-becs-red transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-becs-red rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-semibold text-becs-text-primary">
                  Management Portal
                </CardTitle>
                <CardDescription className="text-becs-text-secondary">
                  Access for administrators and directors
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4 mb-6">
                  <div className="text-sm text-becs-text-secondary">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-becs-red rounded-full"></div>
                      <span>Project Management</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-becs-red rounded-full"></div>
                      <span>Staff Oversight</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-becs-red rounded-full"></div>
                      <span>System Administration</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handlePortalSelect('admin')}
                  className="w-full bg-becs-red hover:bg-becs-maroon text-white py-3"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Management Sign In
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Demo Credentials */}
          <div className="mt-12 max-w-2xl mx-auto">
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-amber-800 text-center">Demo Credentials</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-700 space-y-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-900">Staff Portal:</h4>
                    <div><strong>Staff:</strong> BECS005 / staff123</div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-900">Management Portal:</h4>
                    <div><strong>Admin:</strong> BECS001 / admin123</div>
                    <div><strong>Director:</strong> BECS002 / director123</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Footer */}
          <div className="text-center mt-12 pt-8 border-t border-becs-soft-gray">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-becs-gold rounded-full"></div>
              <div className="w-2 h-2 bg-becs-red rounded-full"></div>
              <div className="w-2 h-2 bg-becs-navy rounded-full"></div>
            </div>
            <p className="text-becs-text-secondary text-sm">
              © 2025 BECS Consultancy LLP. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authentication Screen
  return (
    <div className="min-h-screen becs-warm-gradient flex items-center justify-center">
      <div className="container mx-auto px-6 py-12 max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              portalType === 'staff' ? 'bg-becs-navy' : 'bg-becs-red'
            }`}>
              {portalType === 'staff' ? (
                <Users className="h-8 w-8 text-white" />
              ) : (
                <Shield className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-becs-text-primary mb-4">
            {portalType === 'staff' ? 'Staff Portal' : 'Management Portal'}
          </h1>
          <p className="text-becs-text-secondary mb-6">
            {portalType === 'staff' 
              ? 'Sign in with your BECS Staff ID or register for new external users'
              : 'Sign in with your management credentials'
            }
          </p>
          <Button 
            onClick={handleBackToPortals}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portals
          </Button>
        </div>

        {/* Authentication Form */}
        <Card className="becs-professional-card border-2 border-becs-soft-gray">
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staffId">Staff ID</Label>
                    <Input
                      id="staffId"
                      placeholder="e.g. BECS001 or EXT001"
                      value={loginForm.staffId}
                      onChange={(e) => setLoginForm({ ...loginForm, staffId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className={`w-full text-white py-3 ${
                      portalType === 'staff' 
                        ? 'bg-becs-navy hover:bg-becs-navy-dark' 
                        : 'bg-becs-red hover:bg-becs-maroon'
                    }`}
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regStaffId">Staff ID</Label>
                    <Input
                      id="regStaffId"
                      placeholder="BECS staff use BECS### format, external users can use any ID"
                      value={registerForm.staffId}
                      onChange={(e) => setRegisterForm({ ...registerForm, staffId: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={registerForm.department}
                        onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={registerForm.position}
                        onChange={(e) => setRegisterForm({ ...registerForm, position: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+254700123456"
                      value={registerForm.phoneNumber}
                      onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regPassword">Password</Label>
                      <Input
                        id="regPassword"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className={`w-full text-white py-3 ${
                      portalType === 'staff' 
                        ? 'bg-becs-navy hover:bg-becs-navy-dark' 
                        : 'bg-becs-red hover:bg-becs-maroon'
                    }`}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Registering..." : "Register"}
                  </Button>
                </form>

                <div className="text-sm text-becs-text-secondary mt-4 p-3 bg-becs-background rounded border border-becs-soft-gray">
                  <strong>Note:</strong> BECS staff with BECS### IDs get instant access. External users require admin approval.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}