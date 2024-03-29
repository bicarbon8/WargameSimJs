import { MapManager } from "../map/map-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { WarGame } from "../war-game";
import { IPhase } from "./i-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export class MovementPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager;
    private readonly _mapMgr: MapManager;
    private readonly _moveTracker: Set<string>;
    private _active: boolean;

    private _highlightedTiles: Phaser.Tilemaps.Tile[];
    private _activePlayer: IPlayer;
    
    constructor(phaseManager: PhaseManager, mapManager: MapManager) {
        this._phaseMgr = phaseManager;
        this._mapMgr = mapManager;
        this._moveTracker = new Set<string>();
        this._highlightedTiles = [];
    }

    get active(): boolean {
        return this._active;
    }
    
    start(): IPhase {
        this.reset();
        this._active = true;
        this._phaseMgr.emit(WarGame.EVENTS.PHASE_START, this);
        this._startEventHandling();
        this._highlightTeam(this._phaseMgr.priorityPhase.priorityTeam);
        return this;
    }

    nextTeam(team?: Team): IPhase {
        team = team || this._phaseMgr.priorityPhase.priorityTeam;
        if (team) {
            team.getPlayers().forEach((p: IPlayer) => this._moveTracker.add(p.id));
            this._phaseMgr.priorityPhase.nextTeam();
            if (this.allTeamsMoved()) {
                this._complete();
            } else {
                this._highlightTeam(this._phaseMgr.priorityPhase.priorityTeam);
            }
        }
        return this;
    }

    reset(): IPhase {
        this._active = false;
        this._activePlayer = null;
        this._moveTracker.clear();
        return this;
    }

    getType(): PhaseType {
        return PhaseType.movement;
    }

    getName(): string {
        return PhaseType[this.getType()];
    }

    private _complete(): void {
        this._stopEventHandling();
        this._active = false;
        this._phaseMgr.emit(WarGame.EVENTS.PHASE_END, this);
    }

    teamHasMoved(team: Team): boolean {
        let teamHasMoved: boolean = false;

        const playerMovedCount: number = Array.from(this._moveTracker.values()).filter((id: string) => {
            return this._mapMgr.teamManager.playerManager.getPlayerById(id).teamId === team.id;
        }).length;
        if (playerMovedCount >= team.getPlayers().length) {
            teamHasMoved = true;
        }

        return teamHasMoved;
    }

    allTeamsMoved(): boolean {
        let moved: boolean = true;

        this._mapMgr.teamManager.teams.forEach((t: Team) => {
            moved = moved && this.teamHasMoved(t);
        });

        return moved;
    }

    hasEnemiesBlockingMovement(player: IPlayer): boolean {
        return this.getEnemiesBlockingMovement(player).length > 0;
    }

    getEnemiesBlockingMovement(player: IPlayer): IPlayer[] {
        const enemiesInRange: IPlayer[] = this._mapMgr.map
        .getPlayersInRange(player.tileX, player.tileY, 32)
        .filter((p: IPlayer) => !p.isDead() && p.isEnemy(player));
        return enemiesInRange;
    }

    private _startEventHandling(): void {
        this._mapMgr.teamManager.playerManager.on(WarGame.EVENTS.PLAYER_MOVED, this._handlePlayerMoved, this);
        this._mapMgr.teamManager.on(WarGame.EVENTS.TEAM_CHANGED, this._handleTeamChange, this);
        this._mapMgr.teamManager.playerManager.players.forEach((p: IPlayer) => {
            p?.obj.on(Phaser.Input.Events.POINTER_DOWN, this._handlePlayerDown, this);
        });
        this._mapMgr.map?.obj.on(Phaser.Input.Events.POINTER_UP, this._handleMapUp, this);
    }

    private _stopEventHandling(): void {
        this._mapMgr.teamManager.playerManager.off(WarGame.EVENTS.PLAYER_MOVED, this._handlePlayerMoved, this);
        this._mapMgr.teamManager.off(WarGame.EVENTS.TEAM_CHANGED, this._handleTeamChange, this);
        this._mapMgr.teamManager.playerManager.players.forEach((p: IPlayer) => {
            p?.obj.off(Phaser.Input.Events.POINTER_DOWN, this._handlePlayerDown, this);
        });
        this._mapMgr.map?.obj.off(Phaser.Input.Events.POINTER_UP, this._handleMapUp, this);
    }

    private _highlightTeam(team: Team): void {
        const players: IPlayer[] = team.getPlayers()
        .filter((p: IPlayer) => !this._moveTracker.has(p.id))
        .filter((p: IPlayer) => this._mapMgr.map.getPlayersInRange(p.tileX, p.tileY, 32)
            .filter((o: IPlayer) => p.isEnemy(o)).length === 0);
        if (players.length > 0) {
            WarGame.uiMgr.gameplayScene.tweens.add({
                targets: players.map((p: IPlayer) => p.obj),
                alpha: 0.25,
                ease: 'Sine.easeOut',
                duration: 200,
                yoyo: true,
                loop: 1
            });
        } else {
            this.nextTeam();
        }
    }

    private _highlightTiles(player: IPlayer): void {
        this._removeTileHighlighting();
        const mover: IPlayer = player;
        if (mover) {
            const tilesInRange: Phaser.Tilemaps.Tile[] = this._mapMgr.map
            .getTilesInRange(mover.tileX, mover.tileY, mover.stats.move * 32)
            .filter((t: Phaser.Tilemaps.Tile) => !this._mapMgr.map.isTileOccupied(t.x, t.y));
            if (tilesInRange.length > 0) {
                this._highlightedTiles = this._highlightedTiles.concat(tilesInRange);
            }
            for (var i=0; i<this._highlightedTiles.length; i++) {
                this._highlightedTiles[i].alpha = 0.5;
            }
        }
    }

    private _handlePlayerDown(pointer: Phaser.Input.Pointer): void {
        this._activePlayer = null;
        const tile: Phaser.Tilemaps.Tile = this._mapMgr.map.getTileUnderPointer(pointer);
        if (tile) {
            const player: IPlayer = this._mapMgr.teamManager.playerManager.getPlayerAt(tile.x, tile.y);
            if (this._moveTracker.has(player.id)) return; // player has already moved so don't move again
            if (player?.teamId === this._phaseMgr.priorityPhase.priorityTeam.id) {
                if (!this.hasEnemiesBlockingMovement(player)) {
                    this._activePlayer = player;
                }
            }
        }
        this._highlightTiles(this._activePlayer);
    }

    private _handleMapUp(pointer: Phaser.Input.Pointer): void {
        const mover: IPlayer = this._activePlayer;
        if (mover) {
            const tile: Phaser.Tilemaps.Tile = this._mapMgr.map.getTileUnderPointer(pointer);
            if (tile && this._highlightedTiles.includes(tile)) {
                this._removeTileHighlighting();
                this._mapMgr.map.movePlayer(mover.tileX, mover.tileY, tile.x, tile.y);
            }
        }
    }

    private _removeTileHighlighting(): void {
        while (this._highlightedTiles.length) {
            let tile: Phaser.Tilemaps.Tile = this._highlightedTiles.shift();
            tile?.clearAlpha();
        }
    }

    private _handlePlayerMoved(player: IPlayer): void {
        this._moveTracker.add(player.id);
        if (this.teamHasMoved(this._phaseMgr.priorityPhase.priorityTeam)) {
            this._phaseMgr.priorityPhase.nextTeam();
        }
        this._highlightTeam(this._phaseMgr.priorityPhase.priorityTeam);
    }

    private _handleTeamChange(team?: Team): void {
        if (this.allTeamsMoved()) {
            this._complete();
        } else {
            this._highlightTeam(team);
        }
    }
}
