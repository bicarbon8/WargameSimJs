import { Rand } from "../utils/rand";
import { WarGame } from "../war-game";
import { IPlayer } from "./i-player";
import { PlayerOptions } from "./player-options";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";
import { PlayerSpritesheetMapping } from "./player-spritesheet-mappings";
import { PlayerManager } from "./player-manager";
import { Team } from "../teams/team";
import { LinearLayout } from "phaser-ui-components";
import { XY } from "../ui/types/xy";
import { Logging } from "../utils/logging";

export class Player implements IPlayer {
    readonly id: string;
    private readonly _playerMgr: PlayerManager;
    private readonly _name: string;
    private readonly _stats: PlayerStats;
    private readonly _spriteMapping: PlayerSpritesheetMapping;
    private _scene: Phaser.Scene;
    private _tileXY: XY;
    private _teamId: string;
    private _remainingWounds: number;
    private _effects: Set<PlayerStatusEffect>;
    private _obj: Phaser.GameObjects.Container;
    private _woundsIndicator: LinearLayout;

    constructor(options: PlayerOptions) {
        this.id = Rand.guid();
        this._scene = options.scene || WarGame.uiMgr.gameplayScene;
        this._playerMgr = options.playerManager;
        this._name = options.name;
        this._stats = options.stats;
        this._spriteMapping = options.spriteMapping;
        this._remainingWounds = this._stats.wounds;
        this._effects = new Set<PlayerStatusEffect>();
    }

    get name(): string {
        return this._name;
    }

    get tileXY(): XY {
        return this._tileXY;
    }

    get obj(): Phaser.GameObjects.Container {
        if (!this._obj) {
            this._createGameObject();
        }
        return this._obj;
    }

    setTile(tileXY: XY): this {
        const worldLocation = WarGame.mapMgr.map.getTileWorldCentre(tileXY);
        if (worldLocation) {
            this._tileXY = tileXY;
            Logging.log('info', 'adding player', this.id, 'to map at:', tileXY, '- world:', worldLocation);
            this.obj.setPosition(worldLocation.x + (this.obj.width / 2), worldLocation.y + (this.obj.height / 2));
            this.obj.setVisible(true);
            WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_MOVED, this);
        }
        return this;
    }

    get teamId(): string {
        return this._teamId;
    }

    setTeamId(id: string): this {
        this._teamId = id;
        this._obj?.destroy();
        this._obj = null;
        return this;
    }

    get stats(): PlayerStats {
        return this._stats;
    }

    wound(): this {
        this._remainingWounds--;
        this._woundsIndicator.removeContent(this._woundsIndicator.contents[0]);
        if (this.isDead()) {
            WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_DIED, this);
            this._scene.tweens.add({
                targets: this.obj,
                alpha: 0,
                yoyo: true,
                loop: 2,
                onComplete: (tween: Phaser.Tweens.Tween, targets: Phaser.GameObjects.Sprite) => {
                    this._playerMgr.removePlayer(this, true);
                }
            })
        }
        return this;
    }

    get statusEffects(): PlayerStatusEffect[] {
        return Array.from(this._effects.values());
    }

    setEffects(...effects: PlayerStatusEffect[]): this {
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                this._effects.add(effects[i]);
            }
        }
        return this;
    }

    removeEffects(...effects: PlayerStatusEffect[]): this {
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                if (this._effects.has(effects[i])) {
                    this._effects.delete(effects[i]);
                }
            }
        }
        return this;
    }

    isDead(): boolean {
        return this._remainingWounds <= 0;
    }

    isAlly(player: IPlayer): boolean {
        return this.teamId === player?.teamId;
    }

    isEnemy(player: IPlayer): boolean {
        return !this.isAlly(player);
    }

    isBattling(): boolean {
        return WarGame.mapMgr.map.getPlayersInRange(this._tileXY, 1).filter((player: IPlayer) => {
            if (player.id !== this.id && WarGame.playerMgr.areEnemies(this, player)) { return true; }
        }).length > 0;
    }

    setScene(scene: Phaser.Scene): this {
        if (scene) {
            this.obj.destroy();
            this._obj = null;
            this._scene = scene;
        }
        return this;
    }

    destroy(): void {
        if (this._obj) {
            this.obj.destroy();
        }
    }

    private _createGameObject(): void {
        this._obj = this._scene.add.container(0, 0);
        this.obj.setDepth(WarGame.DEPTH.PLAYER);
        this.obj.setVisible(false); // set visible when added to map

        const sprite: Phaser.GameObjects.Sprite = this._scene.add.sprite(0, 0, 'players', this._spriteMapping.front);
        sprite.setOrigin(0.5);
        this.obj.add(sprite);

        this._createTeamBackground();

        this.obj.setSize(32, 32);
        this.obj.setInteractive();

        this._createRemainingWoundsIndicator();
    }

    private _createTeamBackground(): void {
        if (this._teamId) {
            const team: Team = WarGame.teamMgr.getTeamById(this._teamId);
            const circle: Phaser.GameObjects.Graphics = this._scene.add.graphics({fillStyle: {color: Rand.colorNumber(team.color)}});
            circle.fillCircle(0, 0, 16);
            this.obj.add(circle);
            this.obj.sendToBack(circle);
        }
    }

    private _createRemainingWoundsIndicator(): void {
        this._woundsIndicator = new LinearLayout(this._scene, {
            y: -20,
            orientation: 'horizontal',
            padding: 2
        });
        this._woundsIndicator.setVisible(false); // only visible on mouseover player
        this.obj.add(this._woundsIndicator);
        for (var i=0; i<this.stats.wounds; i++) {
            let square: Phaser.GameObjects.Graphics = this._scene.add.graphics({fillStyle: {color: 0xff6060}, lineStyle: {color: 0x000000, width: 1}});
            square.fillRect(-2, -2, 4, 4);
            square.strokeRect(-2, -2, 4, 4);
            let squareContainer: Phaser.GameObjects.Container = this._scene.add.container(0, 0, [square]);
            squareContainer.setSize(4, 4);
            this._woundsIndicator.addContents(squareContainer);
        }

        WarGame.evtMgr
            .subscribe(this.id, WarGame.EVENTS.POINTER_OVER, () => this._woundsIndicator.setVisible(true))
            .subscribe(this.id, WarGame.EVENTS.POINTER_OUT, () => this._woundsIndicator.setVisible(false));
    }
}
