import * as Phaser from "phaser";
import { GameplayScene } from "./scenes/gameplay-scene";

class WarGame {
    private _game: Phaser.Game;

    constructor() {
        let conf: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight * 0.8,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            backgroundColor: '#ffffff',
            parent: 'playfield',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                }
            },
            roundPixels: true,
            scene: [GameplayScene]
        };
        this._game = new Phaser.Game(conf);
          
        window.addEventListener('resize', () => {
            this._game.canvas.width = window.innerWidth;
            this._game.canvas.height = window.innerHeight * 0.8;
            this._game.scale.refresh();
        });

        document.addEventListener("visibilitychange", () => {
            this._game.scene.getScenes(false).forEach((scene: Phaser.Scene) => {
                if (document.hidden) {
                    this._game.scene.pause(scene);
                } else {
                    this._game.scene.resume(scene);
                }
            });
        }, false);
    }

    get game(): Phaser.Game {
        return this._game;
    }
}

export const warGame = new WarGame();