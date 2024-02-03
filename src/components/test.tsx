import { useEffect } from "react";
import Phaser from "phaser";
import PreloadScene from "@/game/Preload";
import { useGameContext } from "@/context/game-context";
import MainScene from "@/game/MainScene";

export default function Index() {
  const { game: world } = useGameContext();
  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    if (typeof window !== 'object') {
      return;
    }

    const DEFAULT_WIDTH = 750;
    const DEFAULT_HEIGHT = 1200;

    const config = {
      type: Phaser.WEBGL,
      backgroundColor: '#1F5E6D',
      fps: {
        forceSetTimeout: true,
        target: 15,
        min: 15,
      },
      scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
      },
      scene: [PreloadScene, MainScene],
    }

    var game = new Phaser.Game(config);
    game.registry.set("world", world);
  };

  return null;
}