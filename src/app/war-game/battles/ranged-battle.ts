import { IPlayer } from "../players/i-player";
import { Battle } from "./battle";

export class RangedBattle extends Battle {
    runBattle(): void {
        throw new Error("Method not implemented.");
    }
    addAttacker(attacker: IPlayer): void {
        if (attacker) {
            this._attackers.clear();
            this._attackers.set(attacker.id, attacker);
        }
    }
}
