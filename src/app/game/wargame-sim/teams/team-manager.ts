import { Team } from "./team";

export module TeamManager {
    var _teams: Map<number, Team> = new Map<number, Team>();

    export function addTeams(...teams: Team[]): void {
        if (teams) {
            for (var i=0; i<teams.length; i++) {
                let t: Team = teams[i];
                _teams.set(t.id, t);
            }
        }
    }

    export function getTeams(): Team[] {
        return Array.from(_teams.values());
    }

    export function getTeamById(id: number): Team {
        return _teams.get(id);
    }

    export function getTeamsByPriority(): Team[] {
        let ordered: Team[] = [];
        let teams: Team[] = getTeams();
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

    export function getTeamsByScore(): Team[] {
        let ordered: Team[] = [];
        let teams: Team[] = getTeams();
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