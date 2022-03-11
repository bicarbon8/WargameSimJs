import * as Phaser from "phaser";
import { WarGame } from "../war-game";
import { Team } from "./team";
import { TeamOptions } from "./team-options";

export class TeamManager extends Phaser.Events.EventEmitter {
    private readonly _teams: Team[];
    
    private _currentTeamIndex: number;

    constructor() {
        super();
        this._teams = [];
        this._currentTeamIndex = 0;
    }

    addTeam(options: TeamOptions): Team {
        let team: Team;
        if (options) {
            options.teamManager = options.teamManager || this;
            team = new Team(options);
            this._teams.push(team);
            this.emit(WarGame.EVENTS.TEAM_ADDED, team);
        }
        return team;
    }

    getTeam(index: number): Team {
        if (index >= 0 && index < this._teams.length) {
            return this._teams[index];
        }
    }

    removeTeam(team: Team, destroy?: boolean): Team {
        let removed: Team;
        if (team) {
            const index: number = this._teams.findIndex((t: Team) => t.id === team.id);
            if (index >= 0) {
                removed = this._teams.splice(index, 1)[0];
                if (this.currentTeamIndex >= index) {
                    this.movePrevious();
                }
                if (destroy) {
                    removed.destroy();
                }
                this.emit(WarGame.EVENTS.TEAM_REMOVED, removed);
            }
        }
        return removed;
    }

    get currentTeamIndex(): number {
        return this._currentTeamIndex;
    }

    get teams(): Team[] {
        let ordered: Team[] = [];
        for (var i=0; i<this._teams.length; i++) {
            let t: Team = this._teams[i];
            if (ordered.length > 0) {
                for (var j=0; j<ordered.length; j++) {
                    let ot: Team = ordered[j];
                    if (t.priority > ot.priority) {
                        if (j >= ordered.length-1) {
                            ordered.push(t);
                            break;
                        }
                    } else {
                        ordered.splice(j, 0, t);
                        break;
                    }
                }
            } else {
                ordered.push(t);
            }
        }
        return ordered;
    }

    get currentTeam(): Team {
        return this._teams[this.currentTeamIndex];
    }

    moveNext(): this {
        this._currentTeamIndex++;
        if (this._currentTeamIndex >= this._teams.length) {
            this._currentTeamIndex = 0;
        }
        this.emit(WarGame.EVENTS.CURRENT_TEAM_CHANGED, this.currentTeam);
        return this;
    }

    movePrevious(): this {
        this._currentTeamIndex--;
        if (this._currentTeamIndex < 0) {
            this._currentTeamIndex = this._teams.length - 1;
        }
        this.emit(WarGame.EVENTS.CURRENT_TEAM_CHANGED, this.currentTeam);
        return this;
    }

    getTeamById(id: string): Team {
        const teams: Team[] = this.teams.filter((t: Team) => t.id === id);
        if (teams) {
            return teams[0];
        }
        return null;
    }

    getTeamByName(name: string): Team {
        const teams: Team[] = this.teams.filter((t: Team) => t.name === name);
        if (teams) {
            return teams[0];
        }
        return null;
    }

    getTeamsByScore(): Team[] {
        let ordered: Team[] = [];
        for (var i=0; i<this._teams.length; i++) {
            let t: Team = this._teams[i];
            if (ordered.length > 0) {
                for (var j=0; j<ordered.length; j++) {
                    let ot: Team = ordered[j];
                    if (t.score < ot.score) {
                        if (j == ordered.length-1) {
                            ordered.push(t);
                            break;
                        }
                    } else {
                        ordered.splice(j, 0, t);
                        break;
                    }
                }
            } else {
                ordered.push(t);
            }
        }
        return ordered;
    }
}