import { HasGameObject } from "../interfaces/has-game-object";
import { Constants } from "../utils/constants";
import { Rand } from "../utils/rand";
import { WarGame } from "../war-game";
import { IPlayer } from "./i-player";
import { PlayerOptions } from "./player-options";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";
import { PlayerSpritesheetMapping } from "./player-types/player-spritesheet-mappings";

export abstract class BasePlayer implements IPlayer, HasGameObject<Phaser.GameObjects.Sprite> {
    readonly id: number;
    private readonly _name: string;
    private readonly _stats: PlayerStats;
    private readonly _spriteMapping: PlayerSpritesheetMapping;
    private _scene: Phaser.Scene;
    private _tileX: number;
    private _tileY: number;
    private _teamId: number;
    private _remainingWounds: number;
    private _effects: Set<PlayerStatusEffect>;
    private _obj: Phaser.GameObjects.Sprite;

    constructor(options: PlayerOptions) {
        this.id = Rand.getId();
        this._scene = options.scene;
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

    setTile(x: number, y: number): void {
        this._tileX = x;
        this._tileY = y;
        let worldPos: Phaser.Math.Vector2 = WarGame.map.getTileWorldCentre(x, y);
        if (worldPos) {
            console.info(`adding player ${this.id} to map at: ${x},${y} - world: ${worldPos.x},${worldPos.y}`);
            this.obj.setPosition(worldPos.x, worldPos.y);
            this.obj.setVisible(true);
        }
    }

    get teamId(): number {
        return this._teamId;
    }

    setTeamId(id: number): void {
        this._teamId = id;
    }

    get stats(): PlayerStats {
        return this._stats;
    }

    wound(): void {
        this._remainingWounds--;
    }

    get statusEffects(): PlayerStatusEffect[] {
        return Array.from(this._effects.values());
    }

    setEffects(...effects: PlayerStatusEffect[]): void {
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                this._effects.add(effects[i]);
            }
        }
    }

    removeEffects(...effects: PlayerStatusEffect[]): void {
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                if (this._effects.has(effects[i])) {
                    this._effects.delete(effects[i]);
                }
            }
        }
    }

    isDead(): boolean {
        return this._remainingWounds <= 0;
    }

    isBattling(): boolean {
        return WarGame.map.getPlayersInRange(this._tileX, this._tileY, 1).filter((player: IPlayer) => {
            if (player.id !== this.id && WarGame.players.areEnemies(this, player)) { return true; }
        }).length > 0;
    }

    setScene(scene: Phaser.Scene): void {
        if (scene) {
            this.obj.destroy();
            this._obj = null;
            this._scene = scene;
        }
    }

    private _createGameObject(): void {
        this._obj = this._scene.add.sprite(0, 0, 'players', this._spriteMapping.front);
        this._obj.setOrigin(0.5);
        this._obj.setDepth(Constants.DEPTH_PLAYER);
        this.obj.setVisible(false); // set visible when added to map
    }
}
