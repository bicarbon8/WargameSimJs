import { Team } from "../teams/team";
import { PhaseType } from "./phase-type";

export interface IPhase {
    readonly active: boolean;
    start(): IPhase;
    skipTeam(team?: Team): IPhase;
    reset(): IPhase;
    getType(): PhaseType;
    getName(): string;
}