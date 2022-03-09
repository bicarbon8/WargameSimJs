import { Helpers } from "../../utils/helpers";
import { TextButtonOptions } from "./text-button-options";

export class TextButton extends Phaser.GameObjects.Container {
    private readonly _options: TextButtonOptions;
    private _text: Phaser.GameObjects.Text;
    private _background: Phaser.GameObjects.Graphics;

    constructor(options: TextButtonOptions) {
        super(options.scene, options.x, options.y);
        this._options = options;
        this._createGameObject(options);
    }

    get text(): Phaser.GameObjects.Text {
        return this._text;
    }

    get background(): Phaser.GameObjects.Graphics {
        return this._background;
    }

    private _createGameObject(options: TextButtonOptions): void {
        this.setText(options.text, options.textStyle);
        this.setBackground(options.background);
        
        if (options.interactive) { this.setInteractive(); }

        this._createDebug(options.debug);
    }

    setText(text: string, style?: Phaser.Types.GameObjects.Text.TextStyle): void {
        if (text) {
            if (this._text) {
                this._text.destroy();
                this._text = null;
            }
            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = style || { 
                font: '20px Courier', 
                color: '#000000',
            };
            const txt = this.scene.add.text(0, 0, text, textStyle);
            txt.setOrigin(0.5);
            this._options.padding = this._options.padding || 0;
            this._options.width = this._options.width || txt.width + (this._options.padding * 2);
            this._options.height = this._options.height || txt.height + (this._options.padding * 2);
            if (this._options.width < ((this._options.padding * 2) + txt.width)) {
                const scaleX: number = this._options.width / ((this._options.padding * 2) + txt.width);
                txt.setScale(scaleX);
            }
            this.add(txt);
            this._text = txt;
            this.setSize(this._options.width, this._options.height);
        }
    }

    setBackground(options?: Phaser.Types.GameObjects.Graphics.FillStyle): void {
        if (this._background) {
            this._background.destroy();
            this._background = null;
        }
        
        if (options) {
            this._options.width = this._options.width || this.scene.game.canvas.width;
            this._options.height = this._options.height || this.scene.game.canvas.height;
            this._options.padding = this._options.padding || 0;
            this._options.cornerRadius = this._options.cornerRadius || 0;
            const rect = this.scene.add.graphics({fillStyle: options});
            if (this._options.cornerRadius > 0) {
                rect.fillRoundedRect(-(this._options.width / 2), -(this._options.height / 2), this._options.width, this._options.height, this._options.cornerRadius);
            } else {
                rect.fillRect(-(this._options.width / 2), -(this._options.height / 2), this._options.width, this._options.height);
            }
            this.add(rect);
            this.sendToBack(rect);
            this._background = rect;
            this.setSize(this._options.width, this._options.height);
        }
    }

    private _createDebug(enabled?: boolean): void {
        if (enabled) {
            const debugBox = this.scene.add.graphics({lineStyle: {color: 0xfc03e8, alpha: 1, width: 1}});
            debugBox.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
            this.add(debugBox);
            this.bringToTop(debugBox);
            Helpers.displayDebug(this.scene, this, 'TextButton');
        }
    }
}