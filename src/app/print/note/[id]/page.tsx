import { NotePrintView } from "@/components/notes/NotePrintView";
import { getCurrentUserCompanyData } from "@/lib/server-functions";

export default async function NotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userData = await getCurrentUserCompanyData();

  if (!userData) {
    return null;
  }

  return <NotePrintView noteId={id} userData={userData as any} />;
}



