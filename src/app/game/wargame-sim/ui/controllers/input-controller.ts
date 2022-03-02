export abstract class InputController {
    private _scene: Phaser.Scene;
    
    active: boolean;

    constructor(scene: Phaser.Scene) {
        this._scene = scene;
        this.active = true;
    }

    get game(): Phaser.Game {
        return this.scene?.game;
    }

    get scene(): Phaser.Scene {
        return this._scene;
    }

    get pointer(): Phaser.Input.Pointer {
        return this._scene.input?.activePointer;
    }

    /**
     * returns the world location of the pointer
     */
    getPointerLocation(): Phaser.Math.Vector2 {
        return this.pointer?.positionToCamera(this._scene.cameras?.main) as Phaser.Math.Vector2;
    }

    abstract update(time: number, delta: number): void;
}