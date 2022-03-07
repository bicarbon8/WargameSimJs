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

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'pick-teams-scene'
};

export class PickTeamsScene extends Phaser.Scene {
    private _width: number;
    private _height: number;
    private _currentTeamIndex: number;
    private _layout: LayoutManager;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
        this._currentTeamIndex = 0;
        // create starting team
        WarGame.teamMgr.addTeam(new Team({
            name: `Team ${WarGame.teamMgr.teams.length}`,
            points: 100
        }));
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

        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            let world: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            console.info(`screen: ${pointer.x.toFixed(0)},${pointer.y.toFixed(0)}; world: ${world.x.toFixed(0)},${world.y.toFixed(0)}`);
        });
    }

    update(time: number, delta: number): void {
        
    }

    private _createLayoutManager(): void {
        this._layout = new LayoutManager({scene: this, orientation: 'vertical', padding: 10});
        this._layout.setDepth(Constants.DEPTH_MENU);
        this.add.existing(this._layout);
    }

    private _createTitleText(): void {
        const title: Phaser.GameObjects.Text = this.add.text(0, 0, 'War Game\nSimulator!', {font: '40px Courier', color: '#6666ff', stroke: '#000000', strokeThickness: 4, align: 'center'});
        this._layout.addContents(title);
    }

    private _createTeamPickerButtons(): void {
        const chooseTeamText = new TextButton({
            scene: this,
            text: '~~~~~ Choose your Team ~~~~~',
            padding: 10,
            colour: 0x8d8d8d,
            cornerRadius: 5
        });
        this._layout.addContents(chooseTeamText);

        let currentTeam: Team = WarGame.teamMgr.teams[this._currentTeamIndex];
        const teamRemainingPointsText: Phaser.GameObjects.Text = this.add.text(0, chooseTeamText.y + chooseTeamText.height, `'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
        teamRemainingPointsText.setOrigin(0.5)
        teamRemainingPointsText.setX(this._width / 2);
        teamRemainingPointsText.setColor('#000000');

        this._layout.addContents(chooseTeamText, teamRemainingPointsText);

        const playerCards: LayoutManager = new LayoutManager({
            scene: this,
            orientation: 'horizontal',
            padding: 5
        });
        this._layout.addContents(playerCards);
        
        const cardWidth: number = (this.game.canvas.width - (5 * 7)) / 6;

        const previousTeamCard: Card = new Card({
            scene: this,
            width: cardWidth,
            header: {
                text: 'Remove Team',
                textStyle: {
                    font: '20px Courier',
                    color: '#c0c0c0'
                },
            },
            body: {
                buttons: [
                    {
                        text: ' << ',
                        textStyle: {
                            font: '40px Courier',
                            color: '#ffffff'
                        },
                        padding: 10,
                        colour: 0xc0c0c0,
                        cornerRadius: 20,
                        interactive: true
                    }
                ]
            }
        });
        playerCards.addContents(previousTeamCard);
        previousTeamCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._currentTeamIndex > 0) {
                this._currentTeamIndex--;
                if (WarGame.teamMgr.teams.length > this._currentTeamIndex) {
                    WarGame.teamMgr.removeTeam(WarGame.teamMgr.teams[this._currentTeamIndex + 1]);
                }
            }
        }, this);

        const basicPlayer = new BasicPlayer(this);
        const basicPlayerCard = new Card({
            scene: this,
            width: cardWidth,
            header: {
                text: 'Basic',
                backgroundColor: 0x808080,
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.basic.front,
                backgroundColor: 0xc0c0c0
            },
            body: {
                title: `Cost: ${basicPlayer.stats.cost}`,
                backgroundColor: 0x808080,
                cornerRadius: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 10,
                        interactive: true,
                        debug: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 10,
                        interactive: true
                    },
                ],
                debug: true
            },
            debug: true
        });
        playerCards.addContents(basicPlayerCard);
        basicPlayerCard.cardBody.buttons[0];
        basicPlayerCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const basicPlayers: IPlayer[] = currentTeam.getPlayersByName(basicPlayer.name);
            if (basicPlayers.length > 0) {
                currentTeam.removePlayer(basicPlayers[0]);
                basicPlayerCard.cardBody.buttons[1].text.setText(` ${currentTeam.getPlayersByName(basicPlayer.name).length} `);
                teamRemainingPointsText.setText(`'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
            }
        }, this);
        basicPlayerCard.cardBody.buttons[2];
        basicPlayerCard.cardBody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (currentTeam.remainingPoints >= basicPlayer.stats.cost) {
                currentTeam.addPlayer(new BasicPlayer(this));
                basicPlayerCard.cardBody.buttons[1].text.setText(` ${currentTeam.getPlayersByName(basicPlayer.name).length} `);
                teamRemainingPointsText.setText(`'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
            }
        }, this);

        const heroPlayer: HeroPlayer = new HeroPlayer(this);
        const heroPlayerCard = new Card({
            scene: this,
            width: cardWidth,
            header: {
                scene: this,
                text: 'Hero',
                backgroundColor: 0x808080,
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.hero.front,
                backgroundColor: 0xc0c0c0,
            },
            body: {
                title: `Cost: ${heroPlayer.stats.cost}`,
                backgroundColor: 0x808080,
                cornerRadius: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        playerCards.addContents(heroPlayerCard);
        heroPlayerCard.cardBody.buttons[0];
        heroPlayerCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const heroPlayers: IPlayer[] = currentTeam.getPlayersByName(heroPlayer.name);
            if (heroPlayers.length > 0) {
                currentTeam.removePlayer(heroPlayers[0]);
                heroPlayerCard.cardBody.buttons[1].text.setText(` ${currentTeam.getPlayersByName(heroPlayer.name).length} `);
                teamRemainingPointsText.setText(`'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
            }
        }, this);
        heroPlayerCard.cardBody.buttons[2];
        heroPlayerCard.cardBody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (currentTeam.remainingPoints >= heroPlayer.stats.cost) {
                currentTeam.addPlayer(new HeroPlayer(this));
                heroPlayerCard.cardBody.buttons[1].text.setText(` ${currentTeam.getPlayersByName(heroPlayer.name).length} `);
                teamRemainingPointsText.setText(`'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
            }
        }, this);

        const lightPlayer: LightPlayer = new LightPlayer(this);
        const lightPlayerCard = new Card({
            scene: this,
            width: cardWidth,
            header: {
                scene: this,
                text: 'Light',
                backgroundColor: 0x808080,
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.light.front,
                backgroundColor: 0xc0c0c0,
            },
            body: {
                title: `Cost: ${new LightPlayer(this).stats.cost}`,
                backgroundColor: 0x808080,
                cornerRadius: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        playerCards.addContents(lightPlayerCard);
        lightPlayerCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const lightPlayers: IPlayer[] = currentTeam.getPlayersByName(lightPlayer.name);
            if (lightPlayers.length > 0) {
                currentTeam.removePlayer(lightPlayers[0]);
                lightPlayerCard.cardBody.buttons[1].text.setText(` ${currentTeam.getPlayersByName(lightPlayer.name).length} `);
                teamRemainingPointsText.setText(`'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
            }
        }, this);
        lightPlayerCard.cardBody.buttons[2];
        lightPlayerCard.cardBody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (currentTeam.remainingPoints >= lightPlayer.stats.cost) {
                currentTeam.addPlayer(new LightPlayer(this));
                lightPlayerCard.cardBody.buttons[1].text.setText(` ${currentTeam.getPlayersByName(lightPlayer.name).length} `);
                teamRemainingPointsText.setText(`'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
            }
        }, this);

        const heavyPlayer: HeavyPlayer = new HeavyPlayer(this);
        const heavyPlayerCard = new Card({
            scene: this,
            width: cardWidth,
            header: {
                scene: this,
                text: 'Heavy',
                backgroundColor: 0x808080,
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.heavy.front,
                backgroundColor: 0xc0c0c0,
            },
            body: {
                title: `Cost: ${new HeavyPlayer(this).stats.cost}`,
                backgroundColor: 0x808080,
                cornerRadius: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        colour: 0x606060,
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        playerCards.addContents(heavyPlayerCard);
        heavyPlayerCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const heavyPlayers: IPlayer[] = currentTeam.getPlayersByName(heavyPlayer.name);
            if (heavyPlayers.length > 0) {
                currentTeam.removePlayer(heavyPlayers[0]);
                heavyPlayerCard.cardBody.buttons[1].text.setText(` ${currentTeam.getPlayersByName(heavyPlayer.name).length} `);
                teamRemainingPointsText.setText(`'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
            }
        }, this);
        heavyPlayerCard.cardBody.buttons[2];
        heavyPlayerCard.cardBody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (currentTeam.remainingPoints >= heavyPlayer.stats.cost) {
                currentTeam.addPlayer(new HeavyPlayer(this));
                heavyPlayerCard.cardBody.buttons[1].text.setText(` ${currentTeam.getPlayersByName(heavyPlayer.name).length} `);
                teamRemainingPointsText.setText(`'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
            }
        }, this);

        const nextTeamCard: Card = new Card({
            scene: this,
            width: cardWidth,
            header: {
                text: 'Add Team',
                textStyle: {
                    font: '20px Courier',
                    color: '#000000'
                },
            },
            body: {
                buttons: [
                    {
                        text: ' >> ',
                        textStyle: {
                            font: '40px Courier',
                            color: '#000000'
                        },
                        padding: 10,
                        colour: 0x606060,
                        cornerRadius: 20,
                        interactive: true
                    }
                ]
            }
        });
        playerCards.addContents(nextTeamCard);
        nextTeamCard.cardBody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._currentTeamIndex < 9) {
                this._currentTeamIndex++;
                if (WarGame.teamMgr.teams.length - 1 < this._currentTeamIndex) {
                    WarGame.teamMgr.addTeam(new Team({
                        name: `Team ${WarGame.teamMgr.teams.length}`,
                        points: 100
                    }));
                }
            }
        }, this);

        this._layout.layout();
    }

    private _createStartButton(): void {
        const startButton = new TextButton({
            scene: this,
            text: 'Start Game',
            textStyle: {
                font: '20px Courier', 
                color: '#808080'
            },
            padding: 10,
            colour: 0x8888ff,
            cornerRadius: 5,
            interactive: true
        });
        startButton.setAlpha(0.5);
        startButton.setPosition((this._width / 2) - (startButton.width / 2), this._height - startButton.height - 5);
        startButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (WarGame.teamMgr.teams.length > 0) {
                this.game.scene.start('gameplay-scene');
                this.game.scene.stop(this);
            }
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            if (WarGame.teamMgr.teams.length > 0 && WarGame.teamMgr.teams.every((t: Team) => t.getPlayers().length > 0)) {
                startButton.setAlpha(1);
                startButton.text.setColor('#ffffff');
            }
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            startButton.setAlpha(0.5);
            startButton.text.setColor('#808080');
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            startButton.setAlpha(0.5);
            startButton.text.setColor('#808080');
        });
        this._layout.addContents(startButton);
    }
}