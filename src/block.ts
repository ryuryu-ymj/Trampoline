import { GameObject, Point } from "./game_object";
import { Camera } from "./camera";

export class Block extends GameObject {
    center = new Point(0, 0);
    static readonly WIDTH = 20;

    constructor(camera: Camera, abX: number, abY: number, public rightIsBlock: boolean,
        public leftIsBlock: boolean, public upIsBlock: boolean, public downIsBlock: boolean) {
        super(camera, abX, abY);
        this.setPoint(this.center);
    }

    draw(): void {
    }
}