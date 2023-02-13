import { TeamManager } from "../teams/team-manager";
import { TerrainTileManager } from "../terrain/terrain-tile-manager";
import { BattleGroup } from "./battle-group";
import { MeleBattle } from "./mele-battle";
import { RangedBattle } from "./ranged-battle";

export class BattleManager {
    readonly teamManager: TeamManager;
    readonly terrainManager: TerrainTileManager;
    private readonly _rangedBattle: RangedBattle;
    private readonly _meleBattle: MeleBattle;
    
    constructor(teamMgr: TeamManager, terrainMgr: TerrainTileManager) {
        this.teamManager = teamMgr;
        this.terrainManager = terrainMgr;
        this._rangedBattle = new RangedBattle(this);
        this._meleBattle = new MeleBattle(this);
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