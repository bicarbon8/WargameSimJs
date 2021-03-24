import { TeamManager } from "../teams/team-manager";
import { IPhase } from "./i-phase";
import { PhaseType } from "./phase-type";

export abstract class BasePhase implements IPhase {
    private _teamMgr: TeamManager;

    constructor(teamMgr?: TeamManager) {
        this._teamMgr = teamMgr || TeamManager.inst;
    }

    getTeamManager(): TeamManager {
        return this._teamMgr;
    }

    abstract runPhase(): Promise<void>;
    abstract getType(): PhaseType;
}
