import { IPlayer } from "../players/i-player";
import { WoundChart } from "./wound-chart";

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
        let atk: number;
        let def: number;
        if (attacker.getStats().strength > 10) {
            atk = 10;
        } else {
            atk = attacker.getStats().strength;
        }
        if (defender.getStats().defense > 10) {
            def = 10;
        } else {
            def = defender.getStats().defense;
        }
        return WoundChart.doesWound(atk, def);
    }
}
