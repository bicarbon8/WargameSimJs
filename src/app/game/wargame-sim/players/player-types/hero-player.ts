import { BasePlayer } from "../base-player";

export class HeroPlayer extends BasePlayer {
    constructor() {
        super('hero', {
            mele: 6,
            ranged: 3,
            strength: 5,
            defense: 7,
            attacks: 2,
            wounds: 3,
            courage: 6,
            might: 2,
            will: 2,
            fate: 2,
            move: 6,
            shoot: 15,
            cost: 50
        });
    }
}