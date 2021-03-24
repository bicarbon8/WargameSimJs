import { Dice } from "../utils/dice";
import { AttackWounds } from "./attack-wounds";
import { DefenceWounds } from "./defence-wounds";
import { DiceRollWounds } from "./dice-roll-wounds";

export module WoundChart {
    var attackWounds: AttackWounds = {
        str_1: { 
            def_1: {minRollsToWound: [4]},
            def_2: {minRollsToWound: [5]},
            def_3: {minRollsToWound: [5]},
            def_4: {minRollsToWound: [6]},
            def_5: {minRollsToWound: [6]},
            def_6: {minRollsToWound: [6, 4]},
            def_7: {minRollsToWound: [6, 5]},
            def_8: {minRollsToWound: [6, 6]}
        },
        str_2: { 
            def_1: {minRollsToWound: [4]},
            def_2: {minRollsToWound: [4]},
            def_3: {minRollsToWound: [5]},
            def_4: {minRollsToWound: [5]},
            def_5: {minRollsToWound: [6]},
            def_6: {minRollsToWound: [6]},
            def_7: {minRollsToWound: [6, 4]},
            def_8: {minRollsToWound: [6, 5]},
            def_9: {minRollsToWound: [6, 6]}
        },
        str_3: { 
            def_1: {minRollsToWound: [3]},
            def_2: {minRollsToWound: [4]},
            def_3: {minRollsToWound: [4]},
            def_4: {minRollsToWound: [5]},
            def_5: {minRollsToWound: [5]},
            def_6: {minRollsToWound: [6]},
            def_7: {minRollsToWound: [6]},
            def_8: {minRollsToWound: [6, 4]},
            def_9: {minRollsToWound: [6, 5]},
            def_10: {minRollsToWound: [6, 6]}
        },
        str_4: { 
            def_1: {minRollsToWound: [3]},
            def_2: {minRollsToWound: [3]},
            def_3: {minRollsToWound: [4]},
            def_4: {minRollsToWound: [4]},
            def_5: {minRollsToWound: [5]},
            def_6: {minRollsToWound: [5]},
            def_7: {minRollsToWound: [6]},
            def_8: {minRollsToWound: [6]},
            def_9: {minRollsToWound: [6, 4]},
            def_10: {minRollsToWound: [6, 5]}
        },
        str_5: { 
            def_1: {minRollsToWound: [3]},
            def_2: {minRollsToWound: [3]},
            def_3: {minRollsToWound: [3]},
            def_4: {minRollsToWound: [4]},
            def_5: {minRollsToWound: [4]},
            def_6: {minRollsToWound: [5]},
            def_7: {minRollsToWound: [5]},
            def_8: {minRollsToWound: [6]},
            def_9: {minRollsToWound: [6]},
            def_10: {minRollsToWound: [6, 4]}
        },
        str_6: { 
            def_1: {minRollsToWound: [3]},
            def_2: {minRollsToWound: [3]},
            def_3: {minRollsToWound: [3]},
            def_4: {minRollsToWound: [3]},
            def_5: {minRollsToWound: [4]},
            def_6: {minRollsToWound: [4]},
            def_7: {minRollsToWound: [5]},
            def_8: {minRollsToWound: [5]},
            def_9: {minRollsToWound: [6]},
            def_10: {minRollsToWound: [6]}
        },
        str_7: { 
            def_1: {minRollsToWound: [3]},
            def_2: {minRollsToWound: [3]},
            def_3: {minRollsToWound: [3]},
            def_4: {minRollsToWound: [3]},
            def_5: {minRollsToWound: [3]},
            def_6: {minRollsToWound: [4]},
            def_7: {minRollsToWound: [4]},
            def_8: {minRollsToWound: [5]},
            def_9: {minRollsToWound: [5]},
            def_10: {minRollsToWound: [6]}
        },
        str_8: { 
            def_1: {minRollsToWound: [3]},
            def_2: {minRollsToWound: [3]},
            def_3: {minRollsToWound: [3]},
            def_4: {minRollsToWound: [3]},
            def_5: {minRollsToWound: [3]},
            def_6: {minRollsToWound: [3]},
            def_7: {minRollsToWound: [4]},
            def_8: {minRollsToWound: [4]},
            def_9: {minRollsToWound: [5]},
            def_10: {minRollsToWound: [5]}
        },
        str_9: { 
            def_1: {minRollsToWound: [3]},
            def_2: {minRollsToWound: [3]},
            def_3: {minRollsToWound: [3]},
            def_4: {minRollsToWound: [3]},
            def_5: {minRollsToWound: [3]},
            def_6: {minRollsToWound: [3]},
            def_7: {minRollsToWound: [3]},
            def_8: {minRollsToWound: [4]},
            def_9: {minRollsToWound: [4]},
            def_10: {minRollsToWound: [5]}
        },
        str_10: { 
            def_1: {minRollsToWound: [3]},
            def_2: {minRollsToWound: [3]},
            def_3: {minRollsToWound: [3]},
            def_4: {minRollsToWound: [3]},
            def_5: {minRollsToWound: [3]},
            def_6: {minRollsToWound: [3]},
            def_7: {minRollsToWound: [3]},
            def_8: {minRollsToWound: [3]},
            def_9: {minRollsToWound: [4]},
            def_10: {minRollsToWound: [4]}
        }
    };

    export function doesWound(atk: number, def: number): boolean {
        let defenceWounds: DefenceWounds = attackWounds[`atk_${atk}`];
        if (defenceWounds) {
            let diceRollWounds: DiceRollWounds = defenceWounds[`def_${def}`];
            if (diceRollWounds) {
                let diceRolls: number[] = Dice.roll(diceRollWounds.minRollsToWound.length);
                for (var i=0; i<diceRolls.length; i++) {
                    let roll: number = diceRolls[i];
                    let success: boolean = true;
                    for (var j=0; j<diceRollWounds.minRollsToWound.length; j++) {
                        let min: number = diceRollWounds.minRollsToWound[j];
                        if (roll < min) {
                            success = false;
                        }
                    }
                    if (!success) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
}
