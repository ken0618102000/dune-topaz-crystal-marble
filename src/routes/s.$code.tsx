import { createFileRoute } from "@tanstack/react-router";
import { BoardView } from "@/components/board/BoardView";

export const Route = createFileRoute("/s/$code")({
  component: SessionBoard,
});

function SessionBoard() {
  const { code } = Route.useParams();
  return <BoardView code={code.toUpperCase()} />;
}
