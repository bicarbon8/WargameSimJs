import { Colors } from "phaser-ui-components";
import { IPlayer } from "../players/i-player";
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
                    WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_FIRED_SHOT, attacker, defender);
                    WarGame.evtMgr.notify(WarGame.EVENTS.MESSAGE, `player: ${attacker.name} fired at: ${defender.name}...`, Colors.info);
                    let success: boolean = this.tryToWound(attacker, defender);
                    if (success) {
                        WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_HIT_SHOT, attacker, defender);
                        WarGame.evtMgr.notify(WarGame.EVENTS.MESSAGE, `player: ${attacker.name} hit player: ${defender.name}!`, Colors.info);
                        defender.wound();
                    } else {
                        WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_MISSED_SHOT, attacker, defender);
                        WarGame.evtMgr.notify(WarGame.EVENTS.MESSAGE, `player: ${attacker.name} missed player: ${defender.name}!`, Colors.info);
                    }
                } else {
                    WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_MISFIRED_SHOT, attacker, defender);
                    WarGame.evtMgr.notify(WarGame.EVENTS.MESSAGE, `player: ${attacker.name} was unable to fire at: ${defender.name}.`, Colors.info);
                }
            }
        }
    }
}
