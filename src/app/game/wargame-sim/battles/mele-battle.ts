import { IPlayer } from "../players/i-player";
import { diceMgr } from "../utils/dice-manager";
import { Helpers } from "../utils/helpers";
import { Rand } from "../utils/rand";
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
        let attackerScores: number[] = diceMgr.rollMultiple(this.getTotalAttackPoints(this.getAttackers()));
        let defenderScores: number[] = diceMgr.rollMultiple(this.getTotalAttackPoints(this.getDefenders()));
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
                var roll = diceMgr.rollMultiple()[0];
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
        let winner: IPlayer[];
        let loser: IPlayer[];
        let attacks: number[];
        if (topAttackerScore > topDefenderScore) {
            winner = this.getAttackers();
            loser = this.getDefenders();
            attacks = attackerScores;
            console.info('attackers succeeded in their attack!');
        } else {
            winner = this.getDefenders();
            loser = this.getAttackers();
            attacks = defenderScores;
            console.info('attackers failed to attack defenders!');
        }
        this.pushBackPlayers(loser);

        for (var i=0; i<winner.length; i++) {
            var success = this.tryToWound(winner[i], loser[0]);
            if (success) {
                // TODO: let winner pick who to wound
                let index: number = Rand.getInt(0, loser.length);
                loser[index].wound();
                console.info(`defender: ${loser[index].getName()} wounded!`);
            } else {
                console.info('attackers caused no damage with attack!');
            }
        }
    }

    pushBackPlayers(playerArray: IPlayer[]): void {
        // TODO
    }
}
