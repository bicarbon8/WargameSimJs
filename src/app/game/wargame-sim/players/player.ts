import { Rand } from "../utils/rand";
import { WarGame } from "../war-game";
import { IPlayer } from "./i-player";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";
import { PlayerManager } from "./player-manager";
import { XY } from "../ui/types/xy";
import { PlayerType } from "./player-type";

export type PlayerOptions = {
    name: PlayerType;
    stats: PlayerStats;
    playerManager?: PlayerManager;
};

export class Player implements IPlayer {
    readonly id: string;
    private readonly _playerMgr: PlayerManager;
    private readonly _name: PlayerType;
    private readonly _stats: PlayerStats;
    private _tileXY: XY;
    private _teamId: string;
    private _remainingWounds: number;
    private _effects: Set<PlayerStatusEffect>;

    constructor(options: PlayerOptions) {
        this.id = Rand.guid();
        this._playerMgr = options.playerManager;
        this._name = options.name;
        this._stats = options.stats;
        this._remainingWounds = this._stats.wounds;
        this._effects = new Set<PlayerStatusEffect>();
    }

    get name(): PlayerType {
        return this._name;
    }

    get tileXY(): XY {
        return this._tileXY;
    }

    setTile(tileXY: XY): this {
        if (tileXY) {
            this._tileXY = tileXY;
            WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_MOVED, this);
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
        WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_WOUNDED, this);
        if (this.isDead()) {
            WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_DIED, this);
        }
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

    isAlly(player: IPlayer): boolean {
        return this.teamId === player?.teamId;
    }

    isEnemy(player: IPlayer): boolean {
        return !this.isAlly(player);
    }

    isBattling(): boolean {
        return WarGame.terrainMgr.getPlayersInRange(this._tileXY, 1).filter((player: IPlayer) => {
            if (player.id !== this.id && WarGame.playerMgr.areEnemies(this, player)) { return true; }
        }).length > 0;
    }
}
