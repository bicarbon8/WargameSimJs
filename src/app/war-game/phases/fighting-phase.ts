import { IPhase } from "./i-phase";
import { PhaseType } from "./phase-type";

export class FightingPhase implements IPhase {
    async runPhase(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getType(): PhaseType {
        return PhaseType.fighting;
    }
    getBattleGroups(): [] {return [];}
}
