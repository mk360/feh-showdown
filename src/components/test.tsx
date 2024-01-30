import { useEffect } from "react";
import Phaser from "phaser";
import config from "fire-emblem-heroes/src/scripts/game"
import PreloadScene from "@/game/Preload";

export default function Index() {
  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    if (typeof window !== 'object') {
      return;
    }

    const DEFAULT_WIDTH = 750;
    const DEFAULT_HEIGHT = 1080;

    var config = {
      type: Phaser.AUTO,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      backgroundColor: '#4eb3e7',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 200 },
        },
      },
      parent: 'game',
      scene: [PreloadScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    var game = new Phaser.Game(config);

    // game.scene.add('main', Main);
    // game.scene.start('main');
  };

  return null;
}