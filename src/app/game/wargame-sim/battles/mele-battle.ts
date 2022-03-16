import { IPlayer } from "../players/i-player";
import { ButtonStyle } from "../ui/buttons/button-style";
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
            this.battleManager.emit(WarGame.EVENTS.MESSAGE, 'attackers succeeded in their attack!', ButtonStyle.info);
        } else {
            winner = this.defenders;
            loser = this.attackers;
            attacks = defenderScores;
            this.battleManager.emit(WarGame.EVENTS.MESSAGE, 'attackers failed to attack defenders!', ButtonStyle.info);
        }
        this.pushBackPlayers(loser);

        for (var i=0; i<winner.length; i++) {
            var success = this.tryToWound(winner[i], loser[0]);
            if (success) {
                // TODO: let winner pick who to wound
                let index: number = Rand.getInt(0, loser.length - 1);
                let lp: IPlayer = loser[index];
                lp.wound();
                if (lp.isDead()) {
                    loser.splice(index, 1);
                }
                this.battleManager.emit(WarGame.EVENTS.MESSAGE, `defender: ${lp.name} wounded!`, ButtonStyle.info);
            } else {
                this.battleManager.emit(WarGame.EVENTS.MESSAGE, 'attackers caused no damage with attack!', ButtonStyle.info);
            }
        }
    }

    pushBackPlayers(playerArray: IPlayer[]): void {
        // TODO
    }
}
