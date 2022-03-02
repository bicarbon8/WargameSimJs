import { Team } from "./team";

export class TeamManager {
    private _teams: Map<number, Team> = new Map<number, Team>();

    addTeams(...teams: Team[]): void {
        if (teams) {
            for (var i=0; i<teams.length; i++) {
                let t: Team = teams[i];
                this._teams.set(t.id, t);
            }
        }
    }

    getTeams(): Team[] {
        return Array.from(this._teams.values());
    }

    getTeamById(id: number): Team {
        return this._teams.get(id);
    }

    getTeamsByPriority(): Team[] {
        let ordered: Team[] = [];
        let teams: Team[] = this.getTeams();
        for (var i=0; i<teams.length; i++) {
            let t: Team = teams[i];
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
        let teams: Team[] = this.getTeams();
        for (var i=0; i<teams.length; i++) {
            let t: Team = teams[i];
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