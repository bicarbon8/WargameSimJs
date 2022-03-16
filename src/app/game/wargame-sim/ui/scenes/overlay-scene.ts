import { IPhase } from "../../phases/i-phase";
import { PhaseType } from "../../phases/phase-type";
import { IPlayer } from "../../players/i-player";
import { Team } from "../../teams/team";
import { Helpers } from "../../utils/helpers";
import { WarGame } from "../../war-game";
import { ButtonStyle } from "../buttons/button-style";
import { TextButton } from "../buttons/text-button";
import { Card } from "../card/card";
import { GridCell } from "../layout/grid-cell";
import { GridLayout } from "../layout/grid-layout";
import { LayoutManager } from "../layout/layout-manager";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'overlay-scene'
};

export class OverlayScene extends Phaser.Scene {
    private _menuGrid: GridLayout;
    private _messagesLayout: LayoutManager;
    private _pointerDownOver: Phaser.GameObjects.GameObject;
    private _playersAddedToMap: number;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
        this._playersAddedToMap = 0;
    }

    create(): void {
        this.cameras.main.centerOn(0, 0);
        this._createMessagesLayout();
        this._startHandlingMessages();
        this._createMenus();

        this._handleTeamPlacement();
    }

    update(time: number, delta: number): void {
        
    }

    /**
     * wait for teams to be placed on the map and then start handling
     * phases, team changes and player deaths
     */
    private _handleTeamPlacement(): void {
        WarGame.map.on(WarGame.EVENTS.PLAYER_ADDED, (player: IPlayer) => {
            this._playersAddedToMap++;
            if (this._playersAddedToMap >= WarGame.playerMgr.players.length) {
                this._startHandlingPhases();
                this._startHandlingTeamUpdates();
                this._startHandlingPlayerDeath();
                WarGame.phaseMgr.moveToNextPhase().start();
            } else {
                this._updateCardInfoForTeamPlacement();
            }
        }, this);

        WarGame.phaseMgr.reset().start();
        this._updateCardInfoForTeamPlacement();
    }

    private _updateCardInfoForTeamPlacement(): void {
        const menu: Card = this._getCurrentTeamMenu();
        menu.removeBodyButtons();
        const team: Team = WarGame.phaseMgr.priorityPhase.priorityTeam;
        menu.updateHeaderText(`${team?.name} - ${team?.color}`);
        menu.updateBodyTitle('Place team');
        menu.updateBodyDescription('Click on the map to place your team');
        menu.setVisible(true);
    }

    private _startHandlingPlayerDeath(): void {
        WarGame.playerMgr.on(WarGame.EVENTS.PLAYER_DIED, this._playerDied, this);
    }

    private _startHandlingPhases(): void {
        WarGame.phaseMgr
        .on(WarGame.EVENTS.PHASE_START, this._handlePhaseStart, this)
        .on(WarGame.EVENTS.PHASE_END, this._handlePhaseEnd, this);
    }

    private _startHandlingTeamUpdates(): void {
        WarGame.teamMgr.on(WarGame.EVENTS.TEAM_CHANGED, this._handleTeamChange, this);
    }

    private _startHandlingMessages(): void {
        WarGame.playerMgr.on(WarGame.EVENTS.MESSAGE, this._displayMessage, this);
        WarGame.phaseMgr.on(WarGame.EVENTS.MESSAGE, this._displayMessage, this);
        WarGame.battleMgr.on(WarGame.EVENTS.MESSAGE, this._displayMessage, this);
    }

    private _stopHandlingMessages(): void {
        WarGame.playerMgr.off(WarGame.EVENTS.MESSAGE, this._displayMessage, this);
        WarGame.phaseMgr.off(WarGame.EVENTS.MESSAGE, this._displayMessage, this);
        WarGame.battleMgr.off(WarGame.EVENTS.MESSAGE, this._displayMessage, this);
    }

    private _playerDied(player: IPlayer): void {
        this._displayMessage(`player [${player.name}] died from their injuries`, ButtonStyle.danger);
        const teamsWithPlayersRemaining: Team[] = WarGame.teamMgr.teams
        .filter((t: Team) => t.hasPlayers());
        if (teamsWithPlayersRemaining.length < WarGame.CONSTANTS.MIN_TEAMS) {
            this._displayMessage(`GAME OVER! ${teamsWithPlayersRemaining[0].name} WINS!`, ButtonStyle.success);
            this._stopHandlingMessages();
            WarGame.removeAllListeners();
        }
    }

    private _displayMessage(text: string, style: ButtonStyle): void {
        const message: TextButton = new TextButton({
            scene: this,
            width: WarGame.uiMgr.view.width * 0.9,
            text: text,
            textSize: 20,
            buttonStyle: style,
            cornerRadius: 5,
            padding: 10
        });
        message.setDepth(WarGame.DEPTH.MENU);
        message.setAlpha(0);

        this._messagesLayout.addContents(message);
        this._messagesLayout.setPosition(WarGame.uiMgr.view.centerX, WarGame.uiMgr.view.bottom - (this._messagesLayout.height / 2));
        
        this.tweens.add({
            targets: message,
            alpha: 0.9,
            duration: 500,
            onComplete: (tween: Phaser.Tweens.Tween, targets: Phaser.GameObjects.Container) => {
                this.tweens.add({
                    targets: targets,
                    alpha: 0,
                    duration: 5000,
                    onComplete: (tween: Phaser.Tweens.Tween, targets: Phaser.GameObjects.Container) => {
                        this._messagesLayout.removeContent(message, true);
                    },
                    callbackScope: this
                });
            },
            callbackScope: this
        })
    }

    private _createMessagesLayout(): void {
        this._messagesLayout = new LayoutManager({
            scene: this,
            x: 0,
            y: 0,
            orientation: 'vertical',
            padding: 10
        });
        this.add.existing(this._messagesLayout);
    }

    private _createMenus(): void {
        this._menuGrid = new GridLayout({
            scene: this,
            width: WarGame.uiMgr.width,
            height: WarGame.uiMgr.height,
            x: 0,
            y: 0,
            rows: 3,
            columns: 3,
            margins: 10
        });
        this.add.existing(this._menuGrid);
        const cells: GridCell[] = this._menuGrid.cells;
        const teams: Team[] = WarGame.teamMgr.teams;
        for (var i=0; i<teams.length; i++) {
            let cell: GridCell = cells[i];
            let team: Team = teams[i];
            let teamMenu: Card = new Card({
                scene: this,
                width: cell.width,
                header: {
                    text: " -- ",
                    textStyle: {font: '20px Courier', color: (Helpers.isDarkColor(team.color)) ? '#ffffff' : '#000000'},
                    background: {color: parseInt(team.color.slice(1), 16)},
                    cornerRadius: 5
                },
                body: {
                    title: ' -- ',
                    titleStyle: {font: '20px Courier', color: '#606060'},
                    description: ' -- ',
                    descriptionStyle: {font: '15px Courier', color: '#606060'},
                    background: {color: 0xc0c0c0},
                    cornerRadius: 5,
                    buttons: [
                        {
                            text: ' -- ',
                            buttonStyle: ButtonStyle.success,
                            interactive: true,
                            cornerRadius: 5,
                            padding: 5
                        }
                    ]
                }
            });
            teamMenu.setVisible(false);
            cell.setContent({
                content: teamMenu,
                scaleToFit: true,
                alignment: {
                    vertical: 'top'
                }
            });
        }
    }

    private _getPreviousTeamMenu(): Card {
        let previousPriority: number = WarGame.phaseMgr.priorityPhase.currentPriority - 1;
        if (previousPriority < 0) {
            previousPriority = WarGame.teamMgr.teams.length - 1;
        }
        const priorityTeam: Team = WarGame.phaseMgr.priorityPhase.getTeam(previousPriority);
        const teamIndex: number = WarGame.teamMgr.teams.findIndex((t: Team) => t.id === priorityTeam?.id);
        if (teamIndex >= 0) {
            const cell: GridCell = this._menuGrid?.cells[teamIndex];
            return cell?.contentAs<Card>();
        }
        return null;
    }

    private _getCurrentTeamMenu(): Card {
        const priorityTeam: Team = WarGame.phaseMgr.priorityPhase.priorityTeam;
        const teamIndex: number = WarGame.teamMgr.teams.findIndex((t: Team) => t.id === priorityTeam?.id);
        if (teamIndex >= 0) {
            const cell: GridCell = this._menuGrid?.cells[teamIndex];
            return cell?.contentAs<Card>();
        }
        return null;
    }

    private _handleTeamChange(team: Team): void {
        this._getPreviousTeamMenu()?.setVisible(false);
        const menu: Card = this._getCurrentTeamMenu();
        if (menu) {
            menu.updateHeaderText(`${team?.name} - ${team?.color}`);
            menu.setVisible(true);
            this._handlePhaseStart(WarGame.phaseMgr.currentPhase);
        }
    }

    private _handlePhaseStart(phase: IPhase): void {
        this._getCurrentTeamMenu()?.updateBodyTitle(`Current Phase: [${phase.getName()}]`);
        switch (phase.getType()) {
            case PhaseType.movement:
                this._handleMovementPhase(phase);
                break;
            case PhaseType.shooting:
                this._handleShootingPhase(phase);
                break;
            case PhaseType.fighting:
                this._handleFightingPhase(phase);
                break;
        }
    }

    private _handlePhaseEnd(phase: IPhase): void {
        switch (phase.getType()) {
            case PhaseType.priority:
                this._handlePriorityPhase(phase);
                break;
            default:
                WarGame.phaseMgr.moveToNextPhase().start();
                break;
        }
    }

    private _handlePriorityPhase(phase: IPhase): void {
        const menu: Card = this._getCurrentTeamMenu();
        menu.removeBodyButtons(true);
        menu.removeBodyDescription(true);
        menu.addBodyButtons({
            text: 'Continue',
            buttonStyle: ButtonStyle.primary,
            cornerRadius: 5,
            interactive: true
        });
        menu.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._pointerDownOver = menu.cardbody.buttons[0];
        }, this).on(Phaser.Input.Events.POINTER_UP, () => {
            if (this._pointerDownOver && this._pointerDownOver === menu.cardbody.buttons[0]) {
                WarGame.phaseMgr.moveToNextPhase().start();
            }
        }, this);
    }

    private _handleMovementPhase(phase: IPhase): void {
        const menu: Card = this._getCurrentTeamMenu();
        menu.removeBodyButtons(true);
        menu.updateBodyDescription('Tap each player and pick a\nlocation within their\nmovement range.');
        menu.addBodyButtons({
            text: 'Continue',
            padding: 5,
            buttonStyle: ButtonStyle.primary,
            cornerRadius: 5,
            interactive: true
        },{
            text: 'to next Team',
            padding: 5,
            interactive: true
        });
        menu.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._pointerDownOver = menu.cardbody.buttons[0];
        }, this).on(Phaser.Input.Events.POINTER_UP, () => {
            if (this._pointerDownOver && this._pointerDownOver === menu.cardbody.buttons[0]) {
                this._pointerDownOver = null;
                phase.nextTeam();
            }
        }, this);
    }

    private _handleShootingPhase(phase: IPhase): void {
        const menu: Card = this._getCurrentTeamMenu()
        menu.removeBodyButtons(true);
        menu.updateBodyDescription('Tap each player and pick an\nopponent in range\nto attempt to shoot them.');
        menu.addBodyButtons({
            text: 'Continue',
            padding: 5,
            buttonStyle: ButtonStyle.primary,
            cornerRadius: 5,
            interactive: true
        },{
            text: 'to next Team',
            padding: 5,
            interactive: true
        });
        menu.cardbody.buttons[0].once(Phaser.Input.Events.POINTER_DOWN, () => {
            phase.nextTeam();
            menu.removeBodyButtons(true);
            if (phase.active) {
                this._handleShootingPhase(phase);
            }
        }, this);
    }

    private _handleFightingPhase(phase: IPhase): void {
        const menu: Card = this._getCurrentTeamMenu()
        menu.removeBodyButtons(true);
        menu.updateBodyDescription('Tap each player and pick an\nopponent in range\nto battle them.');
        menu.addBodyButtons({
            text: 'Continue',
            padding: 5,
            buttonStyle: ButtonStyle.primary,
            cornerRadius: 5,
            interactive: true
        },{
            text: 'to next Team',
            padding: 5,
            interactive: true
        });
        menu.cardbody.buttons[0].once(Phaser.Input.Events.POINTER_DOWN, () => {
            phase.nextTeam();
            menu.removeBodyButtons(true);
            if (phase.active) {
                this._handleFightingPhase(phase);
            }
        }, this);
    }
}