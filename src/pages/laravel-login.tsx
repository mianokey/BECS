import { useState } from "react";
import { useLaravelAuth } from "@/hooks/useLaravelAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Building2 } from "lucide-react";

export default function LaravelLogin() {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, loginError } = useLaravelAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffId && password) {
      login({
        staff_id: staffId,
        password: password,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">BECS Consultancy</h1>
          <p className="text-gray-600 mt-2">Task & Project Management System</p>
          <p className="text-sm text-blue-600 font-medium mt-1">Laravel API Version</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your BECS staff credentials to access the Laravel-powered system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {loginError.message || 'Login failed. Please check your credentials.'}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="staffId">Staff ID</Label>
                <Input
                  id="staffId"
                  type="text"
                  placeholder="BECS001"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  required
                  disabled={isLoggingIn}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                  className="h-11"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoggingIn || !staffId || !password}
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Laravel API Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-blue-900">Laravel Backend Integration</h3>
              <p className="text-sm text-blue-700">
                This frontend is designed to consume Laravel API endpoints
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <p>Expected API Base: <code className="bg-blue-100 px-1 rounded">http://localhost:8000</code></p>
                <p>Auth Endpoint: <code className="bg-blue-100 px-1 rounded">POST /api/auth/login</code></p>
                <p>CSRF Protection: Sanctum middleware expected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-gray-700">Demo Credentials</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Admin:</strong> BECS001 / admin123</p>
                <p><strong>Director:</strong> BECS003 / director123</p>
                <p><strong>Staff:</strong> BECS005 / staff123</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Ensure your Laravel backend is running with populated seed data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}