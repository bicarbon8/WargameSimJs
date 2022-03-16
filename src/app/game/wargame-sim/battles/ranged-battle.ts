import { IPlayer } from "../players/i-player";
import { ButtonStyle } from "../ui/buttons/button-style";
import { WarGame } from "../war-game";
import { Battle } from "./battle";

export class RangedBattle extends Battle {
    get attacker(): IPlayer {
        return this.attackers?.shift();
    }
    
    addAttacker(attacker: IPlayer): void {
        if (attacker) {
            this.resetAttackers();
            this._attackers.add(attacker.id);
        }
    }

    runBattle(): void {
        let attacker: IPlayer = this.attacker;
        let defenders: IPlayer[] = this.defenders;
        if (attacker && defenders?.length) {
            for (var i=0; i<defenders.length; i++) {
                let defender: IPlayer = defenders[i];
                let roll: number = WarGame.dice.roll();
                if (roll >= attacker.stats.ranged) {
                    this.battleManager.emit(WarGame.EVENTS.PLAYER_FIRED_SHOT, attacker, defender);
                    this.battleManager.emit(WarGame.EVENTS.MESSAGE, `player: ${attacker.name} fired at: ${defender.name}...`, ButtonStyle.info);
                    let success: boolean = this.tryToWound(attacker, defender);
                    if (success) {
                        this.battleManager.emit(WarGame.EVENTS.PLAYER_HIT_SHOT, attacker, defender);
                        this.battleManager.emit(WarGame.EVENTS.MESSAGE, `player: ${attacker.name} hit player: ${defender.name}!`, ButtonStyle.info);
                        defender.wound();
                    } else {
                        this.battleManager.emit(WarGame.EVENTS.PLAYER_MISSED_SHOT, attacker, defender);
                        this.battleManager.emit(WarGame.EVENTS.MESSAGE, `player: ${attacker.name} missed player: ${defender.name}!`, ButtonStyle.info);
                    }
                } else {
                    this.battleManager.emit(WarGame.EVENTS.PLAYER_MISFIRED_SHOT, attacker, defender);
                    this.battleManager.emit(WarGame.EVENTS.MESSAGE, `player: ${attacker.name} was unable to fire at: ${defender.name}.`, ButtonStyle.info);
                }
            }
        }
    }
}
