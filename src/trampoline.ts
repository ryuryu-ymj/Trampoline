import { GameObject, Point } from "./game_object";
import { Camera } from "./camera";
import { ctx } from "./main";

export class Trampoline extends GameObject {
    public begin: Point;
    public end: Point;

    counter = 0;

    constructor(camera: Camera, beginScreenX: number, beginScreenY: number, endScreenX: number, endScreenY: number) {
        super(camera, 0, 0);
        this.setScreenPosition(beginScreenX, beginScreenY);
        this.begin = new Point(0, 0);
        this.end = new Point(endScreenX - beginScreenX, -endScreenY + beginScreenY);
        this.setPoints([this.begin, this.end]);
    }

    draw(): void {
        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.moveTo(this.begin.screenX, this.begin.screenY);
        ctx.lineTo(this.end.screenX, this.end.screenY);
        ctx.stroke();
    }

    update(): void {
        this.counter ++;
        super.update();
    }

    isActive() {
        return this.counter < 180;
    }

    getJumpAngle() {
        return Math.atan((this.end.abY - this.begin.abY) / (this.end.abX - this.begin.abX)) + Math.PI / 2;
    }

    getJumpPower() {
        let length = Math.sqrt(Math.pow(this.end.abX - this.begin.abX, 2) + Math.pow(this.end.abY - this.begin.abY, 2));
        if (length > 500) length = 500;
        return (1 - length / 500) * 6;
    }
}