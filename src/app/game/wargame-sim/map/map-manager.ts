import { TeamManager } from "../teams/team-manager";
import { Rand } from "../utils/rand";
import { WarGame } from "../war-game";
import { GameMap } from "./game-map";
import { GameMapOptions } from "./game-map-options";

export class MapManager {
    private readonly _teamMgr: TeamManager;
    private _map: GameMap;

    constructor(teamMgr: TeamManager, map?: GameMap) {
        this._teamMgr = teamMgr;
        this._map = map;
    }
    
    get map(): GameMap {
        return this._map;
    }

    get teamManager(): TeamManager {
        return this._teamMgr;
    }

    createMap(scene: Phaser.Scene, options?: GameMapOptions): GameMap {
        const mult: number = this.teamManager.teams.length;
        const defaultOpts = {
            mapManager: this,
            scene: scene,
            width: mult * 20,
            height: mult * 20,
            roomMaxWidth: 20,
            roomMaxHeight: 20,
            roomMinWidth: 10,
            roomMinHeight: 10,
            maxRooms: mult,
            seed: Rand.getStringFrom(),
            layerDepth: WarGame.DEPTH.PLAYER, 
            ...options
        };
        this._map = new GameMap(defaultOpts);
        return this._map;
    }

    destroy(): void {
        this.map?.obj?.destroy(true);
    }
}