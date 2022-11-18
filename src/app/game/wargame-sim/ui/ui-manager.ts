import * as Phaser from "phaser";
import { Size } from "../interfaces/size";
import { GameOverScene } from "./scenes/game-over-scene";
import { GameplayScene } from './scenes/gameplay-scene';
import { OverlayScene } from "./scenes/overlay-scene";
import { PickTeamsScene } from "./scenes/pick-teams-scene";
import { HasLocation } from "./types/has-location";
import { UIManagerOptions } from './ui-manager-options';

export class UIManager {
    private readonly _conf: Phaser.Types.Core.GameConfig;
    private _game: Phaser.Game;

    constructor(options?: UIManagerOptions) {
        const size = this.getSize(options?.parentElementId);
        this._conf = {
            type: Phaser.AUTO,
            width: options?.width || size.width,
            height: options?.height || size.height,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.NONE
            },
            backgroundColor: '#ffffff',
            parent: options?.parentElementId ?? 'playfield',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: (options?.debug) ? true : false,
                    gravity: { x: 0, y: 0 },
                }
            },
            roundPixels: true,
            scene: [PickTeamsScene, GameplayScene, OverlayScene, GameOverScene]
        };
    }

    get width(): number {
        return this.game?.canvas?.width || +this._conf.width;
    }

    get height(): number {
        return this.game?.canvas?.height || +this._conf.height;
    }

    get game(): Phaser.Game {
        return this._game;
    }

    get now(): number {
        return this.gameplayScene?.time.now;
    }

    get gameplayScene(): GameplayScene {
        return this.game.scene.getScene('gameplay-scene') as GameplayScene;
    }

    get overlayScene(): OverlayScene {
        return this.game.scene.getScene('overlay-scene') as OverlayScene;
    }

    start(): UIManager {
        this._game = new Phaser.Game(this._conf);
        this._game.events.on(Phaser.Core.Events.READY, () => this.resize());
        this._game.events.on(Phaser.Core.Events.HIDDEN, () => {
            this._game.scene.getScenes(true).forEach(s => {
                this._game.scene.pause(s);
            });
        });
        this._game.events.on(Phaser.Core.Events.VISIBLE, () => {
            this._game.scene.getScenes(false).forEach(s => {
                if (s.scene.isPaused(s)) {
                    this._game.scene.resume(s);
                }
            });
        });
        return this;
    }

    resize(): this {
        const canvas: HTMLCanvasElement = this._game?.canvas;
        if (canvas) {
            canvas.width  = 0; // allow container to collapse
            canvas.height = 0; // allow container to collapse
            canvas.style.margin = '0px';
            canvas.style.padding = '0px';
            canvas.style.width='100%';
            canvas.style.height='100%';
            const size = this.getSize();
            canvas.width  = size.width;
            canvas.height = size.height;
            this._game?.scale.resize(size.width, size.height);
        }
        this._game?.scene.getScenes(true).forEach(s => {
            if (s['resize']) {
                s['resize']();
            } else {
                s.scene.restart();
            }
        });
        return this;
    }

    destroy(): void {
        this.game?.destroy(true, true);
    }

    pointerToWorld(location: HasLocation): Phaser.Math.Vector2 {
        return this.gameplayScene?.cameras.main.getWorldPoint(location.x, location.y) || new Phaser.Math.Vector2(location.x, location.y);
    }

    getSize(parentId?: string): Size {
        let size: Size;
        try {
            const main = document.querySelector('main') as HTMLElement;
            const s = main.getBoundingClientRect();
            size = {width: s.width, height: s.height};
        } catch (e) {
            /* ignore */
        }
        if (!size) {
            const parent = document.getElementById(parentId ?? 'playfield');
            const s = parent.getBoundingClientRect();
            size = {width: s.width, height: s.height};
        }
        return size;
    }
}