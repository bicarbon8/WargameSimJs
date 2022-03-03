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
import { Helpers } from "../../utils/helpers";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'pick-teams-scene'
};

export class PickTeamsScene extends Phaser.Scene {
    private _width: number;
    private _height: number;

    private _title: Phaser.GameObjects.Text;
    private _currentTeamIndex: number;
    
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

        this._createTitleText();
        this._createTeamPickerButtons();
        this._createStartButton();

        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            let world: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            console.info(`pointer at: ${pointer.x.toFixed(0)},${pointer.y.toFixed(0)} - ${world.x.toFixed(0)},${world.y.toFixed(0)}`);
        });
    }

    update(time: number, delta: number): void {
        
    }

    private _createTitleText(): void {
        this._title = this.add.text(0, 0, 'War Game\nSimulator!', {font: '40px Courier', color: '#6666ff', stroke: '#000000', strokeThickness: 4, align: 'center'});
        this._title.setPosition((this._width / 2) - (this._title.width / 2), 10);
    }

    private _createTeamPickerButtons(): void {
        const chooseTeamText = new TextButton({
            scene: this,
            text: '~~~~~ Choose your Team ~~~~~',
            colour: 0x8d8d8d,
            cornerRadius: 5
        });
        chooseTeamText.setPosition((this._width / 2) - (chooseTeamText.width / 2), this._title.height + chooseTeamText.height);
        this.add.existing(chooseTeamText);

        let currentTeam: Team = WarGame.teamMgr.teams[this._currentTeamIndex];
        const teamRemainingPointsText: Phaser.GameObjects.Text = this.add.text(0, chooseTeamText.y + chooseTeamText.height, `'${currentTeam.name}' remaining points: ${currentTeam.remainingPoints}`);
        teamRemainingPointsText.setX((this._width / 2) - (teamRemainingPointsText.width / 2));
        teamRemainingPointsText.setColor('#000000');

        const width: number = this.game.canvas.width / 6;
        const height: number = this.game.canvas.height / 3;
        const basicPlayer = new BasicPlayer(this);
        const basicPlayerCard = new Card({
            scene: this,
            x: width,
            y: height,
            width: width - 5,
            height: height,
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
                        colour: 0x606060,
                        cornerRadius: 10
                    },
                    {
                        text: ' 0 ',
                        colour: 0x606060,
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        colour: 0x606060,
                        cornerRadius: 10
                    },
                ]
            }
        });
        this.add.existing(basicPlayerCard);
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
            x: width * 2,
            y: height,
            width: width - 5,
            height: height,
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
                        colour: 0x606060,
                        cornerRadius: 10
                    },
                    {
                        text: ' 0 ',
                        colour: 0x606060,
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        colour: 0x606060,
                        cornerRadius: 10
                    },
                ]
            }
        });
        this.add.existing(heroPlayerCard);
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

        const lightPlayerCard = new Card({
            scene: this,
            x: width * 3,
            y: height,
            width: width - 5,
            height: height,
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
                        colour: 0x606060,
                        cornerRadius: 10
                    },
                    {
                        text: ' 0 ',
                        colour: 0x606060,
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        colour: 0x606060,
                        cornerRadius: 10
                    },
                ]
            }
        });
        this.add.existing(lightPlayerCard);

        const heavyPlayerCard = new Card({
            scene: this,
            x: width * 4,
            y: height,
            width: width - 5,
            height: height,
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
                        colour: 0x606060,
                        cornerRadius: 10
                    },
                    {
                        text: ' 0 ',
                        colour: 0x606060,
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        colour: 0x606060,
                        cornerRadius: 10
                    },
                ]
            }
        });
        this.add.existing(heavyPlayerCard);
    }

    private _createStartButton(): void {
        const startButton = new TextButton({
            scene: this,
            text: 'Start Game',
            textStyle: {
                font: '20px Courier', 
                color: '#808080'
            },
            colour: 0x8888ff,
            cornerRadius: 5
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
        this.add.existing(startButton);
    }
}