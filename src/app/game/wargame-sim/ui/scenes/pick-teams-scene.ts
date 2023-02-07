import { environment } from "src/environments/environment";
import { PlayerSpritesheetMappings } from "../../players/player-spritesheet-mappings";
import { Team } from "../../teams/team";
import { WarGame } from "../../war-game";
import { IPlayer } from "../../players/i-player";
import { Rand } from "../../utils/rand";
import { Card, Colors, GridLayout, LayoutContent, LinearLayout, TextButton } from "phaser-ui-components";
import { PlayerOptions } from "../../players/player-options";

module Constants {
    export var CARD_BODY_ADD_BUTTON = 'card-body-add-button';
    export var CARD_BODY_REMOVE_BUTTON = 'card-body-remove-button';
    export var CARD_BODY_COUNT_BUTTON = 'card-body-count-button';
    export var CARD_BODY_BUTTON_LAYOUT = 'card-body-button-layout';
    export var CARD_BODY_TITLE = 'card-body-title';
    export var CARD_BODY_DESCRIPTION = 'card-body-description';
};

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

        const condition = () => this.game.scene.isActive(this);
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            if (condition()) {
                let world: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                console.info(`screen: ${pointer.x.toFixed(0)},${pointer.y.toFixed(0)}; world: ${world.x.toFixed(0)},${world.y.toFixed(0)}`);
            }
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
                        this._updateCardBodyCountButtonText(` ${basic} `, card);
                        break;
                    case WarGame.PLAYERS.HERO.name:
                        this._updateCardBodyCountButtonText(` ${hero} `, card);
                        break;
                    case WarGame.PLAYERS.LIGHT.name:
                        this._updateCardBodyCountButtonText(` ${light} `, card);
                        break;
                    case WarGame.PLAYERS.HEAVY.name:
                        this._updateCardBodyCountButtonText(` ${heavy} `, card);
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

    private _updateCardBodyCountButtonText(text: string, card: Card): void {
        ((card.cardbody.getByName(Constants.CARD_BODY_BUTTON_LAYOUT) as Phaser.GameObjects.Container)
            ?.getByName(Constants.CARD_BODY_COUNT_BUTTON) as TextButton).setText({text: text});
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
            textConfig: {
                text: '~~~~~ Choose your Teams ~~~~~',
                style: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' }
            },
            backgroundStyles: {fillStyle: {color: Colors.secondary}},
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

        const basicPlayerCard = this._createPlayerTypeCard(cardWidth, WarGame.PLAYERS.BASIC);
        const heroPlayerCard = this._createPlayerTypeCard(cardWidth, WarGame.PLAYERS.HERO);
        const lightPlayerCard = this._createPlayerTypeCard(cardWidth, WarGame.PLAYERS.LIGHT);
        const heavyPlayerCard = this._createPlayerTypeCard(cardWidth, WarGame.PLAYERS.HEAVY);

        this._playerCardsLayout.addContents(basicPlayerCard, heroPlayerCard, lightPlayerCard, heavyPlayerCard);

        this._layout.refreshLayout();
    }

    private _createPlayerTypeCard(width: number, opts: PlayerOptions): Card {
        const card = new Card(this, {
            desiredWidth: width,
            header: {
                textConfig: {
                    text: opts.name.toUpperCase(),
                    style: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' }
                },
                backgroundStyles: {fillStyle: {color: 0x808080}},
                cornerRadius: 5
            },
            image: {
                image: {
                    key: 'players',
                    index: PlayerSpritesheetMappings[opts.name.toLowerCase()].front
                },
                desiredHeight: width,
                background: {fillStyle: {color: 0xc0c0c0}}
            },
            body: {
                contents: [
                    this.make.text({
                        text: `Cost: ${opts.stats.cost}`,
                        style: { font: '20px Courier', color: (Colors.isDark(0x808080)) ? '#ffffff' : '#000000' }
                    }, false).setName(Constants.CARD_BODY_TITLE),
                    new LinearLayout(this, {
                        padding: 5,
                        contents: [
                            new TextButton(this, {
                                padding: 5,
                                textConfig: {
                                    text: ' - ',
                                    style: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' }
                                },
                                backgroundStyles: {fillStyle: {color: Colors.secondary}},
                                cornerRadius: 10,
                                onClick: () => {
                                    const players: IPlayer[] = this.currentTeam?.getPlayersByName(opts.name);
                                    if (players.length > 0) {
                                        this.currentTeam?.removePlayer(players[0], true);
                                    }
                                }
                            }),
                            new TextButton(this, {
                                padding: 5,
                                textConfig: {
                                    text: ' 0 ',
                                    style: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' }
                                },
                                backgroundStyles: {fillStyle: {color: Colors.secondary}},
                                cornerRadius: 5
                            }).setName(Constants.CARD_BODY_COUNT_BUTTON),
                            new TextButton(this, {
                                padding: 5,
                                textConfig: {
                                    text: ' + ',
                                    style: { font: '20px Courier', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000' }
                                },
                                backgroundStyles: {fillStyle: {color: Colors.secondary}},
                                cornerRadius: 10,
                                onClick: () => {
                                    if (this.currentTeam?.remainingPoints >= opts.stats.cost) {
                                        this.currentTeam?.addPlayer(opts);
                                    }
                                }
                            })
                        ]
                    }).setName(Constants.CARD_BODY_BUTTON_LAYOUT)
                ],
                background: {fillStyle: {color: 0x808080}},
                cornerRadius: 5,
                padding: 5
            }
        });

        return card;
    }

    private _createStartButton(): void {
        const gridWidth: number = WarGame.uiMgr.width / 3;
        const startAreaGrid: GridLayout = new GridLayout(this, {
            rows: 1,
            columns: 3,
            height: gridWidth,
            alignment: {vertical: 'bottom'}
        });

        this._removeTeamCard = new Card(this, {
            desiredWidth: gridWidth,
            header: {
                textConfig: {
                    text: 'Remove Team',
                    style: {
                        font: '20px Courier',
                        color: '#000000'
                    }
                }
            },
            body: {
                contents: [
                    new TextButton(this, {
                        textConfig: {
                            text: ' << ',
                            style: {fontSize: '40px', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000'}
                        },
                        padding: 10,
                        backgroundStyles: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 20,
                        onClick: () => {
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
                        }
                    })
                ]
            }
        });
        startAreaGrid.addContentAt(0, 0, this._removeTeamCard);

        this._startButton = new TextButton(this, {
            width: gridWidth,
            textConfig: {
                text: 'Start',
                style: {fontSize: '60px'}
            },
            padding: 20,
            backgroundStyles: {fillStyle: {color: Colors.primary}},
            cornerRadius: 20,
            onClick: () => {
                if (this.isReadyToPlay()) {
                    this.game.scene.stop(this);
                    WarGame.removeAllListeners();
                    this.game.scene.start('gameplay-scene');
                }
            }
        });
        startAreaGrid.addContentAt(0, 1, this._startButton);

        this._addTeamCard = new Card(this, {
            desiredWidth: WarGame.uiMgr.width / 3,
            header: {
                textConfig: {
                    text: 'Add Team',
                    style: {
                        font: '20px Courier',
                        color: '#000000'
                    }
                }
            },
            body: {
                contents: [
                    new TextButton(this, {
                        textConfig: {
                            text: ' >> ',
                            style: {fontSize: '40px', color: (Colors.isDark(Colors.secondary)) ? '#ffffff' : '#000000'}
                        },
                        padding: 10,
                        backgroundStyles: {fillStyle: {color: Colors.secondary}},
                        cornerRadius: 20,
                        onClick: () => {
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
                        }
                    })
                ]
            }
        });
        startAreaGrid.addContentAt(0, 2, this._addTeamCard);

        this._layout.addContents(startAreaGrid);

        this.updateStartButtonArea();
        const owner = 'pick-teams-scene';
        const condition = () => this.game.scene.isActive(this);
        WarGame.evtMgr
            .subscribe(owner, WarGame.EVENTS.PLAYER_ADDED, (p: IPlayer) => {
                this.updateCurrentTeamPointsRemainingDisplay();
                this.updateCurrentTeamPlayerCounts();
                this.updateStartButtonArea();
            }, condition)
            .subscribe(owner, WarGame.EVENTS.PLAYER_REMOVED, (p: IPlayer) => {
                this.updateCurrentTeamPointsRemainingDisplay();
                this.updateCurrentTeamPlayerCounts();
                this.updateStartButtonArea();
            }, condition)
            .subscribe(owner, WarGame.EVENTS.TEAM_ADDED, (p: IPlayer) => {
                this.updateCurrentTeamPointsRemainingDisplay();
                this.updateCurrentTeamPlayerCounts();
                this.updateStartButtonArea();
            }, condition)
            .subscribe(owner, WarGame.EVENTS.TEAM_REMOVED, (p: IPlayer) => {
                this.updateCurrentTeamPointsRemainingDisplay();
                this.updateCurrentTeamPlayerCounts();
                this.updateStartButtonArea();
            }, condition)
            .subscribe(owner, WarGame.EVENTS.TEAM_CHANGED, (t: Team) => {
                this.updateCurrentTeamPointsRemainingDisplay();
                this.updateCurrentTeamPlayerCounts();
                this.updateStartButtonArea();
            }, condition);
    }
}