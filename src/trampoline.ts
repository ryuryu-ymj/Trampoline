import { GameObject, Point } from "./game_object";
import { Camera } from "./camera";
import { canvas } from "./main";

export class Trampoline extends GameObject {
    public begin: Point;
    public end: Point;

    counter = 0;

    constructor(camera: Camera, beginCanvasX: number, beginCanvasY: number, endCanvasX: number, endCanvasY: number) {
        super(camera, canvas.getAbXFromCanvas(camera, beginCanvasX), canvas.getAbYFromCanvas(camera, beginCanvasY));
        this.begin = new Point(0, 0);
        this.end = new Point(canvas.getAbXFromCanvas(camera, endCanvasX) - this.abX, canvas.getAbYFromCanvas(camera, endCanvasY) - this.abY);
        this.setPoints([this.begin, this.end]);
    }

    draw(): void {
        canvas.drawLine("green", this.begin.screenX, this.begin.screenY, this.end.screenX, this.end.screenY);
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