import { Team } from "../teams/team";
import { PhaseType } from "./phase-type";
import { IPhase } from "./i-phase";
import { WarGame } from "../war-game";
import { TeamManager } from "../teams/team-manager";
import { PhaseManager } from "./phase-manager";

export class PriorityPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager
    private readonly _teamMgr: TeamManager;
    private _active: boolean;
    private _orderedTeams: Team[];
    private _currentPriority: number;
    
    constructor(phaseManager: PhaseManager, teamManager: TeamManager) {
        this._phaseMgr = phaseManager;
        this._teamMgr = teamManager;
        this._currentPriority = 0;
        this._orderedTeams = [];
    }

    get active(): boolean {
        return this._active;
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

    start(): IPhase {
        this.reset();
        this._active = true;
        this._phaseMgr.emit(WarGame.EVENTS.PHASE_START, this);
        let teams: Team[] = this._teamMgr.teams;
        this._orderedTeams = this._rollForPriority(teams);
        this._teamMgr.emit(WarGame.EVENTS.TEAM_CHANGED, this.priorityTeam);
        this._active = false;
        this._phaseMgr.emit(WarGame.EVENTS.PHASE_END, this);
        return this;
    }

    getTeam(priority: number): Team {
        if (priority >= 0 && priority < this._teamMgr.teams.length) {
            return this._orderedTeams[priority];
        }
        return null;
    }

    nextTeam(team?: Team): IPhase {
        this._currentPriority++;
        if (this._currentPriority >= this._teamMgr.teams.length) {
            this._currentPriority = 0;
        }
        this._teamMgr.emit(WarGame.EVENTS.TEAM_CHANGED, this.priorityTeam);
        return this;
    }

    reset(): IPhase {
        this._active = false;
        this._currentPriority = 0;
        this._orderedTeams = [];
        return this;
    }

    getType(): PhaseType {
        return PhaseType.priority;
    }

    getName(): string {
        return PhaseType[this.getType()];
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
