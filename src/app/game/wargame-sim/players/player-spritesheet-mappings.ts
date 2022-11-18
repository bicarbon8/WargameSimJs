export interface PlayerSpritesheetMapping {
    readonly front: number;
    readonly back: number;
}

class Basic implements PlayerSpritesheetMapping {
    readonly front: number = 1;
    readonly back: number = 37;
}
class Heavy implements PlayerSpritesheetMapping {
    readonly front: number = 10;
    readonly back: number = 46;
}
class Light implements PlayerSpritesheetMapping {
    readonly front: number = 7;
    readonly back: number = 43;
}
class Hero implements PlayerSpritesheetMapping {
    readonly front: number = 49;
    readonly back: number = 85;
}

export module PlayerSpritesheetMappings {
    export var basic: PlayerSpritesheetMapping = new Basic();
    export var heavy: PlayerSpritesheetMapping = new Heavy();
    export var light: PlayerSpritesheetMapping = new Light();
    export var hero: PlayerSpritesheetMapping = new Hero();
}