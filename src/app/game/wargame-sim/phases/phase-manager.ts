import * as Phaser from "phaser";
import { BattleManager } from "../battles/battle-manager";
import { PlayerManager } from "../players/player-manager";
import { TeamManager } from "../teams/team-manager";
import { UIManager } from "../ui/ui-manager";
import { FightingPhase } from "./fighting-phase";
import { IPhase } from "./i-phase";
import { MovementPhase } from "./movement-phase";
import { PhaseType } from "./phase-type";
import { PriorityPhase } from "./priority-phase";
import { ShootingPhase } from "./shooting-phase";

export class PhaseManager extends Phaser.Events.EventEmitter {
    private readonly _phases: IPhase[];
    private _phaseIndex: number = 0;

    constructor(teamManager: TeamManager, uiManager: UIManager, battleManager: BattleManager) {
        super();
        this._phases = [
            new PriorityPhase(this, teamManager), 
            new MovementPhase(this, teamManager, uiManager), 
            new ShootingPhase(this, battleManager), 
            new FightingPhase(this, battleManager)
        ];
    }

    get phases(): IPhase[] {
        return this._phases;
    }

    get currentPhase(): IPhase {
        return this._phases[this._phaseIndex];
    }

    get priorityPhase(): PriorityPhase {
        return this._phases[PhaseType.priority] as PriorityPhase;
    }

    get movementPhase(): MovementPhase {
        return this._phases[PhaseType.movement] as MovementPhase;
    }

    get shootingPhase(): ShootingPhase {
        return this._phases[PhaseType.shooting] as ShootingPhase;
    }

    get fightingPhase(): FightingPhase {
        return this._phases[PhaseType.fighting] as FightingPhase;
    }

    startCurrentPhase(): IPhase {
        return this.currentPhase.start();
    }

    moveToNextPhase(): IPhase {
        this._phaseIndex++;
        if (this._phaseIndex >= this._phases.length) {
            this._phaseIndex = 0;
        }
        return this.currentPhase;
    }

    reset(): IPhase {
        this._phaseIndex = 0;
        this._phases.forEach((p: IPhase) => p.reset());
        return this.currentPhase;
    }
}
