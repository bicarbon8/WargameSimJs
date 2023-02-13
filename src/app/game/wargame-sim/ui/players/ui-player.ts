import { LinearLayout } from "phaser-ui-components";
import { IPlayer } from "../../players/i-player";
import { PlayerSpritesheetMapping } from "./player-spritesheet-mappings";
import { Rand } from "../../utils/rand";
import { WarGame } from "../../war-game";
import { Logging } from "../../utils/logging";

export type UiPlayerOptions = {
    spriteMapping: PlayerSpritesheetMapping;
    playerId: string;
    x: number;
    y: number;
}

export class UiPlayer extends Phaser.GameObjects.Container {
    private readonly _spriteMapping: PlayerSpritesheetMapping;
    private readonly _playerId: string;
    private _woundsIndicator: LinearLayout;

    constructor(scene: Phaser.Scene, options: UiPlayerOptions) {
        Logging.log('info', 'creating ui-player:', {options});
        super(scene, options.x + 16, options.y + 16);
        this._playerId = options.playerId;
        this._spriteMapping = options.spriteMapping;

        this._createGameObject();
        this.scene.add.existing(this);
    }

    get player(): IPlayer {
        return WarGame.playerMgr.getPlayerById(this._playerId);
    }
    
    private _createGameObject(): void {
        this.setDepth(WarGame.DEPTH.PLAYER);

        const sprite: Phaser.GameObjects.Sprite = this.scene.add.sprite(0, 0, 'players', this._spriteMapping.front);
        sprite.setOrigin(0.5);
        this.add(sprite);

        this._createTeamBackground();

        this.setSize(32, 32);
        this.setInteractive();

        this._createRemainingWoundsIndicator();
    }

    private _createTeamBackground(): void {
        if (this.player.teamId) {
            const team = WarGame.teamMgr.getTeamById(this.player.teamId);
            const circle: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: Rand.colorNumber(team.color)}});
            circle.fillCircle(0, 0, 16);
            this.add(circle);
            this.sendToBack(circle);
        }
    }

    private _createRemainingWoundsIndicator(): void {
        this._woundsIndicator = new LinearLayout(this.scene, {
            y: -20,
            orientation: 'horizontal',
            padding: 2
        });
        this._woundsIndicator.setVisible(false); // only visible on mouseover player
        this.add(this._woundsIndicator);
        for (var i=0; i<this.player.stats.wounds; i++) {
            let square: Phaser.GameObjects.Graphics = this.scene.add.graphics({fillStyle: {color: 0xff6060}, lineStyle: {color: 0x000000, width: 1}});
            square.fillRect(-2, -2, 4, 4);
            square.strokeRect(-2, -2, 4, 4);
            let squareContainer: Phaser.GameObjects.Container = this.scene.add.container(0, 0, [square]);
            squareContainer.setSize(4, 4);
            this._woundsIndicator.addContents(squareContainer);
        }

        this.on(Phaser.Input.Events.POINTER_OVER, () => this._woundsIndicator.setVisible(true))
            .on(Phaser.Input.Events.POINTER_OUT, () => this._woundsIndicator.setVisible(false));
    }
}