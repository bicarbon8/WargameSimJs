export module Constants {
    export const INPUT_HELD_DELAY: number = 100; // milliseconds
    export const CLICK_HANDLING_DELAY: number = 1000; // milliseconds
    export const CAMERA_SCROLL_SPEED: number = 5; // px per update
    export const MAX_TEAMS: number = 9;
    export const MIN_TEAMS: number = 2;
    export const DEPTH_BACKGROUND: number = 0;
    export const DEPTH_MIDGROUND: number = 1;
    export const DEPTH_PLAYER: number = 2;
    export const DEPTH_MENU: number = 3;
    export const CAMERA_MOVE_START_EVENT: string = 'camera-move-start';
    export const CAMERA_MOVE_END_EVENT: string = 'camera-move-end';
    export const CAMERA_ZOOM_EVENT: string = 'camera-zoom';
}