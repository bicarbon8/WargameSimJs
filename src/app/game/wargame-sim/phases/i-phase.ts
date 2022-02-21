import { PhaseType } from "./phase-type";

export interface IPhase {
    runPhase(): Promise<void>;
    getType(): PhaseType;
}