import { IPlayer } from "../players/i-player";
import { Battle } from "./battle";

export class RangedBattle extends Battle {
    addAttacker(attacker: IPlayer): void {
        if (attacker) {
            this._attackers.clear();
            this._attackers.set(attacker.id, attacker);
        }
    }
}
