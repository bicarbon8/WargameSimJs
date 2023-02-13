import { Team } from "../teams/team";
import { PhaseType } from "./phase-type";
import { AbstractPhase } from "./abstract-phase";
import { WarGame } from "../war-game";
import { TeamManager } from "../teams/team-manager";
import { PhaseManager } from "./phase-manager";
import { GameEventManager } from "../utils/game-event-manager";

export class PriorityPhase extends AbstractPhase {
    private readonly _teamMgr: TeamManager;
    private _orderedTeams: Team[];
    private _currentPriority: number;
    
    constructor(evtMgr: GameEventManager , phaseManager: PhaseManager, teamManager: TeamManager) {
        super(evtMgr, phaseManager);
        this._teamMgr = teamManager;
        this._currentPriority = 0;
        this._orderedTeams = [];
    }

    get priorityTeam(): Team {
        return this.getTeam(this._currentPriority);
    }

    get currentPriority(): number {
        return this._currentPriority;
    }

    get orderedTeams(): Team[] {
        return this._orderedTeams;
    }

    override start(): this {
        this._currentPriority = 0;
        this._orderedTeams = [];
        super.start();
        let teams: Team[] = this._teamMgr.teams;
        this._orderedTeams = this._rollForPriority(teams);
        this.eventManger.notify(WarGame.EVENTS.SWITCH_TEAMS, this.priorityTeam);
        return this.end();
    }

    getTeam(priority: number): Team {
        if (priority >= 0 && priority < this._teamMgr.teams.length) {
            return this._orderedTeams[priority];
        }
        return null;
    }

    nextTeam(): this {
        this._currentPriority++;
        if (this._currentPriority >= this._teamMgr.teams.length) {
            this._currentPriority = 0;
        }
        this.eventManger.notify(WarGame.EVENTS.SWITCH_TEAMS, this.priorityTeam);
        return this;
    }

    getType(): PhaseType {
        return PhaseType.priority;
    }

    /**
     * assign each team a priority order based on dice rolls using an array where
     * ```
     * |[0]|[1]|[2]|[3]|[4]|[5]| // rolls shifed down by 1 (0-5)
     * | A | B |   | D | G | H |
     * |   | C |   | E |   | I |
     * |   |   |   | F |   |   |
     * ```
     * which, for each index is then ordered and reversed
     * resulting in an array of teams like:
     * ```
     * | H | I | G | F | D | E | B | C | A |
     * ```
     * @param teams the teams to be prioritised
     */
    private _rollForPriority(teams: Team[]): Team[] {
        if (teams?.length === 1) {
            return teams;
        }
        let orderedTeams: Team[] = [];
        if (teams?.length) {
            const orders: Team[][] = [];
            const rolls: number[] = WarGame.dice.rollMultiple(teams.length, 6);
            // for each possible dice roll value (1-6) add each team to an array under that number
            for (var i=0; i<6; i++) {
                orders[i] = [];
                for (var j=0; j<rolls.length; j++) {
                    if (rolls[j] === i+1) {
                        orders[i].push(teams[j]);
                    }
                }
            }
            for (var i=0; i<orders.length; i++) {
                let teams: Team[] = orders[i];
                if (teams?.length) {
                    orderedTeams = orderedTeams.concat(this._rollForPriority(teams));
                }
            }
        }
        return orderedTeams.reverse();
    }
}
