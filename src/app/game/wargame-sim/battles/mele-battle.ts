import { IPlayer } from "../players/i-player";
import { Helpers } from "../utils/helpers";
import { Rand } from "../utils/rand";
import { WarGame } from "../war-game";
import { Battle } from "./battle";

export class MeleBattle extends Battle {
    addAttackers(...attackers: IPlayer[]): void {
        if (attackers) {
            for (var i=0; i<attackers.length; i++) {
                this._attackers.add(attackers[i].id);
            }
        }
    }

    runBattle(): void {
        // roll to determine which side wins the attack
        let attackerScores: number[] = WarGame.dice.rollMultiple(this.getTotalAttackPoints(this.attackers));
        let defenderScores: number[] = WarGame.dice.rollMultiple(this.getTotalAttackPoints(this.defenders));
        let topAttackerScore: number = Helpers.getHighest(...attackerScores);
        var topDefenderScore = Helpers.getHighest(...defenderScores);
        // handle a tie
        if (topAttackerScore === topDefenderScore) {
            // compare highest fight values
            var topAttackerFightScore = Helpers.getHighest(...this.attackers.map((a) => a.stats.mele));
            var topDefenderFightScore = Helpers.getHighest(...this.defenders.map((d) => d.stats.mele));
            // handle matching fight values
            if (topAttackerFightScore === topDefenderFightScore) {
                // reroll to decide winner
                var roll = WarGame.dice.rollMultiple()[0];
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
            winner = this.attackers;
            loser = this.defenders;
            attacks = attackerScores;
            console.info('attackers succeeded in their attack!');
        } else {
            winner = this.defenders;
            loser = this.attackers;
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
                console.info(`defender: ${loser[index].name} wounded!`);
            } else {
                console.info('attackers caused no damage with attack!');
            }
        }
    }

    pushBackPlayers(playerArray: IPlayer[]): void {
        // TODO
    }
}
