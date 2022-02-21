import { FightingPhase } from "./fighting-phase";
import { IPhase } from "./i-phase";
import { MovementPhase } from "./movement-phase";
import { PriorityPhase } from "./priority-phase";
import { ShootingPhase } from "./shooting-phase";

export module PhaseManager {
    var _phases: IPhase[] = [new PriorityPhase(), new MovementPhase(), new ShootingPhase(), new FightingPhase()];
    var _phaseIndex: number = 0;

    export function numberOfPhases(): number {
        return _phases.length;
    }

    export function currentPhase(): IPhase {
        return _phases[_phaseIndex];
    }

    export async function runCurrentPhase(): Promise<void> {
        await currentPhase().runPhase();
    }

    export function moveToNextPhase(): void {
        _phaseIndex++;
        if (_phaseIndex >= _phases.length) {
            _phaseIndex = 0;
        }
    }
}
