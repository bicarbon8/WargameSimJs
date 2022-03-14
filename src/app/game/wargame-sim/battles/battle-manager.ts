import { IPlayer } from "../players/i-player";
import { TeamManager } from "../teams/team-manager";
import { UIManager } from "../ui/ui-manager";
import { BattleGroup } from "./battle-group";
import { MeleBattle } from "./mele-battle";
import { RangedBattle } from "./ranged-battle";

export class BattleManager extends Phaser.Events.EventEmitter {
    private readonly _teamMgr: TeamManager;
    private readonly _uiMgr: UIManager;
    private readonly _rangedBattle: RangedBattle;
    private readonly _meleBattle: MeleBattle;
    
    constructor(teamManager: TeamManager, uiManager: UIManager) {
        super();
        this._teamMgr = teamManager;
        this._uiMgr = uiManager;
        this._rangedBattle = new RangedBattle(this);
        this._meleBattle = new MeleBattle(this);
    }

    get teamManager(): TeamManager {
        return this._teamMgr;
    }

    get uiManager(): UIManager {
        return this._uiMgr;
    }
    
    runRangedBattle(battleGroup: BattleGroup): void {
        if (battleGroup) {
            this._rangedBattle.reset();
            this._rangedBattle.addAttacker(battleGroup.attackers?.shift());
            this._rangedBattle.addDefenders(...battleGroup.defenders);
            this._rangedBattle.runBattle();
        }
    }

    runMeleBattle(battleGroup: BattleGroup): void {
        if (battleGroup) {
            this._meleBattle.reset();
            this._meleBattle.addAttackers(...battleGroup.attackers);
            this._meleBattle.addDefenders(...battleGroup.defenders);
            this._meleBattle.runBattle();
        }
    }
}