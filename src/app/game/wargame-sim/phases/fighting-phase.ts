import { BattleGroup } from "../battles/battle-group";
import { BattleManager } from "../battles/battle-manager";
import { TerrainTileManager } from "../terrain/terrain-tile-manager";
import { IPlayer } from "../players/i-player";
import { AbstractPhase } from "./abstract-phase";
import { PhaseManager } from "./phase-manager";
import { PhaseType } from "./phase-type";
import { GameEventManager } from "../utils/game-event-manager";

export class FightingPhase extends AbstractPhase {
    readonly battleManager: BattleManager;
    readonly terrainManager: TerrainTileManager;
    
    constructor(evtMgr: GameEventManager, phaseMgr: PhaseManager, bttlMgr: BattleManager, terrainMgr: TerrainTileManager) {
        super(evtMgr, phaseMgr);
        this.battleManager = bttlMgr;
        this.terrainManager = terrainMgr;
    }
    
    override start(): this {
        super.start();
        this._startBattles();
        return this;
    }

    getType(): PhaseType {
        return PhaseType.shooting;
    }

    private _startBattles(): void {
        const groups: BattleGroup[] = this._getBattleGroups();
        groups.forEach((g: BattleGroup) => this.battleManager.runMeleBattle(g));
        this.end();
    }

    private _getBattleGroups(): BattleGroup[] {
        const groups: BattleGroup[] = [];
        const players: IPlayer[] = this.battleManager.teamManager.playerManager.getPlayers();
        for (var i=0; i<players.length; i++) {
            let attacker: IPlayer = players[i];
            
            let nearbyPlayers: IPlayer[] = this.terrainManager.getPlayersInRange(attacker.tileXY, 1);
            let nearbyAllies: IPlayer[] = nearbyPlayers
            .filter((p: IPlayer) => p.isAlly(attacker));
            let nearbyEnemies: IPlayer[] = nearbyPlayers
            .filter((p: IPlayer) => p.isEnemy(attacker));
            let group: BattleGroup = {attackers: nearbyAllies, defenders: nearbyEnemies};

            if (group.attackers.length > 0 && group.defenders.length > 0) {
                groups.push(group);
            }
        }
        return groups;
    }
}
