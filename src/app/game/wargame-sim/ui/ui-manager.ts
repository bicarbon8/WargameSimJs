import * as Phaser from "phaser";
import { GameplayScene } from './scenes/gameplay-scene';
import { PickTeamsScene } from "./scenes/pick-teams-scene";
import { UIManagerOptions } from './ui-manager-options';

export module UIManager {
   var _game: Phaser.Game;

    export function start(options?: UIManagerOptions): void {
        let conf: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: options?.width || window.innerWidth,
            height: options?.height || window.innerHeight * 0.8,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            backgroundColor: '#ffffff',
            parent: options?.parentElementId || 'playfield',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: (options?.debug) ? true : false,
                    gravity: { x: 0, y: 0 },
                }
            },
            roundPixels: true,
            scene: [PickTeamsScene, GameplayScene]
        };
        _game = new Phaser.Game(conf);
          
        window.addEventListener('resize', () => {
            _game.canvas.width = options?.width || window.innerWidth;
            _game.canvas.height = options?.height || window.innerHeight * 0.8;
            _game.scale.refresh();
        });

        document.addEventListener("visibilitychange", () => {
            _game.scene.getScenes(false).forEach((scene: Phaser.Scene) => {
                if (document.hidden) {
                    _game.scene.pause(scene);
                } else {
                    _game.scene.resume(scene);
                }
            });
        }, false);
    }

    export function stop(): void {
        _game.destroy(true, true);
        _game = null;
    }

    export function game(): Phaser.Game {
        return _game;
    }
}