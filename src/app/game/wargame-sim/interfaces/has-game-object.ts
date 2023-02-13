export interface HasGameObject<T extends Phaser.GameObjects.GameObject> {
    readonly obj: T;
}