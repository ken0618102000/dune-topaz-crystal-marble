import { createFileRoute } from "@tanstack/react-router";
import { ReportPage } from "@/components/report/ReportPage";

export const Route = createFileRoute("/s/$code/report")({
  component: SessionReport,
});

function SessionReport() {
  const { code } = Route.useParams();
  return <ReportPage code={code.toUpperCase()} />;
}
