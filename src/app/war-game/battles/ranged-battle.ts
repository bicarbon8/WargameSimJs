import { IPlayer } from "../players/i-player";
import { diceMgr } from "../utils/dice-manager";
import { Battle } from "./battle";

export class RangedBattle extends Battle {
    addAttacker(attacker: IPlayer): void {
        if (attacker) {
            this._attackers.clear();
            this._attackers.set(attacker.id, attacker);
        }
    }

    getAttacker(): IPlayer {
        let attackers: IPlayer[] = this.getAttackers();
        if (attackers?.length) {
            return attackers[0];
        }
        return null;
    }

    runBattle(): void {
        let attacker: IPlayer = this.getAttacker();
        let defenders: IPlayer[] = this.getDefenders();
        for (var i=0; i<defenders.length; i++) {
            let defender: IPlayer = defenders[i];
            let roll: number = diceMgr.roll();
            if (roll >= attacker.getStats().ranged) {
                console.info(`player: ${attacker.getName()} fired at: ${defender.getName()}...`);
                let success: boolean = this.tryToWound(attacker, defender);
                if (success) {
                    console.info(`player: ${attacker.getName()} hit player: ${defender.getName()}!`);
                    defender.wound();
                } else {
                    console.info(`player: ${attacker.getName()} missed player: ${defender.getName()}!`);
                }
            } else {
                console.info(`player: ${attacker.getName()} was unable to fire at: ${defender.getName()}.`);
            }
        }
    }
}
