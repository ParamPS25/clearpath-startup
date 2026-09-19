import Link from "next/link";
import ReportView from "@/components/ReportView";
import { getReport, NotFoundError } from "@/lib/api";
import { ValidationReport } from "@/lib/types";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let report: ValidationReport | null = null;
  let isNotFound = false;
  let errorMessage = "";

  try {
    report = await getReport(id);
  } catch (err) {
    isNotFound = err instanceof NotFoundError;
    errorMessage = isNotFound
      ? "This link may be invalid, or the report may have been removed."
      : (err as Error).message;
  }

  if (report) {
    return (
      <main className="flex min-h-screen flex-col items-center gap-8 p-8 font-sans">
        <ReportView report={report} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-lg font-medium">
        {isNotFound ? "Report not found" : "Something went wrong"}
      </p>
      <p className="text-sm text-gray-500 max-w-sm">{errorMessage}</p>
      <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        Back to home
      </Link>
    </main>
  );
}
