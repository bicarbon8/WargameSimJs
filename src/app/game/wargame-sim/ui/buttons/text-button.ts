import { Helpers } from "../../utils/helpers";
import { TextButtonOptions } from "./text-button-options";

export class TextButton extends Phaser.GameObjects.Container {
    private readonly PADDING: number = 5;
    private _text: Phaser.GameObjects.Text;
    private _background: Phaser.GameObjects.Graphics;
    private _options: TextButtonOptions;

    constructor(options: TextButtonOptions) {
        super(options.scene, options.x, options.y);

        this._createGameObject(options);
        const bounds: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
        this.setInteractive(bounds, Helpers.hitAreaCallback);
    }

    get text(): Phaser.GameObjects.Text {
        return this._text;
    }

    get background(): Phaser.GameObjects.Graphics {
        return this._background;
    }

    private _createGameObject(options: TextButtonOptions): void {
        if (!options.text) { options.text = ''; }
        if (!options.cornerRadius) { options.cornerRadius = 0; }
        if (!options.colour) { options.colour = 0.000000; }
        this._options = options;

        const text: string = options.text;
        if (text) {
            const style: Phaser.Types.GameObjects.Text.TextStyle = options.textStyle || { 
                font: '20px Courier', 
                color: '#000000',
            };
            const txt = this.scene.add.text(0, 0, this._options.text, this._options.textStyle);
            txt.setPosition(this.PADDING, this.PADDING);
            if (options.width && options.width < ((this.PADDING * 2) + txt.width)) {
                const scaleX: number = options.width / ((this.PADDING * 2) + txt.width);
                txt.setScale(scaleX);
            }
            this.add(txt);
            this._text = txt;
        }
        options.width = options.width || this._text.width + (this.PADDING * 2);
        options.height = options.height || this._text.height + (this.PADDING * 2);

        const bgColour: number = options.colour;
        if (bgColour) {
            const rect = this.scene.add.graphics({fillStyle: {color: bgColour}});
            rect.fillRoundedRect(0, 0, options.width, options.height, this._options.cornerRadius);
            this.add(rect);
            this.sendToBack(rect);
            this._background = rect;
        }
        this.setSize(options.width, options.height);
    }
}