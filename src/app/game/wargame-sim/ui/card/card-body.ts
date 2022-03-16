import { Helpers } from "../../utils/helpers";
import { TextButton } from "../buttons/text-button";
import { TextButtonOptions } from "../buttons/text-button-options";
import { LayoutContent } from "../layout/layout-content";
import { LayoutManager } from "../layout/layout-manager";
import { LayoutManagerOptions } from "../layout/layout-manager-options";
import { CardBodyOptions } from "./card-body-options";

export class CardBody extends LayoutManager {
    private _title: Phaser.GameObjects.Text;
    private _description: Phaser.GameObjects.Text;
    private _buttons: TextButton[];
    private _buttonsLayout: LayoutManager;
    private _backgroundContainer: Phaser.GameObjects.Container;

    private readonly _options: CardBodyOptions;

    constructor(options: CardBodyOptions) {
        const opts: LayoutManagerOptions = {
            scene: options.scene,
            x: options.x,
            y: options.y,
            orientation: 'vertical',
            padding: 5
        };
        super(opts);
        this._options = options;
        this._buttons = [];
        this._createGameObject();
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

    private _createGameObject(): void {
        this._createTitleObject(this._options.title, this._options.titleStyle);
        this._createDescriptionObject(this._options.description, this._options.descriptionStyle);
        this.addButtons(...this._options.buttons || []);
        this._createBackgroundObject(this._options.background);
        this._createDebug(this._options.debug);
    }

    updateTitle(title?: string, style?: Phaser.Types.GameObjects.Text.TextStyle): void {
        if (title) {
            if (this._title) {
                this._title.setText(title);
                this._title.setScale(1);
                const availableWidth: number = this._options.width;
                if (availableWidth < (this._title.width + (this.padding * 2))) {
                    const scaleX: number = availableWidth / (this._title.width + (this.padding * 2));
                    this._title.setScale(scaleX);
                }
            } else {
                this._createTitleObject(title, style);
            }
            this.layout();
            this.resizeBackground(this._options.width, this.height);
        }
    }

    removeTitle(destroy: boolean = true): LayoutContent {
        if (this._title) {
            const obj: LayoutContent = this.removeContent(this._title, destroy);
            this._title = null;
            return obj;
        }
        return null;
    }

    private _createTitleObject(title?: string, style?: Phaser.Types.GameObjects.Text.TextStyle): void {
        if (title) {
            const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = style || { 
                font: '30px Courier', 
                color: '#000000',
            };
            const titleText: Phaser.GameObjects.Text = this.scene.add.text(0, 0, title, titleStyle);
            this._options.width = this._options.width || titleText.width + (this.padding * 2);
            const availableWidth: number = this._options.width;
            let scaleX: number = 1;
            if (availableWidth < (titleText.width + (this.padding * 2))) {
                scaleX = availableWidth / (titleText.width + this.padding * 2);
                titleText.setScale(scaleX);
            }
            this._title = titleText;
            this.addContents(titleText);
        }
    }

    updateDescription(description?: string, style?: Phaser.Types.GameObjects.Text.TextStyle): void {
        if (description) {
            if (this._description) {
                this._description.setText(description);
                this._description.setScale(1);
                const availableWidth: number = this._options.width;
                if (availableWidth < (this._description.width + (this.padding * 2))) {
                    const scaleX: number = availableWidth / (this._description.width + (this.padding * 2));
                    this._description.setScale(scaleX);
                }
            } else {
                this._createDescriptionObject(description, style);
            }
            this.layout();
            this.resizeBackground(this._options.width, this.height);
        }
    }

    removeDescription(destroy: boolean = true): LayoutContent {
        if (this._description) {
            const obj: LayoutContent = this.removeContent(this._description, destroy);
            this._description = null;
            return obj;
        }
        return null;
    }

    private _createDescriptionObject(description?: string, style?: Phaser.Types.GameObjects.Text.TextStyle): void {
        if (description) {
            const descStyle: Phaser.Types.GameObjects.Text.TextStyle = style || { 
                font: '20px Courier', 
                color: '#000000',
            };
            const descText: Phaser.GameObjects.Text = this.scene.add.text(0, 0, description, descStyle);
            this._options.width = this._options.width || descText.width + (this.padding * 2);
            const availableWidth: number = this._options.width;
            let scaleX: number = 1;
            if (availableWidth < (descText.width + (this.padding * 2))) {
                scaleX = availableWidth / (descText.width + (this.padding * 2));
                descText.setScale(scaleX);
            }
            this._description = descText;
            this.addContents(descText);
        }
    }

    addButtons(...buttonOpts: TextButtonOptions[]): void {
        if (!this._buttonsLayout) {
            this._buttonsLayout = new LayoutManager({scene: this.scene, orientation: 'horizontal', padding: this._options.buttonSpacing});
            this.addContents(this._buttonsLayout);
        }
        if (buttonOpts) {
            for (var i=0; i<buttonOpts.length; i++) {
                let opts: TextButtonOptions = buttonOpts[i];
                opts.scene = this.scene;
                let button: TextButton = new TextButton(opts);
                this._buttonsLayout.addContents(button);
                this._buttons.push(button);
            }
            this._options.width = this._options.width || this._buttonsLayout.width + (this.padding * 2);
            const availableWidth: number = this._options.width;
            let scaleX: number = 1;
            if (availableWidth < (this._buttonsLayout.width + (this.padding * 2))) {
                scaleX = availableWidth / (this._buttonsLayout.width + (this.padding * 2));
                this._buttonsLayout.setScale(scaleX);
            }
            this.layout();
            this.resizeBackground(this._options.width, this.height);
        }
    }

    removeButton(index: number, destroy?: boolean): TextButton {
        if (index != null && index < this._buttons.length) {
            let button: TextButton = this._buttons.splice(index, 1)[0];
            return this._buttonsLayout.removeContent(button, destroy) as TextButton;
        }
    }

    removeAllButtons(destroy: boolean = true): TextButton[] {
        const buttons: TextButton[] = this._buttonsLayout.removeAllContent(destroy) as TextButton[];
        this._buttons = [];
        this.layout();
        this.resizeBackground(this._options.width, this.height);
        return buttons;
    }

    resizeBackground(width: number, height: number): void {
        this._options.width = width;
        this._options.height = height;
        this._createBackgroundObject(this._options.background);
    }

    private _createBackgroundObject(options?: Phaser.Types.GameObjects.Graphics.FillStyle): void {
        if (!this._backgroundContainer) {
            this._backgroundContainer = this.scene.add.container(0, 0);
            this.add(this._backgroundContainer);
            this.sendToBack(this._backgroundContainer);
        }
        this._backgroundContainer.removeAll(true);
        if (options) {
            if (this._options.cornerRadius != null) {
                const backgroundTop: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: options});
                backgroundTop.fillRect(-(this._options.width / 2), -(this.height / 2), this._options.width, this._options.cornerRadius);
                this._backgroundContainer.add(backgroundTop);
                const backgroundBottom: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: options});
                backgroundBottom.fillRoundedRect(-(this._options.width / 2), -(this.height / 2), this._options.width, this.height, this._options.cornerRadius);
                this._backgroundContainer.add(backgroundBottom);
            } else {
                const background: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: options});
                background.fillRect(-(this._options.width / 2), -(this.height / 2), this._options.width, this.height);
            }
        }
    }

    private _createDebug(enabled?: boolean): void {
        if (enabled) {
            const debugBox = this.scene.add.graphics({lineStyle: {color: 0xfc03e8, alpha: 1, width: 1}});
            debugBox.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
            this.add(debugBox);
            this.bringToTop(debugBox);
            Helpers.displayDebug(this.scene, this, 'CardBody');
        }
    }
}