import { BattleManager } from "../battles/battle-manager";
import { MapManager } from "../map/map-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { WarGame } from "../war-game";
import { IPhase } from "./i-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export class ShootingPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager;
    private readonly _battleMgr: BattleManager;
    private readonly _mapMgr: MapManager;
    private readonly _shootTracker: Set<string>;
    private _active: boolean;

    private _highlightedTiles: Phaser.Tilemaps.Tile[];
    private _activeShooter: IPlayer;
    
    constructor(phaseManager: PhaseManager, battleManager: BattleManager, mapManager: MapManager) {
        this._phaseMgr = phaseManager;
        this._battleMgr = battleManager;
        this._mapMgr = mapManager;
        this._shootTracker = new Set<string>();
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

    nextTeam(team?: Team): IPhase {
        team = this.activeTeam();
        if (team) {
            team.getPlayers().forEach((p: IPlayer) => this._shootTracker.add(p.id));
            this._phaseMgr.priorityPhase.nextTeam();
            if (this.allTeamsHaveShot()) {
                this._complete();
            } else {
                this._highlightTeam();
            }
        }
        return this;
    }

    reset(): IPhase {
        this._active = false;
        this._activeShooter = null;
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

    activeTeam(): Team {
        return this._phaseMgr.priorityPhase.priorityTeam;
    }

    allPlayersInTeamHaveShot(team: Team): boolean {
        let teamHasShot: boolean = false;

        const playersWhoCanShoot: string[] = team.getPlayers()
        .filter((p: IPlayer) => this.hasEnemiesInShootingRange(p))
        .map((p: IPlayer) => p.id);

        const playerShotCount: string[] = Array.from(this._shootTracker.values())
        .filter((id: string) => playersWhoCanShoot.includes(id));

        if (playerShotCount.length >= playersWhoCanShoot.length) {
            teamHasShot = true;
        }

        return teamHasShot;
    }

    allTeamsHaveShot(): boolean {
        let shot: boolean = true;

        this._battleMgr.teamManager.teams.forEach((t: Team) => {
            shot = shot && this.allPlayersInTeamHaveShot(t);
        });

        return shot;
    }

    isAbleToShoot(player: IPlayer): boolean {
        const enemiesInRange: IPlayer[] = this._mapMgr.map
        .getPlayersInRange(player.tileX, player.tileY, 32)
        .filter((p: IPlayer) => !p.isDead() && p.isEnemy(player));
        return enemiesInRange.length > 0;
    }

    hasEnemiesInShootingRange(player: IPlayer): boolean {
        return this.getEnemiesInRange(player).length > 0;
    }

    getEnemiesInRange(player: IPlayer): IPlayer[] {
        const enemiesInRange: IPlayer[] = this._mapMgr.map
        .getPlayersInRange(player.tileX, player.tileY, player.stats.shoot * 32)
        .filter((p: IPlayer) => !p.isDead() && p.isEnemy(player));
        return enemiesInRange;
    }

    private _startEventHandling(): void {
        this._battleMgr.teamManager.on(WarGame.EVENTS.TEAM_CHANGED, this._handleTeamChange, this);
        this._battleMgr.teamManager.playerManager.players.forEach((p: IPlayer) => {
            p?.obj.on(Phaser.Input.Events.POINTER_DOWN, this._handlePlayerDown, this);
        });
    }

    private _stopEventHandling(): void {
        this._battleMgr.teamManager.off(WarGame.EVENTS.TEAM_CHANGED, this._handleTeamChange, this);
        this._battleMgr.teamManager.playerManager.players.forEach((p: IPlayer) => {
            p?.obj.off(Phaser.Input.Events.POINTER_DOWN, this._handlePlayerDown, this);
        });
    }

    private _highlightTeam(): void {
        const players: IPlayer[] = this._phaseMgr.priorityPhase.priorityTeam.getPlayers()
        .filter((p: IPlayer) => !this._shootTracker.has(p.id))
        .filter((p: IPlayer) => this.isAbleToShoot(p))
        .filter((p: IPlayer) => this._mapMgr.map.getPlayersInRange(p.tileX, p.tileY, p.stats.shoot * 32)
            .filter((o: IPlayer) => p.isEnemy(o)).length > 0);
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

    private _handlePlayerDown(pointer: Phaser.Input.Pointer): void {
        const world: Phaser.Math.Vector2 = this._battleMgr.uiManager.pointerToWorld(pointer);
        const tile: Phaser.Tilemaps.Tile = this._mapMgr.map.obj.getTileAtWorldXY(world.x, world.y);
        if (tile) {
            const player: IPlayer = this._battleMgr.teamManager.playerManager.getPlayerAt(tile.x, tile.y);

            if (this._activeShooter) {
                // already have active shooter so selecting target now
                if (player?.id === this._activeShooter.id) {
                    // selected same player for shooter and target so reset
                    this._activeShooter = null;
                    this._highlightTiles();
                    this._highlightTeam();
                } else {
                    if (this.getEnemiesInRange(this._activeShooter).includes(player)) {
                        // fire at target
                        this._battleMgr.runRangedBattle({attackers: [this._activeShooter], defenders: [player]})
                        this._shootTracker.add(this._activeShooter.id);
                        this._activeShooter = null;
                        this._highlightTiles();
                        this._highlightTeam();
                    }
                }
            } else {
                // if no shooter selected yet
                if (player?.teamId === this.activeTeam()?.id && !this._shootTracker.has(player.id)) {
                    this._activeShooter = player;
                    this._highlightTiles();
                }
            }
        }
    }

    private _highlightTiles(): void {
        this._removeTileHighlighting();
        const shooter: IPlayer = this._activeShooter;
        if (shooter) {
            const tilesInRange: Phaser.Tilemaps.Tile[] = this._mapMgr.map.getTilesInRange(shooter.tileX, shooter.tileY, (shooter.stats.shoot) * 32);
            if (tilesInRange.length > 0) {
                this._highlightedTiles = this._highlightedTiles.concat(tilesInRange);
            }
            for (var i=0; i<this._highlightedTiles.length; i++) {
                this._highlightedTiles[i].alpha = 0.5;
            }
        }
    }

    private _removeTileHighlighting(): void {
        while (this._highlightedTiles.length) {
            let tile: Phaser.Tilemaps.Tile = this._highlightedTiles.shift();
            tile?.clearAlpha();
        }
    }

    private _handleTeamChange(team?: Team): void {
        if (this.allTeamsHaveShot()) {
            this._complete();
        } else {
            this._highlightTeam();
        }
    }
}
