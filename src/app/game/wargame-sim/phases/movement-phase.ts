import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { TeamManager } from "../teams/team-manager";
import { UIManager } from "../ui/ui-manager";
import { WarGame } from "../war-game";
import { IPhase } from "./i-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export class MovementPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager;
    private readonly _teamMgr: TeamManager;
    private readonly _uiMgr: UIManager;
    private readonly _moveTracker: Set<string>;
    private _active: boolean;

    private _highlightedTiles: Phaser.Tilemaps.Tile[];
    private _activePlayer: IPlayer;
    
    constructor(phaseManager: PhaseManager, teamManager: TeamManager, uiManager: UIManager) {
        this._phaseMgr = phaseManager;
        this._teamMgr = teamManager;
        this._uiMgr = uiManager;
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
        this._highlightTeam();
        return this;
    }

    skipTeam(team?: Team): IPhase {
        team = this._teamMgr?.currentTeam;
        if (team) {
            team.getPlayers().forEach((p: IPlayer) => this._moveTracker.add(p.id));
            this._teamMgr.moveNext();
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

    private _teamHasMoved(team: Team): boolean {
        let teamHasMoved: boolean = false;

        const playerMovedCount: number = Array.from(this._moveTracker.values()).filter((id: string) => {
            return this._teamMgr.playerManager.getPlayerById(id).teamId === team.id;
        }).length;
        if (playerMovedCount >= team.getPlayers().length) {
            teamHasMoved = true;
        }

        return teamHasMoved;
    }

    private _allTeamsMoved(): boolean {
        let moved: boolean = true;

        this._teamMgr.teams.forEach((t: Team) => {
            moved = moved && this._teamHasMoved(t);
        });

        return moved;
    }

    private _startEventHandling(): void {
        this._teamMgr.playerManager.on(WarGame.EVENTS.PLAYER_MOVED, this._handlePlayerMoved, this);
        this._teamMgr.on(WarGame.EVENTS.CURRENT_TEAM_CHANGED, this._handleTeamChange, this);
        this._teamMgr.playerManager.players.forEach((p: IPlayer) => {
            p?.obj.on(Phaser.Input.Events.POINTER_DOWN, this._handlePlayerDown, this);
        });
        WarGame.map?.obj.on(Phaser.Input.Events.POINTER_UP, this._handlePlayerUp, this);
    }

    private _stopEventHandling(): void {
        this._teamMgr.playerManager.off(WarGame.EVENTS.PLAYER_MOVED, this._handlePlayerMoved, this);
        this._teamMgr.off(WarGame.EVENTS.CURRENT_TEAM_CHANGED, this._handleTeamChange, this);
        this._teamMgr.playerManager.players.forEach((p: IPlayer) => {
            p?.obj.off(Phaser.Input.Events.POINTER_DOWN, this._handlePlayerDown, this);
        });
        WarGame.map?.obj.off(Phaser.Input.Events.POINTER_UP, this._handlePlayerUp, this);
    }

    private _highlightTeam(): void {
        const players: IPlayer[] = this._teamMgr.currentTeam.getPlayers()
        .filter((p: IPlayer) => !this._moveTracker.has(p.id));
        WarGame.uiMgr.scene.tweens.add({
            targets: players.map((p: IPlayer) => p.obj),
            alpha: 0.25,
            ease: 'Sine.easeOut',
            duration: 200,
            yoyo: true,
            loop: 1
        });
    }

    private _handlePlayerDown(pointer: Phaser.Input.Pointer): void {
        if (!this._activePlayer) {
            this._removeTileHighlighting();
            const world: Phaser.Math.Vector2 = this._uiMgr.pointerToWorld(pointer.x, pointer.y);
            const tile: Phaser.Tilemaps.Tile = WarGame.map.obj.getTileAtWorldXY(world.x, world.y);
            if (tile) {
                const player: IPlayer = this._teamMgr.playerManager.getPlayerAt(tile.x, tile.y);
                if (player?.teamId === this._teamMgr.currentTeam.id) {
                    this._activePlayer = player;
                }
                if (this._activePlayer) {
                    if (this._moveTracker.has(this._activePlayer.id)) return;

                    const moveTiles: Phaser.Tilemaps.Tile[] = WarGame.map.getTilesInRange(tile.x, tile.y, (this._activePlayer.stats.move) * 32)
                    .filter((tile: Phaser.Tilemaps.Tile) => !WarGame.map.isTileOccupied(tile.x, tile.y));
                    if (moveTiles?.length) {
                        this._highlightedTiles = this._highlightedTiles.concat(moveTiles);
                        for (var i=0; i<this._highlightedTiles.length; i++) {
                            this._highlightedTiles[i].alpha = 0.5;
                        }
                    }
                }
            }
        }
    }

    private _handlePlayerUp(pointer: Phaser.Input.Pointer): void {
        if (this._activePlayer) {
            const world: Phaser.Math.Vector2 = this._uiMgr.pointerToWorld(pointer.x, pointer.y);
            const tile: Phaser.Tilemaps.Tile = WarGame.map.obj.getTileAtWorldXY(world.x, world.y);
            if (tile && this._highlightedTiles.includes(tile)) {
                const playerTile: Phaser.Tilemaps.Tile = WarGame.map.obj.getTileAt(this._activePlayer.tileX, this._activePlayer.tileY);
                WarGame.map.movePlayer(playerTile.x, playerTile.y, tile.x, tile.y);
            }
            this._activePlayer = null;
        }
        this._removeTileHighlighting();
    }

    private _removeTileHighlighting(): void {
        while (this._highlightedTiles.length) {
            let tile: Phaser.Tilemaps.Tile = this._highlightedTiles.shift();
            tile?.clearAlpha();
        }
    }

    private _handlePlayerMoved(player: IPlayer): void {
        this._moveTracker.add(player.id);
        if (this._teamHasMoved(this._teamMgr.currentTeam)) {
            this._teamMgr.moveNext();
        }
        this._highlightTeam();
    }

    private _handleTeamChange(team?: Team): void {
        if (this._allTeamsMoved()) {
            this._complete();
        } else {
            this._highlightTeam();
        }
    }
}
