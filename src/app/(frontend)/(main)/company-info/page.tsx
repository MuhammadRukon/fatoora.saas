import { getCurrentUser } from "@/lib/server-functions";
import { CompanyInfoForm } from "@/components/company/CompanyInfoForm";

export default async function CompanyInfoPage() {
  const user = await getCurrentUser();

  // Extract logo data if it exists
  const companyLogo =
    user?.companyLogo && typeof user.companyLogo === "object"
      ? {
          id: user.companyLogo.id,
          url: user.companyLogo.url || "",
          alt: user.companyLogo.alt || "",
        }
      : null;

  return (
    <>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Information</h1>
    <div className="max-w-4xl mx-auto">
    
      <CompanyInfoForm
        initialData={{
          companyName: user?.companyName || "",
          country: user?.country || "",
          taxRegNum: user?.taxRegNum || "",
          phone: user?.phone || "",
          companyLogo: companyLogo,
        }}
      />
    </div>
    </>
  );
}
