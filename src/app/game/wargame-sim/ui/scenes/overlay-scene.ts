import { Card, Colors, GridCell, GridLayout, LinearLayout, TextButton } from "phaser-ui-components";
import { IPhase } from "../../phases/i-phase";
import { PhaseType } from "../../phases/phase-type";
import { IPlayer } from "../../players/i-player";
import { Team } from "../../teams/team";
import { WarGame } from "../../war-game";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'overlay-scene'
};

export class OverlayScene extends Phaser.Scene {
    private _menuGrid: GridLayout;
    private _messagesLayout: LinearLayout;
    private _pointerDownOver: Phaser.GameObjects.GameObject;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
    }

    create(): void {
        this.cameras.main.centerOn(0, 0);

        this._createMessagesLayout();
        this._startHandlingMessages();

        this._createMenus();

        this._startHandlingPhases();
        this._startHandlingTeamUpdates();
        this._startHandlingPlayerDeath();

        WarGame.phaseMgr.reset().start();
    }

    update(time: number, delta: number): void {

    }

    private _startHandlingPlayerDeath(): void {
        WarGame.playerMgr.on(WarGame.EVENTS.PLAYER_DIED, this._playerDied, this);
    }

    private _stopHandlingPlayerDeath(): void {
        WarGame.playerMgr.off(WarGame.EVENTS.PLAYER_DIED, this._playerDied, this);
    }

    private _startHandlingPhases(): void {
        WarGame.phaseMgr
            .on(WarGame.EVENTS.PHASE_START, this._handlePhaseStart, this)
            .on(WarGame.EVENTS.PHASE_END, this._handlePhaseEnd, this);
    }

    private _stopHandlingPhases(): void {
        WarGame.phaseMgr
            .off(WarGame.EVENTS.PHASE_START, this._handlePhaseStart, this)
            .off(WarGame.EVENTS.PHASE_END, this._handlePhaseEnd, this);
    }

    private _startHandlingTeamUpdates(): void {
        WarGame.teamMgr.on(WarGame.EVENTS.TEAM_CHANGED, this._handleTeamChange, this);
    }

    private _stopHandlingTeamUpdates(): void {
        WarGame.teamMgr.off(WarGame.EVENTS.TEAM_CHANGED, this._handleTeamChange, this);
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
        this._displayMessage(`player [${player.name}] died from their injuries`, Colors.danger);
        const teamsWithPlayersRemaining: Team[] = WarGame.teamMgr.teams
            .filter((t: Team) => t.hasPlayers());
        if (teamsWithPlayersRemaining.length < WarGame.CONSTANTS.MIN_TEAMS) {
            this._displayMessage(`GAME OVER! ${teamsWithPlayersRemaining[0].name} WINS!`, Colors.success);
            this._stopHandlingMessages();
            WarGame.removeAllListeners();
        }
    }

    private _displayMessage(text: string, color: number): void {
        const view: Phaser.Geom.Rectangle = this.cameras.main.worldView;
        const message: TextButton = new TextButton(this, {
            width: view.width * 0.9,
            text: text,
            textStyle: {fontSize: '20px',fontFamily: 'Courier'},
            background: {fillStyle: {color: color}},
            cornerRadius: 5,
            padding: 10
        });
        message.setDepth(WarGame.DEPTH.MENU);
        message.setAlpha(0);

        this._messagesLayout.addContents(message);
        this._messagesLayout.setPosition(view.centerX, view.bottom - (this._messagesLayout.height / 2));

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
        });
    }

    private _createMessagesLayout(): void {
        this._messagesLayout = new LinearLayout(this, {
            x: 0,
            y: 0,
            orientation: 'vertical',
            padding: 10
        });
        this.add.existing(this._messagesLayout);
    }

    private _createMenus(): void {
        this._menuGrid = new GridLayout(this, {
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
        for (var i = 0; i < teams.length; i++) {
            let cell: GridCell = cells[i];
            let team: Team = teams[i];
            let teamMenu: Card = new Card(this, {
                width: cell.width,
                header: {
                    text: `${team?.name} - ${team?.color}`,
                    textStyle: { font: '20px Courier', color: (Colors.isDark(team.color)) ? '#ffffff' : '#000000' },
                    background: { fillStyle: {color: Colors.toHexNumber(team.color) }},
                    cornerRadius: 5
                },
                body: {
                    title: ' -- ',
                    titleStyle: { font: '20px Courier', color: '#606060' },
                    description: ' -- ',
                    descriptionStyle: { font: '15px Courier', color: '#606060' },
                    background: { fillStyle: {color: 0xc0c0c0 }},
                    cornerRadius: 5,
                    buttons: [
                        {
                            text: ' -- ',
                            textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.success)) ? '#ffffff' : '#000000' },
                            background: {fillStyle: {color: Colors.success}},
                            interactive: true,
                            cornerRadius: 5,
                            padding: 5
                        }
                    ]
                }
            });
            teamMenu.setVisible(false);
            cell.setContent(teamMenu);
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
        this._getCurrentTeamMenu()?.setVisible(true);
    }

    private _handlePhaseStart(phase: IPhase): void {
        this._menuGrid?.cells
            .map((c: GridCell) => c?.contentAs<Card>())
            .filter((c: Card) => c != null)
            .forEach((c: Card) => {
                c.updateBodyTitle(`Current Phase: [${phase.getName()}]`);
                switch (phase.getType()) {
                    case PhaseType.priority:
                        /* wait for end */
                        break;
                    case PhaseType.placement:
                        this._updateCardForPlacementPhase(c);
                        break;
                    case PhaseType.movement:
                        this._updateCardForMovementPhase(c);
                        break;
                    case PhaseType.shooting:
                        this._updateCardForShootingPhase(c);
                        break;
                    case PhaseType.fighting:
                        this._updateCardForFightingPhase(c);
                        break;
                }
            });
    }

    private _handlePhaseEnd(phase: IPhase): void {
        switch (phase.getType()) {
            case PhaseType.priority:
                this._menuGrid?.cells
                    .map((c: GridCell) => c?.contentAs<Card>())
                    .filter((c: Card) => c != null)
                    .forEach((c: Card) => {
                        this._updateCardForPriorityPhase(c);
                    });
                break;
            default:
                WarGame.phaseMgr.moveToNextPhase().start();
                break;
        }
    }

    private _updateCardForPriorityPhase(card: Card): void {
        card.removeBodyButtons(true);
        card.updateBodyTitle('Current Phase: [priority]');
        const ordered: string[] = WarGame.phaseMgr.priorityPhase.orderedTeams.map((t: Team) => t?.name) || [];
        card.updateBodyDescription(`Priority order for this round is:\n${ordered.join(', ')}`);
        card.addBodyButtons({
            text: 'Continue',
            padding: 5,
            textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.primary)) ? '#ffffff' : '#000000' },
            background: {fillStyle: {color: Colors.primary}},
            cornerRadius: 5,
            interactive: true
        });
        card.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._pointerDownOver = card.cardbody.buttons[0];
        }, this).on(Phaser.Input.Events.POINTER_UP, () => {
            if (this._pointerDownOver && this._pointerDownOver === card.cardbody.buttons[0]) {
                WarGame.phaseMgr.moveToNextPhase().start();
            }
        }, this);
    }

    private _updateCardForPlacementPhase(card: Card): void {
        card.removeBodyButtons();
        card.updateBodyDescription('Click on the map to place your team');
    }

    private _updateCardForMovementPhase(card: Card): void {
        card.removeBodyButtons(true);
        card.updateBodyDescription('Tap each player and pick a\nlocation within their\nmovement range.');
        card.addBodyButtons({
            text: 'Continue',
            padding: 5,
            textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.primary)) ? '#ffffff' : '#000000' },
            background: {fillStyle: {color: Colors.primary}},
            cornerRadius: 5,
            interactive: true
        }, {
            text: 'to next Team',
            padding: 5,
            interactive: true
        });
        card.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._pointerDownOver = card.cardbody.buttons[0];
        }, this).on(Phaser.Input.Events.POINTER_UP, () => {
            if (this._pointerDownOver && this._pointerDownOver === card.cardbody.buttons[0]) {
                this._pointerDownOver = null;
                WarGame.phaseMgr.currentPhase.nextTeam();
            }
        }, this);
    }

    private _updateCardForShootingPhase(card: Card): void {
        card.removeBodyButtons(true);
        card.updateBodyDescription('Tap each player and pick an\nopponent in range\nto attempt to shoot them.');
        card.addBodyButtons({
            text: 'Continue',
            padding: 5,
            textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.primary)) ? '#ffffff' : '#000000' },
            background: {fillStyle: {color: Colors.primary}},
            cornerRadius: 5,
            interactive: true
        }, {
            text: 'to next Team',
            padding: 5,
            interactive: true
        });
        card.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._pointerDownOver = card.cardbody.buttons[0];
        }, this).on(Phaser.Input.Events.POINTER_UP, () => {
            if (this._pointerDownOver && this._pointerDownOver === card.cardbody.buttons[0]) {
                this._pointerDownOver = null;
                WarGame.phaseMgr.currentPhase.nextTeam();
            }
        }, this);
    }

    private _updateCardForFightingPhase(card: Card): void {
        card.removeBodyButtons(true);
        card.updateBodyDescription('Tap each player and pick an\nopponent in range\nto battle them.');
        card.addBodyButtons({
            text: 'Continue',
            padding: 5,
            textStyle: { font: '20px Courier', color: (Colors.isDark(Colors.primary)) ? '#ffffff' : '#000000' },
            background: {fillStyle: {color: Colors.primary}},
            cornerRadius: 5,
            interactive: true
        }, {
            text: 'to next Team',
            padding: 5,
            interactive: true
        });
        card.cardbody.buttons[0].on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._pointerDownOver = card.cardbody.buttons[0];
        }, this).on(Phaser.Input.Events.POINTER_UP, () => {
            if (this._pointerDownOver && this._pointerDownOver === card.cardbody.buttons[0]) {
                this._pointerDownOver = null;
                WarGame.phaseMgr.currentPhase.nextTeam();
            }
        }, this);
    }
}