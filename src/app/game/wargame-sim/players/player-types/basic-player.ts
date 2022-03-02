import { BasePlayer } from "../base-player";

export class BasicPlayer extends BasePlayer {
    constructor(scene: Phaser.Scene) {
        super({
            name: 'basic', 
            scene: scene,
            stats: {
                mele: 3,
                ranged: 5,
                strength: 3,
                defense: 5,
                attacks: 1,
                wounds: 2,
                courage: 3,
                might: 0,
                will: 0,
                fate: 0,
                move: 5,
                shoot: 10,
                cost: 15
            }
        });
    }
}