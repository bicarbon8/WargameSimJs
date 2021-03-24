import { BasePhase } from "./base-phase";
import { PhaseType } from "./phase-type";

export class ShootingPhase extends BasePhase {
    async runPhase(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getType(): PhaseType {
        return PhaseType.shooting;
    }
}
