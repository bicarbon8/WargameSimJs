import { BasePhase } from "./base-phase";
import { PhaseType } from "./phase-type";

export class FightingPhase extends BasePhase {
    async runPhase(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getType(): PhaseType {
        return PhaseType.fighting;
    }
    getBattleGroups(): [] {return [];}
}
