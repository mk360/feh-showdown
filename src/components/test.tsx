import { useEffect } from "react";
import { useGameContext } from "@/context/game-context";

export default function Index() {
  const { game: world } = useGameContext();
  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    if (typeof window !== 'object') {
      return;
    }

    // @ts-ignore
    const game = await import("fire-emblem-heroes/lib/scripts/game");
    game.default.registry.set("world", world);
  };

  return null;
}