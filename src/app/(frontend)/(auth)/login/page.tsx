"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { login } from "@/lib/server-functions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { loginSchema, type LoginSchema } from "@/schemas/auth.schema";
import { LoaderIcon } from "@/components/loader";

export default function Login() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit", // Only validate on submit for better performance
  });

  async function onSubmit(data: LoginSchema) {
    startTransition(async () => {
      const result = await login(data.email, data.password);

      if (result.success) {
        // Use replace for better UX (no back button to login page after auth)
        router.replace("/");
        router.refresh();
      } else {
        form.setError("root", { message: result.error || "Login failed" });
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center">Login to your account</CardTitle>
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
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isPending}
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs" role="alert">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer active:scale-95 transition-transform duration-150"
                  disabled={isPending}
                  aria-busy={isPending}
                >
                  {isPending ? <LoaderIcon /> : "Login"}
                </Button>
                <p className="text-center text-sm mt-2 text-gray-700">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-blue-500 hover:underline"
                    prefetch={true}
                  >
                    Register
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
