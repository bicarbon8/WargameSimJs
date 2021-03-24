import { TeamManager } from "../teams/team-manager";
import { FightingPhase } from "./fighting-phase";
import { IPhase } from "./i-phase";
import { MovementPhase } from "./movement-phase";
import { PhaseType } from "./phase-type";
import { PriorityPhase } from "./priority-phase";
import { ShootingPhase } from "./shooting-phase";

export class PhaseManager {
    private _phases: IPhase[];
    private _currentPhase: number;
    
    constructor(teamMgr?: TeamManager, phases?: IPhase[]) {
        this._phases = phases || [];
        if (this._phases.length == 0) {
            this._phases.push(new PriorityPhase(teamMgr));
            this._phases.push(new MovementPhase(teamMgr));
            this._phases.push(new ShootingPhase(teamMgr));
            this._phases.push(new FightingPhase(teamMgr));
        }
        this._currentPhase = 0;
    }

    getNumberOfPhases(): number {
        return this._phases.length;
    }

    getCurrentPhase(): IPhase {
        return this._phases[this._currentPhase];
    }

    async runCurrentPhase(): Promise<void> {
        let phase: IPhase = this.getCurrentPhase();
        await phase.runPhase();
    }

    moveToNextPhase(): void {
        this._currentPhase++;
        if (this._currentPhase > PhaseType.fighting) {
            this._currentPhase = 0;
        }
    }
}

export module PhaseManager {
    export var inst = new PhaseManager();
}
