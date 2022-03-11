import { HasGameObject } from "../interfaces/has-game-object";
import { Rand } from "../utils/rand";
import { WarGame } from "../war-game";
import { IPlayer } from "./i-player";
import { PlayerOptions } from "./player-options";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";
import { PlayerSpritesheetMapping } from "./player-spritesheet-mappings";

export class Player implements IPlayer, HasGameObject<Phaser.GameObjects.Sprite> {
    readonly id: string;
    private readonly _name: string;
    private readonly _stats: PlayerStats;
    private readonly _spriteMapping: PlayerSpritesheetMapping;
    private _scene: Phaser.Scene;
    private _tileX: number;
    private _tileY: number;
    private _teamId: string;
    private _remainingWounds: number;
    private _effects: Set<PlayerStatusEffect>;
    private _obj: Phaser.GameObjects.Sprite;

    constructor(options: PlayerOptions) {
        this.id = Rand.guid();
        this._scene = options.scene || WarGame.uiMgr.game.scene.getScenes(true)?.shift();
        this._name = options.name;
        this._stats = options.stats;
        this._spriteMapping = options.spriteMapping;
        this._remainingWounds = this._stats.wounds;
        this._effects = new Set<PlayerStatusEffect>();
    }

    get name(): string {
        return this._name;
    }

    get tileX(): number {
        return this._tileX;
    }

    get tileY(): number {
        return this._tileY;
    }

    get obj(): Phaser.GameObjects.Sprite {
        if (!this._obj) {
            this._createGameObject();
        }
        return this._obj;
    }

    setTile(x: number, y: number): this {
        this._tileX = x;
        this._tileY = y;
        let worldPos: Phaser.Math.Vector2 = WarGame.map.getTileWorldCentre(x, y);
        if (worldPos) {
            console.info(`adding player ${this.id} to map at: ${x},${y} - world: ${worldPos.x},${worldPos.y}`);
            this.obj.setPosition(worldPos.x, worldPos.y);
            this.obj.setVisible(true);
        }
        return this;
    }

    get teamId(): string {
        return this._teamId;
    }

    setTeamId(id: string): this {
        this._teamId = id;
        return this;
    }

    get stats(): PlayerStats {
        return this._stats;
    }

    wound(): this {
        this._remainingWounds--;
        return this;
    }

    get statusEffects(): PlayerStatusEffect[] {
        return Array.from(this._effects.values());
    }

    setEffects(...effects: PlayerStatusEffect[]): this {
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                this._effects.add(effects[i]);
            }
        }
        return this;
    }

    removeEffects(...effects: PlayerStatusEffect[]): this {
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                if (this._effects.has(effects[i])) {
                    this._effects.delete(effects[i]);
                }
            }
        }
        return this;
    }

    isDead(): boolean {
        return this._remainingWounds <= 0;
    }

    isBattling(): boolean {
        return WarGame.map.getPlayersInRange(this._tileX, this._tileY, 1).filter((player: IPlayer) => {
            if (player.id !== this.id && WarGame.playerMgr.areEnemies(this, player)) { return true; }
        }).length > 0;
    }

    setScene(scene: Phaser.Scene): this {
        if (scene) {
            this.obj.destroy();
            this._obj = null;
            this._scene = scene;
        }
        return this;
    }

    destroy(): void {
        if (this._obj) {
            this.obj.destroy();
        }
    }

    private _createGameObject(): void {
        this._obj = this._scene.add.sprite(0, 0, 'players', this._spriteMapping.front);
        this._obj.setOrigin(0.5);
        this._obj.setDepth(WarGame.DEPTH.PLAYER);
        this.obj.setVisible(false); // set visible when added to map
    }
}
