import { TerrainTileManager } from "../terrain/terrain-tile-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { XY } from "../ui/types/xy";
import { WarGame } from "../war-game";
import { AbstractPhase } from "./abstract-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";
import { GameEventManager } from "../utils/game-event-manager";
import { GameMapTile } from "../terrain/game-map-tile";
import { TeamManager } from "../teams/team-manager";

export class PlacementPhase extends AbstractPhase {
    private readonly _terrainMgr: TerrainTileManager;
    private readonly _teamMgr: TeamManager;

    private _highlightedTiles: GameMapTile[];
    private _placedTeamsCount: number;
    
    constructor(evtMgr: GameEventManager, phaseMgr: PhaseManager, terrainMgr: TerrainTileManager, teamMgr: TeamManager) {
        super(evtMgr, phaseMgr);
        this._terrainMgr = terrainMgr;
        this._teamMgr = teamMgr;
        this._highlightedTiles = [];
        this._placedTeamsCount = 0;
        this._setupEventHandling();
    }
    
    override start(): this {
        this._placedTeamsCount = 0;
        return super.start();
    }

    getType(): PhaseType {
        return PhaseType.placement;
    }

    override end(): this {
        this.eventManger.unsubscribe('placement-phase');
        return super.end();
    }

    private clearHighlightedTiles(): void {
        if (this._highlightedTiles.length) {
            const tiles = this._highlightedTiles.splice(0, this._highlightedTiles.length);
            this.eventManger.notify(WarGame.EVENTS.UNHIGHLIGHT_TILES, ...tiles);
        }
    }

    private highlightTiles(tileXY: XY): void {
        this.clearHighlightedTiles();
        const pointerTile = this._terrainMgr.getTileAt(tileXY);
        if (pointerTile) {
            let teamPlayers: IPlayer[] = this.phaseManager.priorityPhase.priorityTeam.getPlayers();
            let tiles = this._terrainMgr.getTilesAround(pointerTile.xy, teamPlayers.length)
                .filter(tile => !this._terrainMgr.isTileOccupied(tile.xy));
            if (teamPlayers.length <= tiles.length) {
                this._highlightedTiles = this._highlightedTiles.concat(tiles);
                if (this._highlightedTiles.length) {
                    this.eventManger.notify(WarGame.EVENTS.HIGHLIGHT_TILES, ...this._highlightedTiles);
                }
            }
        }
    }

    private placeTeam(tileXY: XY): void {
        const pointerTile = this._terrainMgr.getTileAt(tileXY);
        if (this._highlightedTiles.includes(pointerTile)) {
            let team: Team = this.phaseManager.priorityPhase.priorityTeam;
            const players: IPlayer[] = team.getPlayers();
            if (this._highlightedTiles.length >= players.length) {
                for (var i=0; i<this._highlightedTiles.length; i++) {
                    if (i>players.length) { break; }

                    let t = this._highlightedTiles[i];
                    let p: IPlayer = players[i];
                    if (p) {
                        this._terrainMgr.setPlayerTile(p, t.xy);
                    }
                }
                this._placedTeamsCount++;
                this.clearHighlightedTiles();
                this.phaseManager.priorityPhase.nextTeam();
            }
        }
        if (this._placedTeamsCount >= this._teamMgr.teams.length) {
            this.end();
        }
    }

    private _setupEventHandling(): void {
        const owner = 'placement-phase';
        const condition = () => this.active;
        this.eventManger
            .subscribe(owner, WarGame.EVENTS.POINTER_MOVE, (tileXY: XY) => this.highlightTiles(tileXY), condition)
            // .subscribe(owner, WarGame.EVENTS.POINTER_OUT, () => this.clearHighlightedTiles(), condition)
            .subscribe(owner, WarGame.EVENTS.POINTER_DOWN, (tileXY: XY) => this.placeTeam(tileXY), condition);
    }
}
