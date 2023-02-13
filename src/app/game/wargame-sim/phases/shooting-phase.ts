import { BattleManager } from "../battles/battle-manager";
import { TerrainTileManager } from "../terrain/terrain-tile-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { XY } from "../ui/types/xy";
import { GameEventManager } from "../utils/game-event-manager";
import { WarGame } from "../war-game";
import { AbstractPhase } from "./abstract-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";
import { GameMapTile } from "../terrain/game-map-tile";

export class ShootingPhase extends AbstractPhase {
    private readonly _phaseMgr: PhaseManager;
    private readonly _battleMgr: BattleManager;
    private readonly _terrainMgr: TerrainTileManager;
    private readonly _shootTracker: Set<string>;

    private _highlightedTiles: GameMapTile[];
    private _activeShooter: IPlayer;
    
    constructor(evtMgr: GameEventManager, phaseManager: PhaseManager, battleManager: BattleManager, mapManager: TerrainTileManager) {
        super(evtMgr, phaseManager);
        this._phaseMgr = phaseManager;
        this._battleMgr = battleManager;
        this._terrainMgr = mapManager;
        this._shootTracker = new Set<string>();
        this._highlightedTiles = [];
        this._startEventHandling();
    }

    override start(): this {
        this._activeShooter = null;
        this._shootTracker.clear();
        super.start();
        this._highlightTeam();
        return this;
    }

    nextTeam(team?: Team): this {
        team = this.activeTeam();
        if (team) {
            team.getPlayers().forEach((p: IPlayer) => this._shootTracker.add(p.id));
            this._phaseMgr.priorityPhase.nextTeam();
            if (this.allTeamsHaveShot()) {
                this.end();
            } else {
                this._highlightTeam();
            }
        }
        return this;
    }

    getType(): PhaseType {
        return PhaseType.shooting;
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
        return this._battleMgr.teamManager.teams.every(t => this.allPlayersInTeamHaveShot(t));
    }

    isAbleToShoot(player: IPlayer): boolean {
        const enemiesInRange: IPlayer[] = this._terrainMgr
            .getPlayersInRange(player.tileXY, 1)
            .filter((p: IPlayer) => !p.isDead() && p.isEnemy(player));
        return enemiesInRange.length > 0;
    }

    hasEnemiesInShootingRange(player: IPlayer): boolean {
        return this.getEnemiesInRange(player).length > 0;
    }

    getEnemiesInRange(player: IPlayer): IPlayer[] {
        const enemiesInRange: IPlayer[] = this._terrainMgr
            .getPlayersInRange(player.tileXY, player.stats.shoot)
            .filter((p: IPlayer) => !p.isDead() && p.isEnemy(player));
        return enemiesInRange;
    }

    private _startEventHandling(): void {
        const owner = 'shooting-phase';
        const condition = () => this.active;
        this.eventManger
            .subscribe(owner, WarGame.EVENTS.SWITCH_TEAMS, (t: Team) => this._handleTeamChange(t), condition)
            .subscribe(owner, WarGame.EVENTS.POINTER_DOWN, (tileXY: XY) => this._handlePlayerDown(tileXY), condition);
    }

    private _highlightTeam(): void {
        const players: IPlayer[] = this._phaseMgr.priorityPhase.priorityTeam.getPlayers()
            .filter((p: IPlayer) => !this._shootTracker.has(p.id))
            .filter((p: IPlayer) => this.isAbleToShoot(p))
            .filter((p: IPlayer) => this._terrainMgr.getPlayersInRange(p.tileXY, p.stats.shoot)
            .filter((o: IPlayer) => p.isEnemy(o)).length > 0);
        if (players.length > 0) {
            this.eventManger.notify(WarGame.EVENTS.HIGHLIGHT_PLAYERS, ...players);
        } else {
            this.nextTeam();
        }
    }

    private _handlePlayerDown(tileXY: XY): void {
        const tile = this._terrainMgr.getTileAt(tileXY);
        if (tile) {
            const player: IPlayer = this._battleMgr.teamManager.playerManager.getPlayerAt(tile.xy);

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
            const tilesInRange = this._terrainMgr.getTilesInRange(shooter.tileXY, shooter.stats.shoot);
            if (tilesInRange.length > 0) {
                this._highlightedTiles = this._highlightedTiles.concat(tilesInRange);
            }
            if (this._highlightedTiles.length) {
                this.eventManger.notify(WarGame.EVENTS.HIGHLIGHT_TILES, ...this._highlightedTiles);
            }
        }
    }

    private _removeTileHighlighting(): void {
        if (this._highlightedTiles.length) {
            const tiles = this._highlightedTiles.splice(0, this._highlightedTiles.length);
            this.eventManger.notify(WarGame.EVENTS.UNHIGHLIGHT_TILES, ...tiles);
        }
    }

    private _handleTeamChange(team?: Team): void {
        if (this.allTeamsHaveShot()) {
            this.end();
        } else {
            this._highlightTeam();
        }
    }
}
