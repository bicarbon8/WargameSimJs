import { environment } from "src/environments/environment";
import { PlayerSpritesheetMappings } from "../../players/player-types/player-spritesheet-mappings";
import { Team } from "../../teams/team";
import { WarGame } from "../../war-game";
import { Card } from "../card/card";
import { TextButton } from "../buttons/text-button";
import { BasicPlayer } from "../../players/player-types/basic-player";
import { HeroPlayer } from "../../players/player-types/hero-player";
import { LightPlayer } from "../../players/player-types/light-player";
import { HeavyPlayer } from "../../players/player-types/heavy-player";
import { IPlayer } from "../../players/i-player";
import { Constants } from "../../utils/constants";
import { LayoutManager } from "../layout/layout-manager";
import { GridLayout } from "../layout/grid-layout";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'pick-teams-scene'
};

export class PickTeamsScene extends Phaser.Scene {
    private _width: number;
    private _height: number;
    private _currentTeamIndex: number;
    private _currentTeam: Team;
    private _teamRemainingPointsText: Phaser.GameObjects.Text;
    private _layout: LayoutManager;
    private _startButton: TextButton;
    private _removeTeamLayout: LayoutManager;
    private _addTeamLayout: LayoutManager;
    private _playerCardsLayout: LayoutManager;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
        this._currentTeamIndex = 0;
        // create starting team
        this._currentTeam = new Team({
            name: `Team ${WarGame.teamMgr.teams.length}`,
            points: 100
        });
        WarGame.teamMgr.addTeam(this._currentTeam);
    }

    preload(): void {
        this.load.spritesheet('players', `${environment.baseUrl}/assets/sprites/player/sprite.png`, {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 96
        }); // 12w by 8h
    }

    create(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this.cameras.main.centerOn(0, 0);

        this._createLayoutManager();
        this._createTitleText();
        this._createTeamPickerButtons();
        this._createStartButton();

        if (this._layout.height > this._height) {
            const scaleY: number = this._height / this._layout.height;
            this._layout.setScale(scaleY);
        }

        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            let world: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            console.info(`screen: ${pointer.x.toFixed(0)},${pointer.y.toFixed(0)}; world: ${world.x.toFixed(0)},${world.y.toFixed(0)}`);
        });
    }

    update(time: number, delta: number): void {
        if (WarGame.teamMgr.teams[this._currentTeamIndex].id !== this._currentTeam?.id) {
            this._currentTeam = WarGame.teamMgr.teams[this._currentTeamIndex];
        }
        this._teamRemainingPointsText.setText(`'${this._currentTeam.name}' remaining points: ${this._currentTeam.remainingPoints}`);
        if (WarGame.teamMgr.teams.length > 1) {
            if (WarGame.teamMgr.teams.every((t: Team) => t.getPlayers().length > 0)) {
                this._startButton.setAlpha(1);
                this._startButton.text.setColor('#ffffff');
            }

            this._removeTeamLayout.setAlpha(1);
        } else {
            this._removeTeamLayout.setAlpha(0.25);
        }
        if (this._currentTeam.getPlayers().length > 0) {
            this._addTeamLayout.setAlpha(1);
        } else {
            this._addTeamLayout.setAlpha(0.25);
        }
    }

    private _createLayoutManager(): void {
        this._layout = new LayoutManager({scene: this, orientation: 'vertical', padding: 10});
        this._layout.setDepth(Constants.DEPTH_MENU);
        this.add.existing(this._layout);
    }

    private _createTitleText(): void {
        const title: Phaser.GameObjects.Text = this.add.text(0, 0, 'War Game\nSimulator!', {font: '60px Courier', color: '#6666ff', stroke: '#000000', strokeThickness: 4, align: 'center'});
        this._layout.addContents(title);
    }

    private _createTeamPickerButtons(): void {
        const chooseTeamText = new TextButton({
            scene: this,
            text: '~~~~~ Choose your Teams ~~~~~',
            padding: 10,
            background: {color: 0x8d8d8d},
            cornerRadius: 5
        });
        this._layout.addContents(chooseTeamText);

        this._teamRemainingPointsText = this.add.text(0, chooseTeamText.y + chooseTeamText.height, `'${this._currentTeam.name}' remaining points: ${this._currentTeam.remainingPoints}`);
        this._teamRemainingPointsText.setOrigin(0.5)
        this._teamRemainingPointsText.setColor('#000000');

        this._layout.addContents(chooseTeamText, this._teamRemainingPointsText);

        this._playerCardsLayout = new LayoutManager({
            scene: this,
            orientation: 'horizontal',
            padding: 5
        });
        this._layout.addContents(this._playerCardsLayout);
        
        const cardWidth: number = (this.game.canvas.width - (5 * 5)) / 4;

        const basicPlayer = new BasicPlayer(this);
        const basicPlayerCard = new Card({
            scene: this,
            width: cardWidth,
            header: {
                text: 'Basic',
                background: {color: 0x808080},
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.basic.front,
                backgroundColor: 0xc0c0c0
            },
            body: {
                title: `Cost: ${basicPlayer.stats.cost}`,
                background: {color: 0x808080},
                cornerRadius: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        this._playerCardsLayout.addContents(basicPlayerCard);
        basicPlayerCard.cardBody.buttons[0];
        basicPlayerCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const basicPlayers: IPlayer[] = this._currentTeam.getPlayersByName(basicPlayer.name);
            if (basicPlayers.length > 0) {
                this._currentTeam.removePlayer(basicPlayers[0]);
                basicPlayerCard.cardBody.buttons[1].text.setText(` ${this._currentTeam.getPlayersByName(basicPlayer.name).length} `);
            }
        }, this);
        basicPlayerCard.cardBody.buttons[2];
        basicPlayerCard.cardBody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._currentTeam.remainingPoints >= basicPlayer.stats.cost) {
                this._currentTeam.addPlayer(new BasicPlayer(this));
                basicPlayerCard.cardBody.buttons[1].text.setText(` ${this._currentTeam.getPlayersByName(basicPlayer.name).length} `);
            }
        }, this);

        const heroPlayer: HeroPlayer = new HeroPlayer(this);
        const heroPlayerCard = new Card({
            scene: this,
            width: cardWidth,
            header: {
                scene: this,
                text: 'Hero',
                background: {color: 0x808080},
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.hero.front,
                backgroundColor: 0xc0c0c0,
            },
            body: {
                title: `Cost: ${heroPlayer.stats.cost}`,
                background: {color: 0x808080},
                cornerRadius: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        this._playerCardsLayout.addContents(heroPlayerCard);
        heroPlayerCard.cardBody.buttons[0];
        heroPlayerCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const heroPlayers: IPlayer[] = this._currentTeam.getPlayersByName(heroPlayer.name);
            if (heroPlayers.length > 0) {
                this._currentTeam.removePlayer(heroPlayers[0]);
                heroPlayerCard.cardBody.buttons[1].text.setText(` ${this._currentTeam.getPlayersByName(heroPlayer.name).length} `);
            }
        }, this);
        heroPlayerCard.cardBody.buttons[2];
        heroPlayerCard.cardBody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._currentTeam.remainingPoints >= heroPlayer.stats.cost) {
                this._currentTeam.addPlayer(new HeroPlayer(this));
                heroPlayerCard.cardBody.buttons[1].text.setText(` ${this._currentTeam.getPlayersByName(heroPlayer.name).length} `);
            }
        }, this);

        const lightPlayer: LightPlayer = new LightPlayer(this);
        const lightPlayerCard = new Card({
            scene: this,
            width: cardWidth,
            header: {
                scene: this,
                text: 'Light',
                background: {color: 0x808080},
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.light.front,
                backgroundColor: 0xc0c0c0,
            },
            body: {
                title: `Cost: ${new LightPlayer(this).stats.cost}`,
                background: {color: 0x808080},
                cornerRadius: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        this._playerCardsLayout.addContents(lightPlayerCard);
        lightPlayerCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const lightPlayers: IPlayer[] = this._currentTeam.getPlayersByName(lightPlayer.name);
            if (lightPlayers.length > 0) {
                this._currentTeam.removePlayer(lightPlayers[0]);
                lightPlayerCard.cardBody.buttons[1].text.setText(` ${this._currentTeam.getPlayersByName(lightPlayer.name).length} `);
            }
        }, this);
        lightPlayerCard.cardBody.buttons[2];
        lightPlayerCard.cardBody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._currentTeam.remainingPoints >= lightPlayer.stats.cost) {
                this._currentTeam.addPlayer(new LightPlayer(this));
                lightPlayerCard.cardBody.buttons[1].text.setText(` ${this._currentTeam.getPlayersByName(lightPlayer.name).length} `);
            }
        }, this);

        const heavyPlayer: HeavyPlayer = new HeavyPlayer(this);
        const heavyPlayerCard = new Card({
            scene: this,
            width: cardWidth,
            header: {
                scene: this,
                text: 'Heavy',
                background: {color: 0x808080},
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.heavy.front,
                backgroundColor: 0xc0c0c0,
            },
            body: {
                title: `Cost: ${new HeavyPlayer(this).stats.cost}`,
                background: {color: 0x808080},
                cornerRadius: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        background: {color: 0x606060},
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        this._playerCardsLayout.addContents(heavyPlayerCard);
        heavyPlayerCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const heavyPlayers: IPlayer[] = this._currentTeam.getPlayersByName(heavyPlayer.name);
            if (heavyPlayers.length > 0) {
                this._currentTeam.removePlayer(heavyPlayers[0]);
                heavyPlayerCard.cardBody.buttons[1].text.setText(` ${this._currentTeam.getPlayersByName(heavyPlayer.name).length} `);
            }
        }, this);
        heavyPlayerCard.cardBody.buttons[2];
        heavyPlayerCard.cardBody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._currentTeam.remainingPoints >= heavyPlayer.stats.cost) {
                this._currentTeam.addPlayer(new HeavyPlayer(this));
                heavyPlayerCard.cardBody.buttons[1].text.setText(` ${this._currentTeam.getPlayersByName(heavyPlayer.name).length} `);
            }
        }, this);

        this._layout.layout();
    }

    private _createStartButton(): void {
        const startAreaGrid: GridLayout = new GridLayout({
            scene: this,
            rows: 1,
            columns: 3,
            height: this._width / 3
        });
        // const startAreaLayout: LayoutManager = new LayoutManager({scene: this, padding: 10});

        this._removeTeamLayout = new LayoutManager({scene: this, orientation: 'vertical', padding: 10});
        const removeTeamText = this.add.text(0, 0, 'Remove Team', {
            font: '20px Courier',
            color: '#000000'
        });
        const removeTeamButton = new TextButton({
            scene: this,
            width: this.game.canvas.width / 6,
            text: ' << ',
            textStyle: {
                font: '40px Courier',
                color: '#000000'
            },
            padding: 10,
            background: {color: 0x606060},
            cornerRadius: 20,
            interactive: true
        });
        this._removeTeamLayout.addContents(removeTeamText, removeTeamButton);
        startAreaGrid.setGridCellContent(0, 0, this._removeTeamLayout);
        // startAreaLayout.addContents(this._removeTeamLayout);
        removeTeamButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._currentTeamIndex > 0) {
                this._currentTeamIndex--;
                if (WarGame.teamMgr.teams.length > this._currentTeamIndex) {
                    WarGame.teamMgr.removeTeam(WarGame.teamMgr.teams[this._currentTeamIndex + 1]);
                }
                this.tweens.add({
                    targets: this._playerCardsLayout,
                    x: this._playerCardsLayout.width,
                    ease: 'Sine.easeOut',
                    duration: 100,
                    onComplete: (tween: Phaser.Tweens.Tween, targets: LayoutManager) => {
                        this._playerCardsLayout.setX(-this._playerCardsLayout.width);
                        this.tweens.add({
                            targets: this._playerCardsLayout,
                            x: 0,
                            ease: 'Sine.easeOut',
                            duration: 100
                        });
                    },
                    onCompleteScope: this
                });
            }
        }, this);

        this._startButton = new TextButton({
            scene: this,
            width: this.game.canvas.width / 3,
            text: 'Start',
            textStyle: {
                font: '60px Courier', 
                color: '#808080'
            },
            padding: 20,
            background: {color: 0x8888ff},
            cornerRadius: 20,
            interactive: true
        });
        this._startButton.setAlpha(0.5);
        startAreaGrid.setGridCellContent(0, 1, this._startButton);
        // startAreaLayout.addContents(this._startButton);
        this._startButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (WarGame.teamMgr.teams.length > 1) {
                this.game.scene.stop(this);
                this.game.scene.start('gameplay-scene');
            }
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._startButton.setAlpha(0.5);
            this._startButton.text.setColor('#808080');
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            this._startButton.setAlpha(0.5);
            this._startButton.text.setColor('#808080');
        });

        this._addTeamLayout = new LayoutManager({scene: this, orientation: 'vertical', padding: 10});
        const addTeamText = this.add.text(0, 0, 'Add Team', {
            font: '20px Courier',
            color: '#000000'
        });
        const addTeamButton = new TextButton({
            scene: this,
            width: this.game.canvas.width / 6,
            text: ' >> ',
            textStyle: {
                font: '40px Courier',
                color: '#000000'
            },
            padding: 10,
            background: {color: 0x606060},
            cornerRadius: 20,
            interactive: true
        });
        this._addTeamLayout.addContents(addTeamText, addTeamButton);
        startAreaGrid.setGridCellContent(0, 2, this._addTeamLayout);
        // startAreaLayout.addContents(this._addTeamLayout);
        addTeamButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._currentTeamIndex < 9 && this._currentTeam.getPlayers().length > 0) {
                this._currentTeamIndex++;
                if (WarGame.teamMgr.teams.length - 1 < this._currentTeamIndex) {
                    WarGame.teamMgr.addTeam(new Team({
                        name: `Team ${WarGame.teamMgr.teams.length}`,
                        points: 100
                    }));
                }
                this.tweens.add({
                    targets: this._playerCardsLayout,
                    x: -(this._playerCardsLayout.width),
                    ease: 'Sine.easeOut',
                    duration: 100,
                    onComplete: (tween: Phaser.Tweens.Tween, targets: LayoutManager) => {
                        this._playerCardsLayout.setX(this._playerCardsLayout.width);
                        this.tweens.add({
                            targets: this._playerCardsLayout,
                            x: 0,
                            ease: 'Sine.easeOut',
                            duration: 100
                        });
                    },
                    onCompleteScope: this
                });
            }
        }, this);

        this._layout.addContents(startAreaGrid);
    }
}