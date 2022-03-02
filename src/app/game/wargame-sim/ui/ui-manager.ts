import * as Phaser from "phaser";
import { GameplayScene } from './scenes/gameplay-scene';
import { PickTeamsScene } from "./scenes/pick-teams-scene";
import { UIManagerOptions } from './ui-manager-options';

export class UIManager {
    private readonly _game: Phaser.Game;

    constructor(options?: UIManagerOptions) {
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
            dom: {
                createContainer: true
            },
            roundPixels: true,
            scene: [PickTeamsScene, GameplayScene]
        };
        this._game = new Phaser.Game(conf);
          
        window.addEventListener('resize', () => {
            this._game.canvas.width = options?.width || window.innerWidth;
            this._game.canvas.height = options?.height || window.innerHeight * 0.8;
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

    destroy(): void {
        this.game.destroy(true, true);
    }

    get game(): Phaser.Game {
        return this._game;
    }
}