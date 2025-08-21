import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { laravelApiRequest } from "@/lib/laravel-api";

const loginSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { staffId: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return await laravelApiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);

      toast({
        title: "Login Success",
        description: `Welcome, ${data.user.first_name} ${data.user.last_name}`,
        variant: "success",
      });

      onLoginSuccess(data.user, data.token); // <-- pass token
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => loginMutation.mutate(data);

  const handleDemoLogin = (staffId: string) => {
    form.setValue("staffId", staffId);
    form.setValue("password", "demo");
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-becs-navy rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-becs-navy">BECS Consultancy</h1>
          <p className="text-becs-gray">Task & Project Management System</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center text-becs-navy">Sign In</CardTitle>
            <p className="text-sm text-center text-becs-gray">
              Enter your credentials to access the system
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your Staff ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-becs-navy hover:bg-becs-navy/90"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>

            {/* Demo Buttons */}
            <div className="mt-6 space-y-3 text-center text-sm text-becs-gray">
              Demo Login:
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("BECS001")}>
                  Admin
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("BECS002")}>
                  Director
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("BECS003")}>
                  Staff
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
