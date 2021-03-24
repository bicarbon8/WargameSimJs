import { IPlayer } from "../players/i-player";
import { Dice } from "../utils/dice";
import { Helpers } from "../utils/helpers";
import { Battle } from "./battle";

export class MeleBattle extends Battle {
    addAttackers(...attackers: IPlayer[]): void {
        if (attackers) {
            for (var i=0; i<attackers.length; i++) {
                this._attackers.set(attackers[i].id, attackers[i]);
            }
        }
    }

    runBattle(): void {
        // roll to determine which side wins the attack
        let attackerScores: number[] = Dice.roll(this.getTotalAttackPoints(this.getAttackers()));
        let defenderScores: number[] = Dice.roll(this.getTotalAttackPoints(this.getDefenders()));
        let topAttackerScore: number = Helpers.getHighest(attackerScores);
        var topDefenderScore = Helpers.getHighest(defenderScores);
        // handle a tie
        if (topAttackerScore === topDefenderScore) {
            // compare highest fight values
            var topAttackerFightScore = Helpers.getHighest(this.getAttackers().map((a) => a.getStats().mele));
            var topDefenderFightScore = Helpers.getHighest(this.getDefenders().map((d) => d.getStats().mele));
            // handle matching fight values
            if (topAttackerFightScore === topDefenderFightScore) {
                // reroll to decide winner
                var roll = Dice.roll()[0];
                if (roll > 3) {
                    topAttackerScore++;
                } else {
                    topDefenderScore++;
                }
            } else if (topAttackerFightScore > topDefenderFightScore) {
                topAttackerScore++;
            } else {
                topDefenderScore++;
            }
        }
        // TODO: move loser back 1 space or handle trapped condition
        let winner: IPlayer[];
        let loser: IPlayer[];
        let attacks: number[];
        if (topAttackerScore > topDefenderScore) {
            winner = this.getAttackers();
            loser = this.getDefenders();
            attacks = attackerScores;
            console.info('attackers scored a hit');
        } else {
            winner = this.getDefenders();
            loser = this.getAttackers();
            attacks = defenderScores;
            console.info('attackers missed');
        }

        for (var i=0; i<winner.length; i++) {
            var success = this.tryToWound(winner[i], loser[0]);
            if (success) {
                // TODO: let winner pick who to wound
                loser[0].wound();
                console.info(`defender: ${loser[0].getName()} wounded`);
            } else {
                
            }
        }
    }

    pushBackPlayers(playerArray: IPlayer[]): void {
        // TODO
    }
}
