import { IPlayer } from "../players/i-player";
import { WarGame } from "../war-game";
import { BattleManager } from "./battle-manager";

export abstract class Battle {
    private readonly _battleMgr: BattleManager;
    private readonly _defenders: Set<string>;
    protected readonly _attackers: Set<string>;

    constructor(battleManager: BattleManager) {
        this._battleMgr = battleManager;
        this._attackers = new Set<string>();
        this._defenders = new Set<string>();
    }

    get battleManager(): BattleManager {
        return this._battleMgr;
    }

    get attackers(): IPlayer[] {
        return this._battleMgr.teamManager.playerManager.getPlayers()
        .filter((p: IPlayer) => this._attackers.has(p.id));
    }

    get defenders(): IPlayer[] {
        return this._battleMgr.teamManager.playerManager.getPlayers()
        .filter((p: IPlayer) => this._defenders.has(p.id));
    }

    addDefenders(...defenders: IPlayer[]): void {
        if (defenders) {
            for (var i=0; i<defenders.length; i++) {
                this._defenders.add(defenders[i].id);
            }
        }
    }

    abstract runBattle(): void;

    getTotalAttackPoints(playerArray: IPlayer[]): number {
        var points = 0;
        for (var i=0; i<playerArray.length; i++) {
            points += playerArray[i].stats.attacks;
        }

        return points;
    }

    tryToWound(attacker: IPlayer, defender: IPlayer): boolean {
        let atk: number = attacker.stats.strength;
        let def: number = defender.stats.defense;
        
        return this._doesWound(atk, def);
    }

    reset(): this {
        this.resetAttackers();
        this.resetDefenders();
        return this;
    }

    resetAttackers(): this {
        this._attackers.clear();
        return this;
    }

    resetDefenders(): this {
        this._defenders.clear();
        return this;
    }

    /**
     * replicates the behaviour of rolling dice to determine if the attacker
     * is able to hit the defender based on the following chart:
     * ```
     * |   |[1]|[2]|[3]|[4]|[5]|[6]|[7]|[8]|[9]|[10]| defense
     * |[1]| 4 | 5 | 5 | 6 | 6 |6,4|6,5|6,6| - | - |
     * |[2]| 4 | 4 | 5 | 5 | 6 | 6 |6,4|6,5|6,6| - |
     * |[3]| 3 | 4 | 4 | 5 | 5 | 6 | 6 |6,4|6,5|6,6|
     * |[4]| 3 | 3 | 4 | 4 | 5 | 5 | 6 | 6 |6,4|6,5|
     * |[5]| 3 | 3 | 3 | 4 | 4 | 5 | 5 | 6 | 6 |6,4|
     * |[6]| 3 | 3 | 3 | 3 | 4 | 4 | 5 | 5 | 6 | 6 |
     * |[7]| 3 | 3 | 3 | 3 | 3 | 4 | 4 | 5 | 5 | 6 |
     * |[8]| 3 | 3 | 3 | 3 | 3 | 3 | 4 | 4 | 5 | 5 |
     * |[9]| 3 | 3 | 3 | 3 | 3 | 3 | 3 | 4 | 4 | 5 |
     * |[10]|3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 4 | 4 |
     * attack
     * ```
     * @param str the strength value of the attacker
     * @param def the defence value of the defender
     * @returns true if the attacker succeeds in hitting the defender
     */
    private _doesWound(str: number, def: number): boolean {
        let minimumNeeded: number[];
        if (str < 1 || str+8 <= def) {
            return false;
        }
        if (def < 1) {
            return true;
        }
        if (str >= def+2) {
            minimumNeeded = [3];
        }
        if (str == def || str == def+1) {
            minimumNeeded = [4];
        }
        if (str+1 == def || str+2 == def) {
            minimumNeeded = [5];
        }
        if (str+3 == def || str+4 == def) {
            minimumNeeded = [6];
        }
        if (str+5 == def) {
            minimumNeeded = [6, 4];
        }
        if (str+6 == def) {
            minimumNeeded = [6, 5];
        }
        if (str+7 == def) {
            minimumNeeded = [6, 6];
        }
        
        return this._calculateSuccess(minimumNeeded);
    }

    private _calculateSuccess(minimumWoundsNeeded: number[]): boolean {
        if (minimumWoundsNeeded?.length) {
            for (var i=0; i<minimumWoundsNeeded.length; i++) {
                let min: number = minimumWoundsNeeded[i];
                let roll: number = WarGame.dice.roll();
                if (roll < min) {
                    return false;
                }
            }
            return true;
        }
        throw 'passed in array was undefined or null';
    }
}
