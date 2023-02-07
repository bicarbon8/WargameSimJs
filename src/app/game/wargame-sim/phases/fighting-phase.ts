import { BattleGroup } from "../battles/battle-group";
import { BattleManager } from "../battles/battle-manager";
import { MapManager } from "../map/map-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { WarGame } from "../war-game";
import { IPhase } from "./i-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export class FightingPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager;
    private readonly _battleMgr: BattleManager;
    private readonly _mapMgr: MapManager;
    private _active: boolean;
    
    constructor(phaseManager: PhaseManager, battleManager: BattleManager, mapManager: MapManager) {
        this._phaseMgr = phaseManager;
        this._battleMgr = battleManager;
        this._mapMgr = mapManager;
    }

    get active(): boolean {
        return this._active;
    }
    
    start(): IPhase {
        this.reset();
        this._active = true;
        WarGame.evtMgr.notify(WarGame.EVENTS.PHASE_START, this);
        this._startBattles();
        return this;
    }

    nextTeam(team?: Team): IPhase {
        /* does nothing */
        return this;
    }

    reset(): IPhase {
        this._active = false;
        return this;
    }

    getType(): PhaseType {
        return PhaseType.shooting;
    }

    getName(): string {
        return PhaseType[this.getType()];
    }

    private _complete(): void {
        this._active = false;
        WarGame.evtMgr.notify(WarGame.EVENTS.PHASE_END, this);
    }

    private _startBattles(): void {
        const groups: BattleGroup[] = this._getBattleGroups();
        groups.forEach((g: BattleGroup) => this._battleMgr.runMeleBattle(g));
        this._complete();
    }

    private _getBattleGroups(): BattleGroup[] {
        const groups: BattleGroup[] = [];
        const players: IPlayer[] = this._battleMgr.teamManager.playerManager.getPlayers();
        for (var i=0; i<players.length; i++) {
            let attacker: IPlayer = players[i];
            
            let nearbyPlayers: IPlayer[] = this._mapMgr.map.getPlayersInRange(attacker.tileX, attacker.tileY, 32);
            let nearbyAllies: IPlayer[] = nearbyPlayers
            .filter((p: IPlayer) => p.isAlly(attacker));
            let nearbyEnemies: IPlayer[] = nearbyPlayers
            .filter((p: IPlayer) => p.isEnemy(attacker));
            let group: BattleGroup = {attackers: nearbyAllies, defenders: nearbyEnemies};

            if (group.attackers.length > 0 && group.defenders.length > 0) {
                groups.push(group);
            }
        }
        return groups;
    }
}
