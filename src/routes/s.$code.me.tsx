import { createFileRoute } from "@tanstack/react-router";
import { PlayerStatusPage } from "@/components/player/PlayerStatusPage";

export const Route = createFileRoute("/s/$code/me")({
  component: PlayerMe,
});

function PlayerMe() {
  const { code } = Route.useParams();
  return <PlayerStatusPage code={code.toUpperCase()} />;
}
