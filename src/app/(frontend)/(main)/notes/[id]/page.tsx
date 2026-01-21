import { NoteDisplay } from "@/components/notes/NoteDisplay";
import { getCurrentUser, getCurrentUserCompanyData, getNote } from "@/lib/server-functions";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserData } from "@/components/container/container";

export default async function NoteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const [noteResult, userData] = await Promise.all([
    getNote(id),
    getCurrentUserCompanyData(),
  ]);

  if (!noteResult.success || !noteResult.note) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Note not found</p>
          <Button asChild className="mt-4">
            <Link href="/notes">Back to Notes</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!userData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/notes">Back to Notes</Link>
        </Button>
        <Button asChild>
          <Link href={`/print/note/${id}`}>Print</Link>
        </Button>
      </div>
      <NoteDisplay note={noteResult.note as any} userData={userData as UserData} />
    </div>
  );
}

