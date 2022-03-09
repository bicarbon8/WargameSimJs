import { Helpers } from "../../utils/helpers";
import { CardHeaderOptions } from "./card-header-options";

export class CardHeader extends Phaser.GameObjects.Container {
    private readonly PADDING: number;
    private readonly _options: CardHeaderOptions;
    private _text: Phaser.GameObjects.Text;
    private _backgroundContainer: Phaser.GameObjects.Container;
    
    constructor(options: CardHeaderOptions) {
        super(options.scene, options.x, options.y);
        this.PADDING = 5;
        this._options = options;
        this._createGameObject(options);
    }

    get text(): Phaser.GameObjects.Text {
        return this._text;
    }

    get background(): Phaser.GameObjects.Container {
        return this._backgroundContainer;
    }

    private _createGameObject(options: CardHeaderOptions): void {
        this.setText(options.text, options.textStyle);
        this.setBackground(options.background);
        this._createDebug(options.debug);
    }

    setText(text: string, style?: Phaser.Types.GameObjects.Text.TextStyle): void {
        if (this._text) {
            this._text.destroy();
            this._text = null;
        }
        if (text) {
            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = style || { 
                font: '20px Courier', 
                color: '#000000',
                align: 'center'
            };
            const headerText: Phaser.GameObjects.Text = this.scene.add.text(0, 0, text, textStyle);
            headerText.setOrigin(0.5);
            this._options.width = this._options.width || (headerText.width + (this.PADDING * 2));
            this._options.height = this._options.height || (headerText.height + (this.PADDING * 2));
            const availableWidth: number = this._options.width;
            if (availableWidth < (headerText.width + (this.PADDING * 2))) {
                const scaleX: number = availableWidth / (headerText.width + (this.PADDING * 2));
                headerText.setScale(scaleX);
            }
            this._text = headerText;
            this.add(headerText);
            this.setSize(this._options.width, this._options.height);
        }
    }

    setBackground(options?: Phaser.Types.GameObjects.Graphics.FillStyle): void {
        if (this._backgroundContainer) {
            this._backgroundContainer.destroy();
            this._backgroundContainer = null;
        }
        if (options) {
            const textWidth: number = this._text?.width || 100;
            const textHeight: number = this._text?.height || 20;
            this._options.width = this._options.width || textWidth + (this.PADDING * 2);
            this._options.height = this._options.height || textHeight + (this.PADDING * 2);
            this._options.cornerRadius = this._options.cornerRadius || 0;
            this._backgroundContainer = this.scene.add.container(0, 0);
            const headerBackgroundTop: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: options});
            headerBackgroundTop.fillRoundedRect(-(this._options.width / 2), -(this._options.height / 2), this._options.width, this._options.height, this._options.cornerRadius);
            this._backgroundContainer.add(headerBackgroundTop);
            const headerBackgroundBottom: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: options});
            headerBackgroundBottom.fillRect(-(this._options.width / 2), 0, this._options.width, this._options.height / 2);
            this._backgroundContainer.add(headerBackgroundBottom);
            this.add(this._backgroundContainer);
            this.sendToBack(this._backgroundContainer);
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