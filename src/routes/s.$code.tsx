import { createFileRoute, Outlet, useChildMatches } from "@tanstack/react-router";
import { BoardView } from "@/components/board/BoardView";

export const Route = createFileRoute("/s/$code")({
  component: SessionShell,
});

function SessionShell() {
  const { code } = Route.useParams();
  const children = useChildMatches();
  if (children.length > 0) return <Outlet />;
  return <BoardView code={code.toUpperCase()} />;
}
