import { Colors } from "phaser-ui-components";
import { IPlayer } from "../players/i-player";
import { BetweenComparisonType, Helpers } from "../utils/helpers";
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
            WarGame.evtMgr.notify(WarGame.EVENTS.MESSAGE, 'attackers succeeded in their attack!', Colors.info);
        } else {
            winner = this.defenders;
            loser = this.attackers;
            attacks = defenderScores;
            WarGame.evtMgr.notify(WarGame.EVENTS.MESSAGE, 'attackers failed to attack defenders!', Colors.info);
        }
        this._pushBackPlayers(loser);

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
                WarGame.evtMgr.notify(WarGame.EVENTS.MESSAGE, `defender: ${lp.name} wounded!`, Colors.info);
            } else {
                WarGame.evtMgr.notify(WarGame.EVENTS.MESSAGE, 'attackers caused no damage with attack!', Colors.info);
            }
        }
    }

    private _pushBackPlayers(losers: IPlayer[]): void {
        const loserTiles = losers
            .map((p: IPlayer) => this.battleManager.terrainManager.getTileAt(p.tileXY))
            .filter(t => t != null);
        const emptyTiles = this.battleManager.terrainManager.getUnoccupiedTiles()
            .filter(t => {
                for (var i=0; i<loserTiles.length; i++) {
                    let loserTile = loserTiles[i];
                    if (Helpers.isBetween(t.xy.x, loserTile.xy.x - 1, loserTile.xy.x + 1, BetweenComparisonType.inclusive)
                        && Helpers.isBetween(t.xy.y, loserTile.xy.y - 1, loserTile.xy.y + 1, BetweenComparisonType.inclusive)) {
                        return true;
                    }
                }
                return false;
            });
        if (emptyTiles.length >= losers.length) {
            for (var i=0; i<emptyTiles.length; i++) {
                // TODO: move player to closest tile
                if (i >= losers.length) {
                    break;
                }
                let empty = emptyTiles[i];
                let loser: IPlayer = losers[i];
                WarGame.terrainMgr.setPlayerTile(loser, empty.xy);
            }
        } else {
            // TODO: mark losers as knocked down
        }
    }
}
