import { getCurrentUser } from "@/lib/server-functions";
import { redirect } from "next/navigation";

export type ContainerProps = {
  children: React.ReactNode;
};

export async function Container({ children }: ContainerProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <div className="container mx-auto relative p-3 sm:p-10">{children}</div>;
}
