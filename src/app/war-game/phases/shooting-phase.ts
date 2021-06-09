import { IPhase } from "./i-phase";
import { PhaseType } from "./phase-type";

export class ShootingPhase implements IPhase {
    async runPhase(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getType(): PhaseType {
        return PhaseType.shooting;
    }
}
