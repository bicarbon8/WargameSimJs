import { BattleGroup } from "../battles/battle-group";
import { BattleManager } from "../battles/battle-manager";
import { IPlayer } from "../players/i-player";
import { Team } from "../teams/team";
import { WarGame } from "../war-game";
import { IPhase } from "./i-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export class FightingPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager;
    private readonly _battleMgr: BattleManager;
    private _active: boolean;
    
    constructor(phaseManager: PhaseManager, battleManager: BattleManager) {
        this._phaseMgr = phaseManager;
        this._battleMgr = battleManager;
    }

    get active(): boolean {
        return this._active;
    }
    
    start(): IPhase {
        this.reset();
        this._active = true;
        this._phaseMgr.emit(WarGame.EVENTS.PHASE_START, this);
        this._startBattles();
        return this;
    }

    skipTeam(team?: Team): IPhase {
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
        this._phaseMgr.emit(WarGame.EVENTS.PHASE_END, this);
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
            let group: BattleGroup = {attackers:[attacker], defenders:[]};
            let nearbyPlayers: IPlayer[] = WarGame.map.getPlayersInRange(attacker.tileX, attacker.tileY, 32);
            for (var j=0; j<nearbyPlayers.length; j++) {
                let p: IPlayer = nearbyPlayers[j];
                if (this._battleMgr.teamManager.playerManager.areAllies(attacker, p)) {
                    group.attackers.push(p);
                } else {
                    group.defenders.push(p);
                }
            }
            if (group.attackers.length && group.defenders.length) {
                groups.push(group);
            }
        }
        return groups;
    }
}
