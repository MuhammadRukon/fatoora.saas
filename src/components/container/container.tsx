import { getCurrentUser } from "@/lib/server-functions";
import { redirect } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "../ui/sidebar";
import { Separator } from "../ui/separator";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Logout from "../auth/logout";
import CustomBreadcrumb from "../custom-breadcrumb/CustomBreadcrumb";

export type ContainerProps = {
  children: React.ReactNode;
};

export type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  country?: string | null;
  vatNumber?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  companyLogo?: {
    id: string;
    url: string;
    alt: string;
  } | null;
};

export async function Container({ children }: ContainerProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const data = {
    navMain: [
      {
        title: "",
        url: "/",
        items: [
          {
            title: "Invoices",
            url: "/invoices",
          },
          {
            title: "Company Info",
            url: "/company-info",
          },
        ],
      },
    ],
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-16 flex items-center justify-center">
          <Link href="/" className="w-10 h-10 relative">
            <Image src="/logo.png" alt="logo" fill />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          {data.navMain.map((item) => (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link prefetch={true} href={item.url}>
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={user.photoUrl || "logo.png"}
                alt={
                  user.companyName ||
                  user.firstName + " " + user.lastName ||
                  "users-photo"
                }
              />
              <AvatarFallback className="rounded-lg">MR</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user.firstName || "Mr. Admin"}
              </span>
              <span className="truncate text-xs">{user.companyName || user.email}</span>
            </div>
            <Logout />
          </SidebarMenuButton>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <CustomBreadcrumb />
        </header>
        <div className="container max-h-[calc(100vh-4rem)] overflow-y-auto mx-auto relative p-3 sm:p-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
