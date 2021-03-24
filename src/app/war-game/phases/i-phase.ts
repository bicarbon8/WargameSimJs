import { TeamManager } from "../teams/team-manager";
import { PhaseType } from "./phase-type";

export interface IPhase {
    getTeamManager(): TeamManager;
    runPhase(): Promise<void>;
    getType(): PhaseType;
}