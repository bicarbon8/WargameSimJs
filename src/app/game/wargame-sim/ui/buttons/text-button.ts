import { TextButtonOptions } from "./text-button-options";

export class TextButton extends Phaser.GameObjects.Container {
    private _text: Phaser.GameObjects.Text;
    private _background: Phaser.GameObjects.Graphics;

    constructor(options: TextButtonOptions) {
        super(options.scene, options.x, options.y);

        this._createGameObject(options);
    }

    get text(): Phaser.GameObjects.Text {
        return this._text;
    }

    get background(): Phaser.GameObjects.Graphics {
        return this._background;
    }

    private _createGameObject(options: TextButtonOptions): void {
        this._createText(options);
        
        options.width = options.width || this.scene.game.canvas.width;
        options.height = options.height || this.scene.game.canvas.height;
        options.padding = options.padding || 0;
        this.setSize(options.width, options.height);

        this._createBackground(options);
        
        if (options.interactive) { this.setInteractive(); }

        this._createDebug(options);
    }

    private _createText(options: TextButtonOptions): void {
        const text: string = options.text;
        if (text) {
            const style: Phaser.Types.GameObjects.Text.TextStyle = options.textStyle || { 
                font: '20px Courier', 
                color: '#000000',
            };
            const txt = this.scene.add.text(0, 0, text, style);
            txt.setOrigin(0.5);
            options.padding = options.padding || 0;
            options.width = options.width || txt.width + (options.padding * 2);
            options.height = options.height || txt.height + (options.padding * 2);
            if (options.width < ((options.padding * 2) + txt.width)) {
                const scaleX: number = options.width / ((options.padding * 2) + txt.width);
                txt.setScale(scaleX);
            }
            this.add(txt);
            this._text = txt;
        }
    }

    private _createBackground(options: TextButtonOptions): void {
        if (!options.cornerRadius) { options.cornerRadius = 0; }
        if (!options.colour) { options.colour = 0.000000; }

        const bgColour: number = options.colour;
        if (bgColour) {
            const rect = this.scene.add.graphics({fillStyle: {color: bgColour}});
            rect.fillRoundedRect(-(options.width / 2), -(options.height / 2), options.width, options.height, options.cornerRadius);
            this.add(rect);
            this.sendToBack(rect);
            this._background = rect;
        }
    }

    private _createDebug(options: TextButtonOptions): void {
        if (options.debug) {
            const debugBox = this.scene.add.graphics({lineStyle: {color: 0xfc03e8, alpha: 1, width: 1}});
            debugBox.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
            this.add(debugBox);
            this.bringToTop(debugBox);

            const debugText = this.scene.add.text(0, 0, `w:${this.width.toFixed(1)};h:${this.height.toFixed(1)}`, { 
                font: '40px Courier', 
                color: '#fc03e8'
            });
            debugText.setOrigin(0.5);
            debugText.setDepth(1000);
            debugText.setVisible(false);
            this.setInteractive().on(Phaser.Input.Events.POINTER_OVER, (pointer: Phaser.Input.Pointer) => {
                debugText.setVisible(true);
            }, this).on(Phaser.Input.Events.POINTER_OUT, () => {
                debugText.setVisible(false);
            });
        }
    }
}