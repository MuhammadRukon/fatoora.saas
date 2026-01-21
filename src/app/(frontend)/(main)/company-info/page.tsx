import { getCurrentUser } from "@/lib/server-functions";
import { CompanyInfoForm } from "@/components/company/CompanyInfoForm";
import { UserData } from "@/components/container/container";

export default async function CompanyInfoPage() {
  const user = await getCurrentUser();

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Information</h1>
      <div className="max-w-4xl mx-auto">
        <CompanyInfoForm
          company={user as UserData}
        />
      </div>
    </>
  );
}
