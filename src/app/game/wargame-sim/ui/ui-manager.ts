import * as Phaser from "phaser";
import { HasGameObject } from "../interfaces/has-game-object";
import { Size } from "../interfaces/size";
import { GameBoard } from "./game-board/game-board";
import { GameOverScene } from "./scenes/game-over-scene";
import { GameplayScene, GameplaySceneConfig } from './scenes/gameplay-scene';
import { OverlayScene, OverlaySceneConfig } from "./scenes/overlay-scene";
import { PickTeamsScene } from "./scenes/pick-teams-scene";
import { XY } from "./types/xy";
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
        return this.game.scene.getScene(GameplaySceneConfig.key) as GameplayScene;
    }

    get overlayScene(): OverlayScene {
        return this.game.scene.getScene(OverlaySceneConfig.key) as OverlayScene;
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

    pointerToWorld(location: XY): Phaser.Math.Vector2 {
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

    /**
     * causes the passed in `hasGameObjs` elements to flicker between 1 and 0.25 alpha
     * for the `Math.ceil` of the duration divided by 200 milliseconds
     * @param hasGameObjs an array of objects implementing `HasGameObject` interface
     * @param duration the number of milliseconds to flicker @default 400
     */
    flicker(hasGameObjs: Array<HasGameObject<any>>, duration: number = 400): void {
        const loops = Math.ceil(duration / 200) - 1;
        const scenes = new Set<Phaser.Scene>(hasGameObjs.map(o => o.obj.scene));
        for (let scene of scenes.values()) {
            const sceneObjects = hasGameObjs.filter(o => o.obj.scene === scene);
            scene.tweens.add({
                targets: sceneObjects.map(o => o.obj),
                alpha: 0.25,
                ease: 'Sine.easeOut',
                duration: 200,
                yoyo: true,
                loop: loops
            });
        }
    }

    moveTo(hasGameObjs: Array<HasGameObject<any>>, location: XY, duration: number = 500, onComplete: (tween?: Phaser.Tweens.Tween, targets?: Array<any>, ...params: Array<any>) => void = () => null): void {
        const scenes = new Set<Phaser.Scene>(hasGameObjs.map(o => o.obj.scene));
        for (let scene of scenes.values()) {
            const sceneObjects = hasGameObjs.filter(o => o.obj.scene === scene);
            scene.tweens.add({
                targets: sceneObjects.map(o => o.obj),
                x: location.x,
                y: location.y,
                ease: 'Sine.easeOut',
                duration: duration,
                onComplete: onComplete
            });
        }
    }
}