import { MapManager } from "../map/map-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { XY } from "../ui/types/xy";
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
        this._setupEventHandling();
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

    clearHighlightedTiles(): void {
        while (this._highlightedTiles?.length) {
            let tile: Phaser.Tilemaps.Tile = this._highlightedTiles.shift();
            tile?.clearAlpha();
        }
    }

    highlightTiles(tileXY: XY): void {
        this.clearHighlightedTiles();
        const pointerTile: Phaser.Tilemaps.Tile = this._mapMgr.map.getTileAt(tileXY);
        if (pointerTile) {
            let teamPlayers: IPlayer[] = this._phaseMgr.priorityPhase.priorityTeam.getPlayers();
            let tiles: Phaser.Tilemaps.Tile[] = this._mapMgr.map.getTilesAround(pointerTile, teamPlayers.length)
                .filter((tile: Phaser.Tilemaps.Tile) => !this._mapMgr.map.isTileOccupied(tile));
            if (teamPlayers.length <= tiles.length) {
                this._highlightedTiles = this._highlightedTiles.concat(tiles);
                for (var i=0; i<this._highlightedTiles.length; i++) {
                    this._highlightedTiles[i].alpha = 0.5;
                }
            }
        }
    }

    placeTeam(tileXY: XY): void {
        const pointerTile: Phaser.Tilemaps.Tile = this._mapMgr.map.getTileAt(tileXY);
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
                        this._mapMgr.map.setPlayerTile(p, t);
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

    private _setupEventHandling(): void {
        const owner = 'placement-phase';
        const condition = () => WarGame.phaseMgr.placementPhase.active;
        WarGame.evtMgr
            .subscribe(owner, WarGame.EVENTS.POINTER_MOVE, (tileXY: XY) => WarGame.phaseMgr.placementPhase.highlightTiles(tileXY), condition)
            .subscribe(owner, WarGame.EVENTS.POINTER_OUT, () => WarGame.phaseMgr.placementPhase.clearHighlightedTiles(), condition)
            .subscribe(owner, WarGame.EVENTS.POINTER_DOWN, (tileXY: XY) => WarGame.phaseMgr.placementPhase.placeTeam(tileXY), condition);
    }
}
