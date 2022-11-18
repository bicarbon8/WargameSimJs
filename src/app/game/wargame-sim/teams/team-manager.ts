import * as Phaser from "phaser";
import { PlayerManager } from "../players/player-manager";
import { WarGame } from "../war-game";
import { Team } from "./team";
import { TeamOptions } from "./team-options";

export class TeamManager extends Phaser.Events.EventEmitter {
    private readonly _teams: Team[];
    private readonly _playerMgr: PlayerManager;
    private _currentTeamIndex: number;

    constructor(playerManager: PlayerManager) {
        super();
        this._teams = [];
        this._playerMgr = playerManager;
        this._currentTeamIndex = 0;
    }

    get playerManager(): PlayerManager {
        return this._playerMgr;
    }

    get teams(): Team[] {
        return this._teams;
    }

    addTeam(options: TeamOptions): Team {
        let team: Team;
        if (options) {
            options.teamManager = options.teamManager || this;
            options.playerManager = options.playerManager || this.playerManager;
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

    removeTeam(team: Team | number, destroy?: boolean): Team {
        let removed: Team;
        if (team) {
            const tt: Team = team as Team;
            let index: number;
            if (tt?.id) {
                index = this._teams.findIndex((t: Team) => t.id === tt.id);
            } else {
                index = team as number;
            }
            if (index >= 0 && index < this._teams.length) {
                removed = this._teams.splice(index, 1)[0];
                if (destroy) {
                    removed.destroy();
                }
                this.emit(WarGame.EVENTS.TEAM_REMOVED, removed);
            }
        }
        return removed;
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