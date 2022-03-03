import { CardImageOptions } from "./card-image-options";

export class CardImage extends Phaser.GameObjects.Container {
    private _sprite: Phaser.GameObjects.Sprite;
    private _background: Phaser.GameObjects.Graphics;

    constructor(options: CardImageOptions) {
        super(options.scene, options.x, options.y);

        this._createGameObject(options);
    }

    get sprite(): Phaser.GameObjects.Sprite {
        return this._sprite;
    }

    get background(): Phaser.GameObjects.Graphics {
        return this._background;
    }

    private _createGameObject(options: CardImageOptions): void {
        const key: string = options.spriteKey;
        if (key) {
            const index: number = options.spriteIndex || 0;
            const sprite: Phaser.GameObjects.Sprite = this.scene.add.sprite(0, 0, key, index);
            const scaleX: number = options.width / sprite.width;
            const height: number = options.height || options.width;
            const scaleY: number = height / sprite.height;
            const scale: number = (scaleX < scaleY) ? scaleX : scaleY;
            sprite.setScale(scale);
            sprite.setPosition(((sprite.width * scale) / 2), ((sprite.height * scale) / 2));
            this.add(sprite);
            this._sprite = sprite;
        }
        const bgColour: number = options.backgroundColor;
        const height: number = (this._sprite?.height * this._sprite.scaleY) || options.width;
        if (bgColour) {
            const background: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: bgColour}});
            background.fillRect(0, 0, options.width, height);
            this.add(background);
            this.sendToBack(background);
            this._background = background;
        }
        this.setSize(options.width, height);
    }
}