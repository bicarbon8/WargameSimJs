import { PhaseType } from "./phase-type";

export interface IPhase {
    start(): IPhase;
    isComplete(): boolean;
    reset(): IPhase;
    getType(): PhaseType;
    getName(): string;
}