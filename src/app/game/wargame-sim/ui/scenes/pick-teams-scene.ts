import { environment } from "src/environments/environment";
import { PlayerSpritesheetMappings } from "../../players/player-spritesheet-mappings";
import { Team } from "../../teams/team";
import { WarGame } from "../../war-game";
import { IPlayer } from "../../players/i-player";
import { Rand } from "../../utils/rand";
import { Card, Colors, GridCell, GridLayout, LayoutContent, LinearLayout, TextButton } from "phaser-ui-components";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'pick-teams-scene'
};

export class PickTeamsScene extends Phaser.Scene {
    private _teamRemainingPointsText: Phaser.GameObjects.Text;
    private _layout: LinearLayout;
    private _startButton: TextButton;
    private _removeTeamCard: Card;
    private _addTeamCard: Card;
    private _playerCardsLayout: LinearLayout;
    private _currentTeamIndex: number;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
        // create starting team
        WarGame.teamMgr.addTeam({
            name: `Team ${WarGame.teamMgr.teams.length}`,
            points: 100
        });
        this._currentTeamIndex = 0;
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
        this.cameras.main.centerOn(0, 0);

        this._createLinearLayout();
        this._createTitleText();
        this._createTeamPickerButtons();
        this._createStartButton();

        if (this._layout.height > WarGame.uiMgr.height) {
            const scaleY: number = WarGame.uiMgr.height / this._layout.height;
            this._layout.setScale(scaleY);
        }

        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            let world: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            console.info(`screen: ${pointer.x.toFixed(0)},${pointer.y.toFixed(0)}; world: ${world.x.toFixed(0)},${world.y.toFixed(0)}`);
        });
    }

    update(time: number, delta: number): void {
        
    }

    get currentTeam(): Team {
        return WarGame.teamMgr.teams[this._currentTeamIndex];
    }

    updateCurrentTeamPointsRemainingDisplay(): void {
        this._teamRemainingPointsText.setText(`'${this.currentTeam?.name}' remaining points: ${this.currentTeam?.remainingPoints}`);
    }

    updateCurrentTeamPlayerCounts(): void {
        const basic: number = this.currentTeam?.getPlayersByName(WarGame.PLAYERS.BASIC.name).length;
        const hero: number = this.currentTeam?.getPlayersByName(WarGame.PLAYERS.HERO.name).length;
        const light: number = this.currentTeam?.getPlayersByName(WarGame.PLAYERS.LIGHT.name).length;
        const heavy: number = this.currentTeam?.getPlayersByName(WarGame.PLAYERS.HEAVY.name).length;
        this._playerCardsLayout?.contents?.forEach((c: LayoutContent) => {
            let card: Card = c as Card;
            if (card) {
                switch(card.header.text.text.toLocaleLowerCase()) {
                    case WarGame.PLAYERS.BASIC.name:
                        card.cardbody.buttons[1].setText(` ${basic} `);
                        break;
                    case WarGame.PLAYERS.HERO.name:
                        card.cardbody.buttons[1].setText(` ${hero} `);
                        break;
                    case WarGame.PLAYERS.LIGHT.name:
                        card.cardbody.buttons[1].setText(` ${light} `);
                        break;
                    case WarGame.PLAYERS.HEAVY.name:
                        card.cardbody.buttons[1].setText(` ${heavy} `);
                        break;
                }
            }
        });
    }

    updateStartButtonArea(): void {
        if (WarGame.teamMgr.teams.length > 1) {
            this._removeTeamCard.setAlpha(1);
        } else {
            this._removeTeamCard.setAlpha(0.25);
        }
        if (this.isReadyToPlay()) {
            this._startButton.setAlpha(1);
            this._startButton.text.setColor('#ffffff');
        } else {
            this._startButton.setAlpha(0.25);
            this._startButton.text.setColor('#808080');
        }
        if (this.currentTeam?.getPlayers().length > 0) {
            this._addTeamCard.setAlpha(1);
        } else {
            this._addTeamCard.setAlpha(0.25);
        }
    }

    isReadyToPlay(): boolean {
        return WarGame.teamMgr.teams.length >= WarGame.CONSTANTS.MIN_TEAMS
            && WarGame.teamMgr.teams.every((t: Team) => t.getPlayers().length >= WarGame.CONSTANTS.MIN_PLAYERS);
    }

    private _createLinearLayout(): void {
        this._layout = new LinearLayout(this, {orientation: 'vertical', padding: 10});
        this._layout.setDepth(WarGame.DEPTH.MENU);
        this.add.existing(this._layout);
    }

    private _createTitleText(): void {
        const title: Phaser.GameObjects.Text = this.add.text(0, 0, 'War Game\nSimulator!', {font: '60px Courier', color: '#6666ff', stroke: '#000000', strokeThickness: 4, align: 'center'});
        this._layout.addContents(title);
    }

    private _createTeamPickerButtons(): void {
        const chooseTeamText = new TextButton(this, {
            text: '~~~~~ Choose your Teams ~~~~~',
            textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
            background: {fillStyle: {color: Colors.secondary}},
            padding: 10,
            cornerRadius: 5
        });
        this._layout.addContents(chooseTeamText);

        this._teamRemainingPointsText = this.add.text(0, chooseTeamText.y + chooseTeamText.height, '');
        this._teamRemainingPointsText.setOrigin(0.5)
        this._teamRemainingPointsText.setColor('#000000');
        this.updateCurrentTeamPointsRemainingDisplay();
        this.updateCurrentTeamPlayerCounts();

        this._layout.addContents(chooseTeamText, this._teamRemainingPointsText);

        this._playerCardsLayout = new LinearLayout(this, {
            orientation: 'horizontal',
            padding: 5
        });
        this._layout.addContents(this._playerCardsLayout);
        
        const cardWidth: number = (this.game.canvas.width - (5 * 5)) / 4;

        const basicPlayerCard = new Card(this, {
            width: cardWidth,
            header: {
                text: 'Basic',
                textStyle: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' },
                background: {fillStyle: {color: 0x808080}},
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.basic.front,
                height: cardWidth,
                background: {fillStyle: {color: 0xc0c0c0}}
            },
            body: {
                title: `Cost: ${WarGame.PLAYERS.BASIC.stats.cost}`,
                titleStyle: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' },
                background: {fillStyle: {color: 0x808080}},
                cornerRadius: 5,
                padding: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        this._playerCardsLayout.addContents(basicPlayerCard);
        basicPlayerCard.cardbody.buttons[0];
        basicPlayerCard.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const basicPlayers: IPlayer[] = this.currentTeam?.getPlayersByName(WarGame.PLAYERS.BASIC.name);
            if (basicPlayers.length > 0) {
                this.currentTeam?.removePlayer(basicPlayers[0], true);
            }
        }, this);
        basicPlayerCard.cardbody.buttons[2];
        basicPlayerCard.cardbody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.currentTeam?.remainingPoints >= WarGame.PLAYERS.BASIC.stats.cost) {
                this.currentTeam?.addPlayer(WarGame.PLAYERS.BASIC);
            }
        }, this);

        const heroPlayerCard = new Card(this, {
            width: cardWidth,
            header: {
                text: 'Hero',
                textStyle: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' },
                background: {fillStyle: {color: 0x808080}},
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.hero.front,
                height: cardWidth,
                background: {fillStyle: {color: 0xc0c0c0}},
            },
            body: {
                title: `Cost: ${WarGame.PLAYERS.HERO.stats.cost}`,
                titleStyle: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' },
                background: {fillStyle: {color: 0x808080}},
                cornerRadius: 5,
                padding: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        this._playerCardsLayout.addContents(heroPlayerCard);
        heroPlayerCard.cardbody.buttons[0];
        heroPlayerCard.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const heroPlayers: IPlayer[] = this.currentTeam?.getPlayersByName(WarGame.PLAYERS.HERO.name);
            if (heroPlayers.length > 0) {
                this.currentTeam?.removePlayer(heroPlayers[0], true);
            }
        }, this);
        heroPlayerCard.cardbody.buttons[2];
        heroPlayerCard.cardbody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.currentTeam?.remainingPoints >= WarGame.PLAYERS.HERO.stats.cost) {
                this.currentTeam?.addPlayer(WarGame.PLAYERS.HERO);
            }
        }, this);

        const lightPlayerCard = new Card(this, {
            width: cardWidth,
            header: {
                text: 'Light',
                textStyle: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' },
                background: {fillStyle: {color: 0x808080}},
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.light.front,
                height: cardWidth,
                background: {fillStyle: {color: 0xc0c0c0}},
            },
            body: {
                title: `Cost: ${WarGame.PLAYERS.LIGHT.stats.cost}`,
                titleStyle: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' },
                background: {fillStyle: {color: 0x808080}},
                cornerRadius: 5,
                padding: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        this._playerCardsLayout.addContents(lightPlayerCard);
        lightPlayerCard.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const lightPlayers: IPlayer[] = this.currentTeam?.getPlayersByName(WarGame.PLAYERS.LIGHT.name);
            if (lightPlayers.length > 0) {
                this.currentTeam?.removePlayer(lightPlayers[0], true);
            }
        }, this);
        lightPlayerCard.cardbody.buttons[2];
        lightPlayerCard.cardbody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.currentTeam?.remainingPoints >= WarGame.PLAYERS.LIGHT.stats.cost) {
                this.currentTeam?.addPlayer(WarGame.PLAYERS.LIGHT);
            }
        }, this);

        const heavyPlayerCard = new Card(this, {
            width: cardWidth,
            header: {
                text: 'Heavy',
                textStyle: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' },
                background: {fillStyle: {color: 0x808080}},
                cornerRadius: 5
            },
            image: {
                spriteKey: 'players',
                spriteIndex: PlayerSpritesheetMappings.heavy.front,
                height: cardWidth,
                background: {fillStyle: {color: 0xc0c0c0}},
            },
            body: {
                title: `Cost: ${WarGame.PLAYERS.HEAVY.stats.cost}`,
                titleStyle: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' },
                background: {fillStyle: {color: 0x808080}},
                cornerRadius: 5,
                padding: 5,
                buttons: [
                    {
                        text: ' - ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 10,
                        interactive: true
                    },
                    {
                        text: ' 0 ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 5
                    },
                    {
                        text: ' + ',
                        padding: 5,
                        textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' },
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 10,
                        interactive: true
                    },
                ]
            }
        });
        this._playerCardsLayout.addContents(heavyPlayerCard);
        heavyPlayerCard.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            const heavyPlayers: IPlayer[] = this.currentTeam?.getPlayersByName(WarGame.PLAYERS.HEAVY.name);
            if (heavyPlayers.length > 0) {
                this.currentTeam?.removePlayer(heavyPlayers[0], true);
            }
        }, this);
        heavyPlayerCard.cardbody.buttons[2];
        heavyPlayerCard.cardbody.buttons[2].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.currentTeam?.remainingPoints >= WarGame.PLAYERS.HEAVY.stats.cost) {
                this.currentTeam?.addPlayer(WarGame.PLAYERS.HEAVY);
            }
        }, this);

        this._layout.layout();
    }

    private _createStartButton(): void {
        const gridWidth: number = WarGame.uiMgr.width / 3;
        const startAreaGrid: GridLayout = new GridLayout(this, {
            rows: 1,
            columns: 3,
            height: gridWidth
        });

        this._removeTeamCard = new Card(this, {
            width: gridWidth,
            header: {
                text: 'Remove Team',
                textStyle: {
                    font: '20px Courier',
                    color: '#000000'
                }
            },
            body: {
                buttons: [
                    {
                        text: ' << ',
                        textStyle: {fontSize: '40px', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000'},
                        padding: 10,
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 20,
                        interactive: true
                    }
                ]
            }
        });
        startAreaGrid.setGridCellContent(0, 0, this._removeTeamCard);
        this._removeTeamCard.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._currentTeamIndex > 0) {
                this.tweens.add({
                    targets: this._playerCardsLayout,
                    x: this._playerCardsLayout.width,
                    ease: 'Sine.easeOut',
                    duration: 100,
                    onComplete: (tween: Phaser.Tweens.Tween, targets: LinearLayout) => {
                        this._currentTeamIndex--;
                        WarGame.teamMgr.removeTeam(this._currentTeamIndex + 1, true);
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

        this._startButton = new TextButton(this, {
            width: gridWidth,
            text: 'Start',
            textStyle: {fontSize: '60px'},
            padding: 20,
            background: {fillStyle: {color: Colors.primary}},
            cornerRadius: 20,
            interactive: true
        });
        startAreaGrid.setGridCellContent(0, 1, this._startButton);
        this._startButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.isReadyToPlay()) {
                this.game.scene.stop(this);
                WarGame.removeAllListeners();
                this.game.scene.start('gameplay-scene');
            }
        });

        this._addTeamCard = new Card(this, {
            width: WarGame.uiMgr.width / 3,
            header: {
                text: 'Add Team',
                textStyle: {
                    font: '20px Courier',
                    color: '#000000'
                }
            },
            body: {
                buttons: [
                    {
                        text: ' >> ',
                        textStyle: {fontSize: '40px', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000'},
                        padding: 10,
                        background: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 20,
                        interactive: true
                    }
                ]
            }
        });
        startAreaGrid.setGridCellContent(0, 2, this._addTeamCard);
        this._addTeamCard.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (WarGame.teamMgr.teams.length < WarGame.CONSTANTS.MAX_TEAMS
                && WarGame.teamMgr.teams.every((t: Team) => t.getPlayers().length >= WarGame.CONSTANTS.MIN_PLAYERS)) {
                this.tweens.add({
                    targets: this._playerCardsLayout,
                    x: -(this._playerCardsLayout.width),
                    ease: 'Sine.easeOut',
                    duration: 100,
                    onComplete: (tween: Phaser.Tweens.Tween, targets: LinearLayout) => {
                        this._currentTeamIndex++;
                        WarGame.teamMgr.addTeam({
                            name: `Team ${WarGame.teamMgr.teams.length}`,
                            points: 100,
                            color: Rand.colorString()
                        });
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

        this.updateStartButtonArea();
        WarGame.teamMgr.on(WarGame.EVENTS.PLAYER_ADDED, (p: IPlayer) => {
            this.updateCurrentTeamPointsRemainingDisplay();
            this.updateCurrentTeamPlayerCounts();
            this.updateStartButtonArea();
        }, this).on(WarGame.EVENTS.PLAYER_REMOVED, (p: IPlayer) => {
            this.updateCurrentTeamPointsRemainingDisplay();
            this.updateCurrentTeamPlayerCounts();
            this.updateStartButtonArea();
        }, this).on(WarGame.EVENTS.TEAM_ADDED, (p: IPlayer) => {
            this.updateCurrentTeamPointsRemainingDisplay();
            this.updateCurrentTeamPlayerCounts();
            this.updateStartButtonArea();
        }, this).on(WarGame.EVENTS.TEAM_REMOVED, (p: IPlayer) => {
            this.updateCurrentTeamPointsRemainingDisplay();
            this.updateCurrentTeamPlayerCounts();
            this.updateStartButtonArea();
        }, this).on(WarGame.EVENTS.TEAM_CHANGED, (t: Team) => {
            this.updateCurrentTeamPointsRemainingDisplay();
            this.updateCurrentTeamPlayerCounts();
            this.updateStartButtonArea();
        }, this);
    }
}