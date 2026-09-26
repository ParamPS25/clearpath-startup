import type { Metadata } from "next";
import Link from "next/link";
import ReportView from "@/components/ReportView";
import { getReport, NotFoundError } from "@/lib/api";
import { ValidationReport } from "@/lib/types";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    // Same cached fetch the page body below makes — Next dedupes identical
    // fetch calls within one request, so this doesn't cost a second round trip.
    const report = await getReport(id);
    const title = `${report.name} - validation report`;
    return {
      title,
      description: report.overallVerdict,
      openGraph: { title: `${title} - Clearpath`, description: report.overallVerdict },
      twitter: { title: `${title} - Clearpath`, description: report.overallVerdict },
    };
  } catch {
    return { title: "Report not found" };
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
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
      <main className="flex min-h-[calc(100vh-56px)] flex-col items-center gap-8 p-8">
        <ReportView report={report} />
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center gap-3 p-8 text-center">
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
