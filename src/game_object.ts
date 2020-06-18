import { canvas } from "./main";
import { Camera } from "./camera";

export abstract class GameObject {
    private points = new Array<Point>();

    constructor(private camera: Camera, protected abX: number, protected abY: number) { }

    protected setPoint(point: Point) {
        this.points[0] = point;
        this.update();
    }
    protected setPoints(points: Point[]) {
        this.points = points;
        this.update();
    }

    abstract draw(): void;
    
    update() {
        let screenX = this.abX - this.camera.abX + canvas.WIDTH / 2;
        let screenY = -this.abY + this.camera.abY + canvas.HEIGHT / 2;
        this.points.forEach(it => it.update(this.abX, this.abY, screenX, screenY));
    }
}

export class Point {
    private _abX = 0; private _abY = 0;
    get abX() { return this._abX }
    get abY() { return this._abY }
    private _screenX = 0; private _screenY = 0;
    get screenX() { return this._screenX }
    get screenY() { return this._screenY }

    constructor(public reX: number, public reY: number) { }

    update(originAbX: number, originAbY: number, orginScreenX: number, originScreenY: number) {
        this._abX = originAbX + this.reX;
        this._abY = originAbY + this.reY;
        this._screenX = orginScreenX + this.reX;
        this._screenY = originScreenY - this.reY;
    }
}