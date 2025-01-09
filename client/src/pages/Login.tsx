import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import TwoFactorModal from "@/components/auth/TwoFactorModal";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    // Simulate successful login
    setShow2FA(true);
  };

  const handle2FAVerify = (code: string) => {
    setShow2FA(false);
    // Navigate to chat with showOnboarding flag
    navigate("/chat?showOnboarding=true");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-2 items-center text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-xl font-bold text-primary-foreground">CG</span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to ChatGenius</CardTitle>
          <CardDescription>
            Sign in to continue to your workspace
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
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
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button variant="link" className="text-sm">
            Forgot password?
          </Button>
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="p-0 text-sm" onClick={() => navigate("/signup")}>
              Create account
            </Button>
          </div>
        </CardFooter>
      </Card>

      <TwoFactorModal
        isOpen={show2FA}
        onClose={() => setShow2FA(false)}
        onVerify={handle2FAVerify}
      />
    </div>
  );
}