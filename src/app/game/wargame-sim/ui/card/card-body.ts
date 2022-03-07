import { TextButton } from "../buttons/text-button";
import { TextButtonOptions } from "../buttons/text-button-options";
import { LayoutManager } from "../layout/layout-manager";
import { LayoutManagerOptions } from "../layout/layout-manager-options";
import { CardBodyOptions } from "./card-body-options";

export class CardBody extends LayoutManager {
    private _title: Phaser.GameObjects.Text;
    private _description: Phaser.GameObjects.Text;
    private _buttons: TextButton[];
    private _backgroundContainer: Phaser.GameObjects.Container;

    constructor(options: CardBodyOptions) {
        const opts: LayoutManagerOptions = {
            scene: options.scene,
            x: options.x,
            y: options.y,
            orientation: 'vertical',
            padding: 5
        };
        super(opts);
        this._buttons = [];
        this._createGameObject(options);
    }

    get title(): Phaser.GameObjects.Text {
        return this._title;
    }

    get description(): Phaser.GameObjects.Text {
        return this._description;
    }

    get buttons(): TextButton[] {
        return this._buttons;
    }

    get background(): Phaser.GameObjects.Container {
        return this._backgroundContainer;
    }

    private _createGameObject(options: CardBodyOptions): void {
        this._createTitle(options);
        this._createDescription(options);
        this._createButtons(options);
        this._createBackground(options);
        this._createDebug(options);
    }

    private _createTitle(options: CardBodyOptions): void {
        const title: string = options.title;
        if (title) {
            const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = options.titleStyle || { 
                font: '30px Courier', 
                color: '#000000',
            };
            const titleText: Phaser.GameObjects.Text = this.scene.add.text(0, 0, title, titleStyle);
            const availableWidth: number = options.width - (this.padding * 2);
            let scaleX: number = 1;
            if (availableWidth < titleText.width) {
                scaleX = availableWidth / titleText.width;
                titleText.setScale(scaleX);
            }
            this._title = titleText;
            this.addContents(titleText);
        }
    }

    private _createDescription(options: CardBodyOptions): void {
        const description: string = options.description;
        if (description) {
            const descStyle: Phaser.Types.GameObjects.Text.TextStyle = options.titleStyle || { 
                font: '20px Courier', 
                color: '#000000',
            };
            const descText: Phaser.GameObjects.Text = this.scene.add.text(0, 0, description, descStyle);
            const availableWidth: number = options.width - (this.padding * 2);
            let scaleX: number = 1;
            if (availableWidth < descText.width) {
                scaleX = availableWidth / descText.width;
                descText.setScale(scaleX);
            }
            this._description = descText;
            this.addContents(descText);
        }
    }

    private _createButtons(options: CardBodyOptions): void {
        const buttonOpts: TextButtonOptions[] = options.buttons;
        if (buttonOpts) {
            const buttonsManager: LayoutManager = new LayoutManager({scene: this.scene, orientation: 'horizontal', padding: options.buttonSpacing});
            for (var i=0; i<buttonOpts.length; i++) {
                let opts: TextButtonOptions = buttonOpts[i];
                opts.scene = this.scene;
                let button: TextButton = new TextButton(opts);
                buttonsManager.addContents(button);
                this._buttons.push(button);
            }
            const availableWidth: number = options.width - (this.padding * 2);
            let scaleX: number = 1;
            if (availableWidth < buttonsManager.width) {
                scaleX = availableWidth / buttonsManager.width;
                buttonsManager.setScale(scaleX);
            }
            this.addContents(buttonsManager);
        }
    }

    private _createBackground(options: CardBodyOptions): void {
        const bgColour: number = options.backgroundColor;
        if (bgColour) {
            const cornerRadius: number = options.cornerRadius || 0;
            this._backgroundContainer = this.scene.add.container(0, 0);
            const headerBackgroundTop: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: bgColour}});
            headerBackgroundTop.fillRect(-(options.width / 2), -(this.height / 2), options.width, cornerRadius);
            this._backgroundContainer.add(headerBackgroundTop);
            const headerBackgroundBottom: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: bgColour}});
            headerBackgroundBottom.fillRoundedRect(-(options.width / 2), -(this.height / 2), options.width, this.height, cornerRadius);
            this._backgroundContainer.add(headerBackgroundBottom);
            this.add(this._backgroundContainer);
            this.sendToBack(this._backgroundContainer);
        }
    }

    private _createDebug(options: CardBodyOptions): void {
        if (options.debug) {
            const debugBox = this.scene.add.graphics({lineStyle: {color: 0xfc03e8, alpha: 1, width: 1}});
            debugBox.strokeRect(-(options.width / 2), -(this.height / 2), options.width, this.height);
            this.add(debugBox);
            this.bringToTop(debugBox);

            const debugText = this.scene.add.text(0, 0, `w:${options.width.toFixed(1)};h:${this.height.toFixed(1)}`, { 
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