import { IPlayer } from "../players/i-player";
import { woundChart } from "./wound-chart";

export abstract class Battle {
    protected _attackers: Map<number, IPlayer>;
    protected _defenders: Map<number, IPlayer>;

    addDefenders(...defenders: IPlayer[]): void {
        if (defenders) {
            for (var i=0; i<defenders.length; i++) {
                this._defenders.set(defenders[i].id, defenders[i]);
            }
        }
    }

    abstract runBattle(): void;

    getAttackers(): IPlayer[] {
        return Array.from(this._attackers.values());
    }

    getDefenders(): IPlayer[] {
        return Array.from(this._defenders.values());
    }

    getTotalAttackPoints(playerArray: IPlayer[]): number {
        var points = 0;
        for (var i=0; i<playerArray.length; i++) {
            points += playerArray[i].getStats().attacks;
        }

        return points;
    }

    tryToWound(attacker: IPlayer, defender: IPlayer): boolean {
        let atk: number = attacker.getStats().strength;
        let def: number = defender.getStats().defense;
        
        return woundChart.doesWound(atk, def);
    }
}
