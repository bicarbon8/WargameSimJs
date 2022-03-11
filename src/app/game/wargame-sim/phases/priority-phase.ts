import { Team } from "../teams/team";
import { PhaseType } from "./phase-type";
import { IPhase } from "./i-phase";
import { WarGame } from "../war-game";
import { TeamManager } from "../teams/team-manager";
import { PhaseManager } from "./phase-manager";

export class PriorityPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager
    private readonly _teamMgr: TeamManager;
    private _started: boolean;
    private _completed: boolean;
    
    constructor(phaseManager: PhaseManager, teamManager: TeamManager) {
        this._phaseMgr = phaseManager;
        this._teamMgr = teamManager;
    }

    start(): IPhase {
        this._started = true;
        this._phaseMgr.emit(WarGame.EVENTS.PHASE_STARTED, this);
        let teams: Team[] = this._teamMgr.teams;
        let orderedTeams: Team[] = this._orderTeamsByPriority(teams);
        for (var i=0; i<orderedTeams.length; i++) {
            let team: Team = orderedTeams[i];
            team.priority = i;
        }
        this._completed = true;
        this._phaseMgr.emit(WarGame.EVENTS.PHASE_COMPLETED, this);
        return this;
    }

    isComplete(): boolean {
        return this._completed;
    }

    reset(): IPhase {
        this._started = false;
        this._completed = false;
        return this;
    }

    getType(): PhaseType {
        return PhaseType.priority;
    }

    getName(): string {
        return PhaseType[this.getType()];
    }

    private _orderTeamsByPriority(teams: Team[]): Team[] {
        let orderedTeams: Team[] = [];
        let diceRolls: number[] = WarGame.dice.rollMultiple(teams.length);
        let orders: {} = {};
        for (var i=0; i<diceRolls.length; i++) {
            let roll: number = diceRolls[i];
            let team: Team = teams[i];
            if (!orders[roll.toString()]) {
                orders[roll.toString()] = [];
            }
            orders[roll.toString()].push(team);
        }
        for (var i=1; i<7; i++) {
            let v = orders[i.toString()];
            if (v) {
                if (Array.isArray(v) && v.length > 1) {
                    orders[i.toString()] = this._orderTeamsByPriority(v);
                }
            }
        }
        orderedTeams = this._processOrders(orders);
        return orderedTeams;
    }

    private _processOrders(orders: {}): Team[] {
        let orderedTeams: Team[] = [];
        for (var i=1; i<7; i++) {
            let v = orders[i.toString()];
            if (v) {
                let ordered: Team[];
                if (Array.isArray(v)) {
                    ordered = v;
                } else {
                    ordered = this._processOrders(v);
                }
                for (var j=0; j<ordered.length; j++) {
                    orderedTeams.push(ordered[j]);
                }
            }
        }
        return orderedTeams;
    }
}
