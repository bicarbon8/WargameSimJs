import * as Phaser from "phaser";
import { GameplayScene } from './scenes/gameplay-scene';
import { PickTeamsScene } from "./scenes/pick-teams-scene";
import { UIManagerOptions } from './ui-manager-options';

export class UIManager {
    private readonly _conf: Phaser.Types.Core.GameConfig;
    private _game: Phaser.Game;

    constructor(options?: UIManagerOptions) {
        this._conf = {
            type: Phaser.AUTO,
            width: options?.width || window.innerWidth,
            height: options?.height || window.innerHeight * 0.8,
            scale: {
                mode: Phaser.Scale.CENTER_BOTH,
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
          
        window.addEventListener('resize', () => {
            this.game.canvas.width = options?.width || window.innerWidth;
            this.game.canvas.height = options?.height || window.innerHeight * 0.8;
            this.game?.scale.refresh();
        });

        document.addEventListener("visibilitychange", () => {
            this.game?.scene.getScenes(false).forEach((scene: Phaser.Scene) => {
                if (document.hidden) {
                    this.game?.scene.pause(scene);
                } else {
                    this.game?.scene.resume(scene);
                }
            });
        }, false);
    }

    get game(): Phaser.Game {
        return this._game;
    }

    /**
     * gets the currently active Scene
     */
    get scene(): Phaser.Scene {
        const s: Phaser.Scene[] = this.game.scene.getScenes(true);
        if (s?.length) {
            return s[0];
        }
        return null;
    }

    start(): UIManager {
        this._game = new Phaser.Game(this._conf);
        return this;
    }

    destroy(): void {
        this.game?.destroy(true, true);
    }

    pointerToWorld(x: number, y: number): Phaser.Math.Vector2 {
        return this.scene.cameras.main.getWorldPoint(x, y);
    }
}