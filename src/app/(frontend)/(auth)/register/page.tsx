"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { useTransition } from "react";
import { register } from "@/lib/server-functions";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterSchema } from "@/schemas/auth.schema";
import { LoaderIcon } from "@/components/loader";

export default function Register() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  async function onSubmit(data: RegisterSchema) {
    startTransition(async () => {
      const result = await register(data);
      if (result.success) {
        router.replace("/");
        router.refresh();
      } else {
        form.setError("root", { message: result.error || "Registration failed" });
      }
    });
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
              {form.formState.errors.root && (
                <p className="text-red-500 text-sm text-center" role="alert">
                  {form.formState.errors.root.message}
                </p>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  {...form.register("firstName")}
                  id="firstName"
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                  disabled={isPending}
                  aria-invalid={!!form.formState.errors.firstName}
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-xs" role="alert">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  {...form.register("lastName")}
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  autoComplete="family-name"
                  disabled={isPending}
                  aria-invalid={!!form.formState.errors.lastName}
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-xs" role="alert">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...form.register("email")}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  disabled={isPending}
                  aria-invalid={!!form.formState.errors.email}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...form.register("password")}
                  id="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  disabled={isPending}
                  aria-invalid={!!form.formState.errors.password}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs" role="alert">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  {...form.register("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  disabled={isPending}
                  aria-invalid={!!form.formState.errors.confirmPassword}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs" role="alert">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              
              <div className="flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full cursor-pointer active:scale-95 transition-transform duration-150" 
                  disabled={isPending}
                  aria-busy={isPending}
                >
                  {isPending ? <LoaderIcon /> : "Register"}
                </Button>
                <p className="text-center text-sm text-gray-700 mt-2">
                  Already have an account?{" "}
                  <Link 
                    href="/login" 
                    className="text-blue-500 hover:underline"
                    prefetch={true}
                  >
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
