import { TerrainTileManager } from "../terrain/terrain-tile-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { XY } from "../ui/types/xy";
import { GameEventManager } from "../utils/game-event-manager";
import { WarGame } from "../war-game";
import { AbstractPhase } from "./abstract-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";
import { TeamManager } from "../teams/team-manager";
import { GameMapTile } from "../terrain/game-map-tile";

export class MovementPhase extends AbstractPhase {
    readonly terrainManager: TerrainTileManager;
    readonly teamManager: TeamManager;
    
    private readonly _moveTracker: Set<string>;
    private _highlightedTiles: GameMapTile[];
    private _activePlayer: IPlayer;
    
    constructor(evtMgr: GameEventManager, phaseMgr: PhaseManager, terrainMgr: TerrainTileManager, teamMgr: TeamManager) {
        super(evtMgr, phaseMgr);
        this.terrainManager = terrainMgr;
        this.teamManager = teamMgr;
        this._moveTracker = new Set<string>();
        this._highlightedTiles = [];
        this._startEventHandling();
    }
    
    override start(): this {
        this._activePlayer = null;
        this._moveTracker.clear();
        this._highlightTeam(this.phaseManager.priorityPhase.priorityTeam);
        return super.start();
    }

    getType(): PhaseType {
        return PhaseType.movement;
    }

    teamHasMoved(team: Team): boolean {
        let teamHasMoved: boolean = false;

        const playerMovedCount: number = Array.from(this._moveTracker.values()).filter((id: string) => {
            return this.teamManager.playerManager.getPlayerById(id).teamId === team.id;
        }).length;
        if (playerMovedCount >= team.getPlayers().length) {
            teamHasMoved = true;
        }

        return teamHasMoved;
    }

    allTeamsMoved(): boolean {
        let moved: boolean = true;

        this.teamManager.teams.forEach((t: Team) => {
            moved = moved && this.teamHasMoved(t);
        });

        return moved;
    }

    hasEnemiesBlockingMovement(player: IPlayer): boolean {
        return this.getEnemiesBlockingMovement(player).length > 0;
    }

    getEnemiesBlockingMovement(player: IPlayer): IPlayer[] {
        const enemiesInRange: IPlayer[] = this.terrainManager
            .getPlayersInRange(player.tileXY, 1)
            .filter((p: IPlayer) => !p.isDead() && p.isEnemy(player));
        return enemiesInRange;
    }

    private _startEventHandling(): void {
        const owner = 'movement-phase';
        const condition = () => this.active;
        this.eventManger
            .subscribe(owner, WarGame.EVENTS.PLAYER_MOVED, (p: IPlayer) => this._handlePlayerMoved(p), condition)
            .subscribe(owner, WarGame.EVENTS.SWITCH_TEAMS, (t: Team) => this._handleTeamChange(t), condition)
            .subscribe(owner, WarGame.EVENTS.POINTER_DOWN, (tileXY: XY) => this._handlePlayerDown(tileXY), condition)
            .subscribe(owner, WarGame.EVENTS.POINTER_UP, (tileXY: XY) => this._handleMapUp(tileXY), condition);
    }

    private _highlightTeam(team: Team): void {
        const notMovedPlayers: IPlayer[] = team.getPlayers()
            .filter((p: IPlayer) => !this._moveTracker.has(p.id));
        const notBlockedPlayers = notMovedPlayers
            .filter((p: IPlayer) => this.terrainManager.getPlayersInRange(p.tileXY, 1)
                .filter((o: IPlayer) => p.isEnemy(o)).length === 0);
        if (notBlockedPlayers.length > 0) {
            this.eventManger.notify(WarGame.EVENTS.HIGHLIGHT_PLAYERS, ...notBlockedPlayers);
        } else {
            this.phaseManager.priorityPhase.nextTeam();
        }
    }

    private _highlightTiles(player: IPlayer): void {
        this._removeTileHighlighting();
        const mover: IPlayer = player;
        if (mover) {
            const tilesInRange = this.terrainManager
                .getTilesInRange(mover.tileXY, mover.stats.move)
                .filter(t => !this.terrainManager.isTileOccupied(t.xy));
            if (tilesInRange.length > 0) {
                this._highlightedTiles = tilesInRange;
            }
            if (this._highlightedTiles.length) {
                this.eventManger.notify(WarGame.EVENTS.HIGHLIGHT_TILES, ...this._highlightedTiles);
            }
        }
    }

    private _handlePlayerDown(tileXY: XY): void {
        const tile = this.terrainManager.getTileAt(tileXY);
        if (tile) {
            const player: IPlayer = this.teamManager.playerManager.getPlayerAt(tile.xy);
            if (!player) return; // no player selected
            if (this._moveTracker.has(player.id)) return; // player has already moved so don't move again
            if (player?.teamId === this.phaseManager.priorityPhase.priorityTeam.id) {
                if (!this.hasEnemiesBlockingMovement(player)) {
                    this._activePlayer = player;
                    this._highlightTiles(this._activePlayer);
                }
            }
        }
    }

    private _handleMapUp(tileXY: XY): void {
        const mover: IPlayer = this._activePlayer;
        if (mover) {
            const tile = this.terrainManager.getTileAt(tileXY);
            if (tile && this._highlightedTiles.includes(tile)) {
                this._removeTileHighlighting();
                this.terrainManager.setPlayerTile(mover, tile.xy);
            }
        }
    }

    private _removeTileHighlighting(): void {
        if (this._highlightedTiles.length) {
            const tiles = this._highlightedTiles.splice(0, this._highlightedTiles.length);
            this.eventManger.notify(WarGame.EVENTS.UNHIGHLIGHT_TILES, ...tiles);
        }
    }

    private _handlePlayerMoved(player: IPlayer): void {
        this._moveTracker.add(player.id);
        if (this.teamHasMoved(this.phaseManager.priorityPhase.priorityTeam)) {
            this.phaseManager.priorityPhase.nextTeam();
        }
        this._highlightTeam(this.phaseManager.priorityPhase.priorityTeam);
    }

    private _handleTeamChange(team?: Team): void {
        if (this.allTeamsMoved()) {
            this.end();
        } else {
            this._highlightTeam(team);
        }
    }
}
