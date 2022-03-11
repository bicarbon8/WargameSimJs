import { IPhase } from "./i-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";

export class FightingPhase implements IPhase {
    private readonly _phaseMgr: PhaseManager;
    
    constructor(phaseManager: PhaseManager) {
        this._phaseMgr = phaseManager;
    }

    start(): IPhase {
        return this;
    }

    isComplete(): boolean {
        return false;
    }

    reset(): IPhase {
        return this;
    }

    getType(): PhaseType {
        return PhaseType.fighting;
    }

    getName(): string {
        return PhaseType[this.getType()];
    }
    
    getBattleGroups(): [] {return [];}
}
