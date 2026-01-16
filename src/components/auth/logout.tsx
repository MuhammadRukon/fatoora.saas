"use client";

import { logout } from "@/lib/server-functions";
import { LogOutIcon } from "lucide-react";

export default function Logout() {
  return (
    <LogOutIcon className="ml-auto size-4  cursor-pointer" onClick={() => logout()} />
  );
}
