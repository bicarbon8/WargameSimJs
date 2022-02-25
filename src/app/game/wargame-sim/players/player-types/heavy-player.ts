import { BasePlayer } from "../base-player";

export class HeavyPlayer extends BasePlayer {
    constructor() {
        super('heavy', {
            mele: 5,
            ranged: 5,
            strength: 5,
            defense: 7,
            attacks: 1,
            wounds: 3,
            courage: 5,
            might: 1,
            will: 1,
            fate: 0,
            move: 3,
            shoot: 6,
            cost: 20
        });
    }
}