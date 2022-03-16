import { BattleManager } from "../battles/battle-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { WarGame } from "../war-game";
import { IPhase } from "./i-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export class ShootingPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager;
    private readonly _battleMgr: BattleManager;
    private readonly _shootTracker: Set<string>;
    private _active: boolean;

    private _inRangeEnemies: IPlayer[];
    private _highlightedTiles: Phaser.Tilemaps.Tile[];
    private _activePlayer: IPlayer;
    
    constructor(phaseManager: PhaseManager, battleManager: BattleManager) {
        this._phaseMgr = phaseManager;
        this._battleMgr = battleManager;
        this._shootTracker = new Set<string>();
        this._highlightedTiles = [];
        this._inRangeEnemies = [];
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

    nextTeam(team?: Team): IPhase {
        team = this._battleMgr?.teamManager?.teams[this._phaseMgr.priorityPhase.currentPriority];
        if (team) {
            team.getPlayers().forEach((p: IPlayer) => this._shootTracker.add(p.id));
            this._phaseMgr.priorityPhase.nextTeam();
        }
        return this;
    }

    reset(): IPhase {
        this._active = false;
        this._activePlayer = null;
        this._shootTracker.clear();
        return this;
    }

    getType(): PhaseType {
        return PhaseType.shooting;
    }

    getName(): string {
        return PhaseType[this.getType()];
    }

    private _complete(): void {
        this._stopEventHandling();
        this._active = false;
        this._phaseMgr.emit(WarGame.EVENTS.PHASE_END, this);
    }

    private _teamHasShot(team: Team): boolean {
        let teamHasShot: boolean = false;

        const playerMovedCount: number = Array.from(this._shootTracker.values()).filter((id: string) => {
            return this._battleMgr.teamManager.playerManager.getPlayerById(id)?.teamId === team.id;
        }).length;
        if (playerMovedCount >= team.getPlayers().length) {
            teamHasShot = true;
        }

        return teamHasShot;
    }

    private _allTeamsShot(): boolean {
        let shot: boolean = true;

        this._battleMgr.teamManager.teams.forEach((t: Team) => {
            shot = shot && this._teamHasShot(t);
        });

        return shot;
    }

    private _startEventHandling(): void {
        this._battleMgr.on(WarGame.EVENTS.PLAYER_FIRED_SHOT, this._handlePlayerShot, this);
        this._battleMgr.on(WarGame.EVENTS.PLAYER_MISFIRED_SHOT, this._handlePlayerShot, this);
        this._battleMgr.teamManager.on(WarGame.EVENTS.TEAM_CHANGED, this._handleTeamChange, this);
        this._battleMgr.teamManager.playerManager.players.forEach((p: IPlayer) => {
            p?.obj.on(Phaser.Input.Events.POINTER_UP, this._handlePlayerUp, this);
        });
    }

    private _stopEventHandling(): void {
        this._battleMgr.off(WarGame.EVENTS.PLAYER_FIRED_SHOT, this._handlePlayerShot, this);
        this._battleMgr.off(WarGame.EVENTS.PLAYER_MISFIRED_SHOT, this._handlePlayerShot, this);
        this._battleMgr.teamManager.off(WarGame.EVENTS.TEAM_CHANGED, this._handleTeamChange, this);
        this._battleMgr.teamManager.playerManager.players.forEach((p: IPlayer) => {
            p?.obj.off(Phaser.Input.Events.POINTER_UP, this._handlePlayerUp, this);
        });
    }

    private _highlightTeam(): void {
        const players: IPlayer[] = this._phaseMgr.priorityPhase.priorityTeam.getPlayers()
        .filter((p: IPlayer) => !this._shootTracker.has(p.id));
        WarGame.uiMgr.scene.tweens.add({
            targets: players.map((p: IPlayer) => p.obj),
            alpha: 0.25,
            ease: 'Sine.easeOut',
            duration: 200,
            yoyo: true,
            loop: 1
        });
    }

    private _handlePlayerUp(pointer: Phaser.Input.Pointer): void {
        if (this._activePlayer) {
            const world: Phaser.Math.Vector2 = this._battleMgr.uiManager.pointerToWorld(pointer.x, pointer.y);
            const tile: Phaser.Tilemaps.Tile = WarGame.map.obj.getTileAtWorldXY(world.x, world.y);
            if (tile) {
                const player: IPlayer = this._battleMgr.teamManager.playerManager.getPlayerAt(tile.x, tile.y);
                if (player) {
                    if (this._inRangeEnemies.includes(player)) {
                        this._battleMgr.runRangedBattle({attackers: [this._activePlayer], defenders: [player]});
                        this._shootTracker.add(this._activePlayer.id);
                        this._activePlayer = null;
                    } else if (player.id === this._activePlayer.id) {
                        this._activePlayer = null;
                    }
                }
            }
            this._activePlayer = null;
            this._removeTileHighlighting();
        } else {
            this._removeTileHighlighting();
            const world: Phaser.Math.Vector2 = this._battleMgr.uiManager.pointerToWorld(pointer.x, pointer.y);
            const tile: Phaser.Tilemaps.Tile = WarGame.map.obj.getTileAtWorldXY(world.x, world.y);
            if (tile) {
                const player: IPlayer = this._battleMgr.teamManager.playerManager.getPlayerAt(tile.x, tile.y);
                if (player?.teamId === this._phaseMgr.priorityPhase.priorityTeam.id) {
                    let nearbyEnemies: IPlayer[] = WarGame.map.getPlayersInRange(player.tileX, player.tileY, 32)
                    .filter((p: IPlayer) => WarGame.playerMgr.areEnemies(player, p));
                    if (nearbyEnemies.length === 0) {
                        this._activePlayer = player;
                    }
                }
                if (this._activePlayer) {
                    if (this._shootTracker.has(this._activePlayer.id)) return;

                    const tilesInRange: Phaser.Tilemaps.Tile[] = WarGame.map.getTilesInRange(tile.x, tile.y, (this._activePlayer.stats.move) * 32);
                    const enemiesInRange: IPlayer[] = tilesInRange
                    .map((tile: Phaser.Tilemaps.Tile) => WarGame.playerMgr.getPlayerAt(tile.x, tile.y))
                    .filter((p: IPlayer) => WarGame.playerMgr.areEnemies(p, this._activePlayer));
                    this._inRangeEnemies = this._inRangeEnemies.concat(enemiesInRange);
                    if (tilesInRange?.length) {
                        this._highlightedTiles = this._highlightedTiles.concat(tilesInRange);
                        for (var i=0; i<this._highlightedTiles.length; i++) {
                            this._highlightedTiles[i].alpha = 0.5;
                        }
                    } else {
                        this._shootTracker.add(this._activePlayer.id);
                        this._activePlayer = null;
                    }
                }
            }
        }
    }

    private _removeTileHighlighting(): void {
        while (this._highlightedTiles.length) {
            let tile: Phaser.Tilemaps.Tile = this._highlightedTiles.shift();
            tile?.clearAlpha();
        }
    }

    private _handlePlayerShot(player: IPlayer): void {
        this._shootTracker.add(player.id);
        if (this._teamHasShot(this._phaseMgr.priorityPhase.priorityTeam)) {
            this._phaseMgr.priorityPhase.nextTeam();
        }
        this._highlightTeam();
    }

    private _handleTeamChange(team?: Team): void {
        if (this._allTeamsShot()) {
            this._complete();
        } else {
            this._highlightTeam();
        }
    }
}
