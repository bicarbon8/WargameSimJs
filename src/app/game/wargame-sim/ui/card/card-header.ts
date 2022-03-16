import { Helpers } from "../../utils/helpers";
import { CardHeaderOptions } from "./card-header-options";

export class CardHeader extends Phaser.GameObjects.Container {
    private readonly _options: CardHeaderOptions;
    private _text: Phaser.GameObjects.Text;
    private _backgroundContainer: Phaser.GameObjects.Container;
    
    constructor(options: CardHeaderOptions) {
        super(options.scene, options.x, options.y);
        this._options = options;
        this._createGameObject();
    }

    get text(): Phaser.GameObjects.Text {
        return this._text;
    }

    get background(): Phaser.GameObjects.Container {
        return this._backgroundContainer;
    }

    private _createGameObject(): void {
        this._options.padding = this._options.padding || 5;
        this._createTextObject(this._options.text, this._options.textStyle);
        this._createBackgroundObject(this._options.background);
        this._createDebug(this._options.debug);
    }

    updateText(text?: string, style?: Phaser.Types.GameObjects.Text.TextStyle): void {
        if (text) {
            if (this._text) {
                this._text.setText(text);
                this._text.setScale(1);
                const availableWidth: number = this._options.width;
                if (availableWidth < (this._text.width + (this._options.padding * 2))) {
                    const scaleX: number = availableWidth / (this._text.width + (this._options.padding * 2));
                    this._text.setScale(scaleX);
                }
            } else {
                this._createTextObject(text, style);
            }
            this.resizeBackground(this._options.width, this._text.height);
        }
    }

    removeText(destroy: boolean = true): Phaser.GameObjects.Text {
        const obj: Phaser.GameObjects.Text = this._text;
        this.remove(this._text, destroy);
        this._text = null;
        return obj;
    }

    resizeBackground(width: number, height: number): void {
        this._options.width = width;
        this._options.height = height;
        this._createBackgroundObject(this._options.background);
    }

    removeBackground(): void {
        if (this._backgroundContainer) {
            this._backgroundContainer.removeAll(true);
        }
    }

    private _createTextObject(text?: string, style?: Phaser.Types.GameObjects.Text.TextStyle): void {
        if (text) {
            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = style || { 
                font: '20px Courier', 
                color: '#000000',
                align: 'center'
            };
            const headerText: Phaser.GameObjects.Text = this.scene.add.text(0, 0, text, textStyle);
            headerText.setOrigin(0.5);
            this._options.width = this._options.width || (headerText.width + (this._options.padding * 2));
            this._options.height = this._options.height || (headerText.height + (this._options.padding * 2));
            const availableWidth: number = this._options.width;
            if (availableWidth < (headerText.width + (this._options.padding * 2))) {
                const scaleX: number = availableWidth / (headerText.width + (this._options.padding * 2));
                headerText.setScale(scaleX);
            }
            this._text = headerText;
            this.add(headerText);
            this.setSize(this._options.width, this._options.height);
        }
    }

    private _createBackgroundObject(options?: Phaser.Types.GameObjects.Graphics.FillStyle): void {
        if (!this._backgroundContainer) {
            this._backgroundContainer = this.scene.add.container(0, 0);
            this.add(this._backgroundContainer);
            this.sendToBack(this._backgroundContainer);
        }
        this._backgroundContainer.removeAll(true);
        if (options) {
            const textWidth: number = this._text?.width || 100;
            const textHeight: number = this._text?.height || 20;
            this._options.width = this._options.width || textWidth + (this._options.padding * 2);
            this._options.height = this._options.height || textHeight + (this._options.padding * 2);
            this._options.cornerRadius = this._options.cornerRadius || 0;
            
            const headerBackgroundTop: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: options});
            headerBackgroundTop.fillRoundedRect(-(this._options.width / 2), -(this._options.height / 2), this._options.width, this._options.height, this._options.cornerRadius);
            this._backgroundContainer.add(headerBackgroundTop);
            const headerBackgroundBottom: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: options});
            headerBackgroundBottom.fillRect(-(this._options.width / 2), 0, this._options.width, this._options.height / 2);
            this._backgroundContainer.add(headerBackgroundBottom);
            
            this.setSize(this._options.width, this._options.height);
        }
    }

    private _createDebug(enabled?: boolean): void {
        if (enabled) {
            const debugBox = this.scene.add.graphics({lineStyle: {color: 0xfc03e8, alpha: 1, width: 1}});
            debugBox.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
            this.add(debugBox);
            this.bringToTop(debugBox);
            Helpers.displayDebug(this.scene, this, 'CardHeader');
        }
    }
}