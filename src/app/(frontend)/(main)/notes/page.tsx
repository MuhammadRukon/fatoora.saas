import { getCurrentUser, getNotes } from "@/lib/server-functions";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const notesResult = await getNotes();

  if (!notesResult.success) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Error loading notes</p>
        </Card>
      </div>
    );
  }

  const notes = notesResult.docs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Credit & Debit Notes</h1>
        <Button asChild>
          <Link href="/notes/create">+ Create Note</Link>
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-500 text-lg mb-4">No notes found</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note: any) => (
            <Card key={note.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{note.noteNumber}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        note.documentType === "credit"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {note.documentType === "credit" ? "Credit" : "Debit"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Original Invoice:{" "}
                    {typeof note.originalInvoice === "object"
                      ? note.originalInvoice.invoiceNumber
                      : "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {formatDate(note.date)} | Total: SAR{" "}
                    {note.total?.toFixed(2) || "0.00"}
                  </p>
                  {note.reason && (
                    <p className="text-sm text-gray-500 mt-1">{note.reason}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href={`/notes/${note.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
