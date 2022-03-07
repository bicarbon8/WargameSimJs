import { Team } from "./team";

export class TeamManager {
    private readonly _teams: Team[];

    constructor() {
        this._teams = [];
    }

    addTeam(team: Team): void {
        if (team && !this.getTeamById(team.id)) {
            this._teams.push(team);
        }
    }

    getTeam(index: number): Team {
        if (index >= 0 && index < this._teams.length) {
            return this._teams[index];
        }
    }

    removeTeam(team: Team): void {
        if (team) {
            const index: number = this.teams.findIndex((t: Team) => t.id == team.id);
            if (index >= 0) {
                this._teams.splice(index, 1);
            }
        }
    }

    get teams(): Team[] {
        return this._teams;
    }

    getTeamById(id: number): Team {
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

    getTeamsByPriority(): Team[] {
        let ordered: Team[] = [];
        for (var i=0; i<this.teams.length; i++) {
            let t: Team = this.teams[i];
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

    getTeamsByScore(): Team[] {
        let ordered: Team[] = [];
        for (var i=0; i<this.teams.length; i++) {
            let t: Team = this.teams[i];
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