import { Team } from "../../teams/team";
import { TeamManager } from "../../teams/team-manager";
import { Constants } from "../../utils/constants";
import { TextButton } from "../text-button";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'pick-teams-scene'
};

export class PickTeamsScene extends Phaser.Scene {
    private _width: number;
    private _height: number;

    private _title: Phaser.GameObjects.Text;
    private _addTeams: boolean;
    private _addTeamsPressedTime: number;
    private _subtractTeams: boolean;
    private _subtractTeamsPressedTime: number;
    private _numTeams: number;
    private _numTeamsText: TextButton;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
        this._numTeams = Constants.MIN_TEAMS;
        this._addTeams = false;
        this._addTeamsPressedTime = 0;
        this._subtractTeams = false;
        this._subtractTeamsPressedTime = 0;
    }

    preload(): void {
        
    }

    create(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this._createTitleText();
        this._createTeamPickerButtons();
        this._createStartButton();
    }

    update(time: number, delta: number): void {
        if (this._addTeams && time >= this._addTeamsPressedTime + Constants.INPUT_HELD_DELAY) {
            this._numTeams++;
            if (this._numTeams > Constants.MAX_TEAMS) {
                this._numTeams--;
            }
            this._addTeamsPressedTime = time;
            this._updateNumTeamsText();
        }
        if (this._subtractTeams && time >= this._subtractTeamsPressedTime + Constants.INPUT_HELD_DELAY) {
            this._numTeams--;
            if (this._numTeams < Constants.MIN_TEAMS) {
                this._numTeams++;
            }
            this._subtractTeamsPressedTime = time;
            this._updateNumTeamsText();
        }
    }

    private _createTitleText(): void {
        this._title = this.add.text(0, 0, 'War Game\nSimulator!', {font: '40px Courier', color: '#6666ff', stroke: '#000000', strokeThickness: 4, align: 'center'});
        this._title.setPosition((this._width / 2) - (this._title.width / 2), 10);
    }

    private _createTeamPickerButtons(): void {
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = { 
            font: '20px Courier', 
            color: '#000000',
            align: 'center'
        };
        this._numTeamsText = new TextButton({
            scene: this, 
            x: this._width / 2, 
            y: 0,
            text: `${this._numTeams} teams`,
            textStyle: textStyle,
            colour: 0x606060,
            alpha: 0.5,
            cornerRadius: 20,
            padding: {left: 20, top: 20}
        });
        this._numTeamsText.setY(this._title.height + this._numTeamsText.height);

        const up = new TextButton({
            scene: this,
            x: 0,
            y: this._numTeamsText.y,
            text: '+',
            textStyle: textStyle,
            colour: 0x606060,
            alpha: 0.5,
            cornerRadius: 10,
            padding: {left: 10, top: 5}
        });
        up.setX(this._numTeamsText.x + (this._numTeamsText.width / 2) + up.width);
        up.setInteractive().on(Phaser.Input.Events.POINTER_OVER, () => {
            if (this._numTeams < Constants.MAX_TEAMS) {
                up.setTextStyle({color: '#ffffff'});
            }
        }).on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._numTeams < Constants.MAX_TEAMS) {
                this._addTeams = true;
                this._addTeamsPressedTime = 0;
            }
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._addTeams = false;
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            this._addTeams = false;
            up.setTextStyle(textStyle);
        });

        const down = new TextButton({
            scene: this,
            x: 0,
            y: this._numTeamsText.y,
            text: '-',
            textStyle: textStyle,
            colour: 0x606060,
            alpha: 0.5,
            cornerRadius: 10,
            padding: {left: 10, top: 5}
        });
        down.setX(this._numTeamsText.x - (this._numTeamsText.width / 2) - down.width);
        down.setInteractive().on(Phaser.Input.Events.POINTER_OVER, () => {
            if (this._numTeams > Constants.MIN_TEAMS) {
                down.setTextStyle({color: '#ffffff'});
                down.setButtonColor(0x000000);
            }
        }).on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._numTeams > Constants.MIN_TEAMS) {
                this._subtractTeams = true;
                this._subtractTeamsPressedTime = 0;
            }
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._subtractTeams = false;
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            this._subtractTeams = false;
            down.setTextStyle(textStyle);
            down.setButtonColor(0x606060, 0.5);
        });
    }

    private _createStartButton(): void {
        const startButton = new TextButton({
            scene: this,
            x: this._width / 2,
            y: 0,
            text: 'Start Game',
            textStyle: {
                font: '20px Courier', 
                color: '#808080',
                align: 'center'
            },
            colour: 0x8888ff,
            alpha: 0.5,
            padding: {left: 5, top: 20},
            cornerRadius: 20
        });
        startButton.setY(this._height - startButton.height - 5);
        startButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            const teams: Team[] = [];
            for (var i=0; i<this._numTeams; i++) {
                let team: Team = new Team({
                    name: `Team ${i}`,
                    points: 100
                });
                teams.push(team);
            }
            TeamManager.addTeams(...teams);
            this.game.scene.start('gameplay-scene');
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            startButton.setButtonColor(0x8888ff, 1);
            startButton.setTextStyle({color: '#ffffff'});
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            startButton.setButtonColor(0x8888ff, 0.5);
            startButton.setTextStyle({color: '#808080'});
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            startButton.setButtonColor(0x8888ff, 0.5);
            startButton.setTextStyle({color: '#808080'});
        });
    }

    private _updateNumTeamsText(): void {
        this._numTeamsText.setText(`${this._numTeams} teams`);
    }
}