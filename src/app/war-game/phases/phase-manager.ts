import { FightingPhase } from "./fighting-phase";
import { IPhase } from "./i-phase";
import { MovementPhase } from "./movement-phase";
import { PriorityPhase } from "./priority-phase";
import { ShootingPhase } from "./shooting-phase";

class PhaseManager {
    private _phases: IPhase[];
    private _phaseIndex: number;
    
    constructor() {
        this._phases = [];
        if (this._phases.length == 0) {
            this._phases.push(new PriorityPhase());
            this._phases.push(new MovementPhase());
            this._phases.push(new ShootingPhase());
            this._phases.push(new FightingPhase());
        }
        this._phaseIndex = 0;
    }

    get numberOfPhases(): number {
        return this._phases.length;
    }

    get currentPhase(): IPhase {
        return this._phases[this._phaseIndex];
    }

    async runCurrentPhase(): Promise<void> {
        await this.currentPhase.runPhase();
    }

    moveToNextPhase(): void {
        this._phaseIndex++;
        if (this._phaseIndex >= this._phases.length) {
            this._phaseIndex = 0;
        }
    }
}

export const phaseManager = new PhaseManager();
