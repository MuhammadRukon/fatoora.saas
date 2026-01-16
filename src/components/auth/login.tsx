"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "../ui/form";
import Link from "next/link";
import { login } from "@/lib/server-functions";
import { useRouter } from "next/navigation";

export function Login() {
  const router = useRouter();
  interface LoginData {
    email: string;
    password: string;
  }
  const form = useForm<LoginData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginData) {
    const result = await login(data.email, data.password);

    if (result.success) {
      router.push("/");
    } else {
      console.log(result.error);
    }
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  {...form.register("password")}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer active:scale-95 transition-all duration-300"
                >
                  Login
                </Button>
                <p className="text-center text-sm mt-2 text-gray-700">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-blue-500">
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
