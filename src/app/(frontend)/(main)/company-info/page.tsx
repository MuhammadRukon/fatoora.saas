import { getCurrentUser } from "@/lib/server-functions";
import Image from "next/image";

export default async function page() {
  const user = await getCurrentUser();
  

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Info</h1>
      <div className=" flex flex-col gap-2 text-center items-center">
        <div className="border border-gray-200 shadow-xs flex items-center justify-center w-60 h-60 relative rounded-lg">
          <Image src="/logo.png" alt="logo" fill className="object-contain" />
        </div>

        <div className="text-sm">
          <p className="font-semibold text-gray-900">{user?.companyName}</p>
          <p className="text-gray-600">{user?.country}</p>
          <p className="text-gray-600">Tax registration number: {user?.taxRegNum}</p>
        </div>
      </div>
    </div>
  );
}
