import { IPhase } from "./i-phase";
import { PhaseType } from "./phase-type";

export class MovementPhase implements IPhase {
    async runPhase(): Promise<void> {
        /* ??? */
    }
    getType(): PhaseType {
        return PhaseType.movement;
    }
}
