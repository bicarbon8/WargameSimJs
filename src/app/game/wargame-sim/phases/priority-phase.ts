import { Team } from "../teams/team";
import { PhaseType } from "./phase-type";
import { IPhase } from "./i-phase";
import { WarGame } from "../war-game";
import { TeamManager } from "../teams/team-manager";

export class PriorityPhase implements IPhase {
    private readonly _teamMgr: TeamManager;
    
    constructor(teamManager: TeamManager) {
        this._teamMgr = teamManager;
    }

    async runPhase(): Promise<void> {
        let teams: Team[] = this._teamMgr.teams;
        let orderedTeams: Team[] = this._orderTeamsByPriority(teams);
        for (var i=0; i<orderedTeams.length; i++) {
            let team: Team = orderedTeams[i];
            team.priority = i;
        }
    }

    getType(): PhaseType {
        return PhaseType.priority;
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
