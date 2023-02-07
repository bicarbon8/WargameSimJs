import { Card, Colors, GridLayout, LayoutContainer, LinearLayout, TextButton } from "phaser-ui-components";
import { IPhase } from "../../phases/i-phase";
import { PhaseType } from "../../phases/phase-type";
import { IPlayer } from "../../players/i-player";
import { Team } from "../../teams/team";
import { WarGame } from "../../war-game";

module Constants {
    export var CARD_BODY_BUTTONS = 'card-body-buttons';
    export var CARD_BODY_TITLE = 'card-body-title';
    export var CARD_BODY_DESCRIPTION = 'card-body-description';
};

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
        this._createMenus();
        this._startHandlingEvents();

        WarGame.phaseMgr.reset().start();
    }

    update(time: number, delta: number): void {

    }

    private _startHandlingEvents(): void {
        const owner = 'overlay-scene';
        const condition = () => this.game.scene.isActive(this);
        WarGame.evtMgr
            .subscribe(owner, WarGame.EVENTS.TEAM_CHANGED, (t: Team) => this._handleTeamChange(t), condition)
            .subscribe(owner, WarGame.EVENTS.MESSAGE, (text: string, color: number) => this._displayMessage(text, color), condition)
            .subscribe(owner, WarGame.EVENTS.MESSAGE, (text: string, color: number) => this._displayMessage(text, color), condition)
            .subscribe(owner, WarGame.EVENTS.MESSAGE, (text: string, color: number) => this._displayMessage(text, color), condition)
            .subscribe(owner, WarGame.EVENTS.PLAYER_DIED, (p: IPlayer) => this._playerDied(p), condition)
            .subscribe(owner, WarGame.EVENTS.PHASE_START, (p: IPhase) => this._handlePhaseStart(p), condition)
            .subscribe(owner, WarGame.EVENTS.PHASE_END, (p: IPhase) => this._handlePhaseEnd(p), condition);
    }

    private _playerDied(player: IPlayer): void {
        this._displayMessage(`player [${player.name}] died from their injuries`, Colors.danger);
        const teamsWithPlayersRemaining: Team[] = WarGame.teamMgr.teams
            .filter((t: Team) => t.hasPlayers());
        if (teamsWithPlayersRemaining.length < WarGame.CONSTANTS.MIN_TEAMS) {
            this._displayMessage(`GAME OVER! ${teamsWithPlayersRemaining[0].name} WINS!`, Colors.success);
        }
    }

    private _displayMessage(text: string, color: number): void {
        const view: Phaser.Geom.Rectangle = this.cameras.main.worldView;
        const message: TextButton = new TextButton(this, {
            width: view.width * 0.9,
            textConfig: {
                text: text,
                style: {fontSize: '20px',fontFamily: 'Courier'}
            },
            backgroundStyles: {fillStyle: {color: color}},
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
            columns: 3
        });
        this.add.existing(this._menuGrid);

        const teams: Team[] = WarGame.teamMgr.teams;
        let row = 0;
        let col = 0;
        for (var i = 0; i < teams.length; i++) {
            let team: Team = teams[i];
            let teamMenu: Card = new Card(this, {
                desiredWidth: Math.floor(WarGame.uiMgr.width / 3),
                header: {
                    textConfig: {
                        text: `${team?.name} - ${team?.color}`,
                        style: { font: '20px Courier', color: (Colors.isDark(team.color)) ? '#ffffff' : '#000000' }
                    },
                    backgroundStyles: { fillStyle: {color: Colors.toHexNumber(team.color) }},
                    cornerRadius: 5
                },
                body: {
                    background: { fillStyle: {color: 0xc0c0c0 }},
                    cornerRadius: 5,
                    contents: [
                        this.make.text({
                            text: ' -- ',
                            style: { font: '20px Courier', color: '#606060' }
                        }, false).setName(Constants.CARD_BODY_TITLE),
                        this.make.text({
                            text: ' -- ',
                            style: { font: '15px Courier', color: '#606060' }
                        }).setName(Constants.CARD_BODY_DESCRIPTION),
                        new LinearLayout(this, {
                            padding: 10
                        }).setName(Constants.CARD_BODY_BUTTONS)
                    ]
                }
            });
            teamMenu.setVisible(false);
            this._menuGrid.addContentAt(row, col, teamMenu);
            col++;
            if (col >= this._menuGrid.columns) {
                col = 0;
                row++;
            }
            if (row >= this._menuGrid.rows) {
                row = 0;
            }
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
            const content: LayoutContainer = this._menuGrid?.contents[teamIndex] as LayoutContainer;
            return content?.contentAs<Card>(); 
        }
        return null;
    }

    private _getCurrentTeamMenu(): Card {
        const priorityTeam: Team = WarGame.phaseMgr.priorityPhase.priorityTeam;
        const teamIndex: number = WarGame.teamMgr.teams.findIndex((t: Team) => t.id === priorityTeam?.id);
        if (teamIndex >= 0) {
            const content: LayoutContainer = this._menuGrid?.contents[teamIndex] as LayoutContainer;
            return content?.contentAs<Card>();
        }
        return null;
    }

    private _handleTeamChange(team: Team): void {
        this._getPreviousTeamMenu()?.setVisible(false);
        this._getCurrentTeamMenu()?.setVisible(true);
    }

    private _handlePhaseStart(phase: IPhase): void {
        this._menuGrid?.contents
            .map((c: LayoutContainer) => c.contentAs<Card>())
            .filter((c: Card) => c != null)
            .forEach((c: Card) => {
                this._setCardBodyTitleText(`Current Phase: [${phase.getName()}]`, c);
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
                this._menuGrid?.contents
                    .map((c: LayoutContainer) => c.contentAs<Card>())
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
        this._removeButtonsAndLayoutsFromCardBody(card);
        this._setCardBodyTitleText('Current Phase: [priority]', card);
        const ordered: string[] = WarGame.phaseMgr.priorityPhase.orderedTeams.map((t: Team) => t?.name) || [];
        this._setCardBodyDescriptionText(`Priority order for this round is:\n${ordered.join(', ')}`, card);
        const b = new TextButton(this, {
            textConfig: {
                text: 'OK',
                style: { font: '20px Courier', color: (Colors.isDark(Colors.primary)) ? '#ffffff' : '#000000' }
            },
            padding: 5,
            backgroundStyles: {fillStyle: {color: Colors.primary}},
            cornerRadius: 5,
            onClick: () => WarGame.phaseMgr.moveToNextPhase().start()
        });
        card.cardbody.addContents(new LinearLayout(this, {
            padding: 10,
            contents: [b]
        }).setName(Constants.CARD_BODY_BUTTONS));
    }

    private _updateCardForPlacementPhase(card: Card): void {
        this._removeButtonsAndLayoutsFromCardBody(card);
        this._setCardBodyDescriptionText('Click on the map to place your team', card);
    }

    private _updateCardForMovementPhase(card: Card): void {
        this._removeButtonsAndLayoutsFromCardBody(card);
        this._setCardBodyDescriptionText('Tap each player and pick a\nlocation within their\nmovement range.', card);
        
    }

    private _updateCardForShootingPhase(card: Card): void {
        this._removeButtonsAndLayoutsFromCardBody(card);
        this._setCardBodyDescriptionText('Tap each player and pick an\nopponent in range\nto attempt to shoot them.', card);
        card.cardbody.addContents(this._continueToNextTeamButtonLayout());
    }

    private _updateCardForFightingPhase(card: Card): void {
        this._removeButtonsAndLayoutsFromCardBody(card);
        this._setCardBodyDescriptionText('Tap each player and pick an\nopponent in range\nto battle them.', card);
        card.addContents(this._continueToNextTeamButtonLayout());
    }

    private _setCardBodyTitleText(text: string, card: Card): void {
        (card.cardbody.getByName(Constants.CARD_BODY_TITLE) as Phaser.GameObjects.Text)?.setText(text);
        card.cardbody.refreshLayout();
    }

    private _setCardBodyDescriptionText(text: string, card: Card): void {
        (card.cardbody.getByName(Constants.CARD_BODY_DESCRIPTION) as Phaser.GameObjects.Text)?.setText(text);
        card.cardbody.refreshLayout();
    }

    private _removeButtonsAndLayoutsFromCardBody(card: Card): void {
        let b: Phaser.GameObjects.GameObject;
        while ((b = card.cardbody.getByName(Constants.CARD_BODY_BUTTONS)) != null) {
            card.cardbody.removeContent(b, true);
        };
    }

    private _continueToNextTeamButtonLayout(): LinearLayout {
        const b = new TextButton(this, {
            textConfig: {
                text: 'Continue',
                style: { font: '20px Courier', color: (Colors.isDark(Colors.primary)) ? '#ffffff' : '#000000' }
            },
            padding: 5,
            backgroundStyles: {fillStyle: {color: Colors.primary}},
            cornerRadius: 5,
            onClick: () => WarGame.phaseMgr.currentPhase.nextTeam()
        });
        
        const layout = new LinearLayout(this, {
            padding: 10,
            desiredHeight: b.height,
            contents: [
                b,
                this.make.text({text: 'to next Team'})
            ]
        }).setName(Constants.CARD_BODY_BUTTONS);

        return layout;
    }
}