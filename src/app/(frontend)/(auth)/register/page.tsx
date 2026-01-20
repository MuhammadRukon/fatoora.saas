"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { RegisterData } from "@/interface/auth";
import { register } from "@/lib/server-functions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<RegisterData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  useEffect(() => {
    if (password !== confirmPassword) {
      form.setError("confirmPassword", { message: "Passwords do not match" });
    } else {
      form.clearErrors("confirmPassword");
    }
  }, [password, confirmPassword, form]);

  async function onSubmit(data: RegisterData) {
    setIsLoading(true);
    const result = await register(data);
    if (result.success) {
      setIsLoading(false);
      router.push("/");
    } else {
      console.error(result.error);
    }
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center">Register</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  {...form.register("firstName")}
                  id="firstName"
                  type="text"
                  placeholder="John"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  {...form.register("lastName")}
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...form.register("email")}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...form.register("password")}
                  id="password"
                  type="password"
                  required
                  placeholder="Password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  {...form.register("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm Password"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div className="flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register"}
                </Button>
                <p className="text-center text-sm text-gray-700 mt-2">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-500">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
