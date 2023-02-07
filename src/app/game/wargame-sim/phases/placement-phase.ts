import { MapManager } from "../map/map-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { WarGame } from "../war-game";
import { IPhase } from "./i-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export class PlacementPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager;
    private readonly _mapMgr: MapManager;
    private _active: boolean;

    private _highlightedTiles: Phaser.Tilemaps.Tile[];
    private _placedTeamsCount: number;
    
    constructor(phaseManager: PhaseManager, mapManager: MapManager) {
        this._phaseMgr = phaseManager;
        this._mapMgr = mapManager;
        this._highlightedTiles = [];
        this._placedTeamsCount = 0;
    }

    get active(): boolean {
        return this._active;
    }
    
    start(): IPhase {
        this.reset();
        this._active = true;
        WarGame.evtMgr.notify(WarGame.EVENTS.PHASE_START, this);
        return this;
    }

    nextTeam(team?: Team): IPhase {
        /** does nothing */
        return this;
    }

    reset(): IPhase {
        this._active = false;
        this._placedTeamsCount = 0;
        return this;
    }

    getType(): PhaseType {
        return PhaseType.placement;
    }

    getName(): string {
        return PhaseType[this.getType()];
    }

    complete(): void {
        this._active = false;
        WarGame.evtMgr.notify(WarGame.EVENTS.PHASE_END, this);
    }

    clearHighlightedTiles(pointer?: Phaser.Input.Pointer): void {
        while (this._highlightedTiles?.length) {
            let tile: Phaser.Tilemaps.Tile = this._highlightedTiles.shift();
            tile?.clearAlpha();
        }
    }

    highlightTiles(pointer: Phaser.Input.Pointer): void {
        this.clearHighlightedTiles();
        const pointerTile: Phaser.Tilemaps.Tile = this._mapMgr.map.getTileUnderPointer(pointer);
        if (pointerTile) {
            let teamPlayers: IPlayer[] = this._phaseMgr.priorityPhase.priorityTeam.getPlayers();
            let tiles: Phaser.Tilemaps.Tile[] = this._mapMgr.map.getTilesAround(pointerTile.x, pointerTile.y, teamPlayers.length)
                .filter((tile: Phaser.Tilemaps.Tile) => !this._mapMgr.map.isTileOccupied(tile.x, tile.y));
            if (teamPlayers.length <= tiles.length) {
                this._highlightedTiles = this._highlightedTiles.concat(tiles);
                for (var i=0; i<this._highlightedTiles.length; i++) {
                    this._highlightedTiles[i].alpha = 0.5;
                }
            }
        }
    }

    placeTeam(pointer: Phaser.Input.Pointer): void {
        const pointerTile: Phaser.Tilemaps.Tile = this._mapMgr.map.getTileUnderPointer(pointer);
        const highlightedTiles: Phaser.Tilemaps.Tile[] = this._highlightedTiles;
        if (highlightedTiles.includes(pointerTile)) {
            let team: Team = this._phaseMgr.priorityPhase.priorityTeam;
            const players: IPlayer[] = team.getPlayers();
            if (highlightedTiles.length >= players.length) {
                for (var i=0; i<highlightedTiles.length; i++) {
                    if (i>players.length) { break; }

                    let t: Phaser.Tilemaps.Tile = highlightedTiles[i];
                    let p: IPlayer = players[i];
                    if (p) {
                        this._mapMgr.map.addPlayer(p, t.x, t.y);
                    }
                }
                this._placedTeamsCount++;
                this.clearHighlightedTiles();
                this._phaseMgr.priorityPhase.nextTeam();
            }
        }
        if (this._placedTeamsCount >= this._mapMgr.teamManager.teams.length) {
            this.complete();
        }
    }
}
