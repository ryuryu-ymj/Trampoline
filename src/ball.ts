import { GameObject, Point } from "./game_object";
import { ctx, canvas } from "./main";
import { Camera } from "./camera";

export class Ball extends GameObject {
    center = new Point(0, 0);
    readonly RADIUS = 5;
    private readonly MAX_SPEED = 7;
    private _dx = 0;
    private _dy = 0;
    get dx() { return this._dx }
    get dy() { return this._dy }

    constructor(camera: Camera) {
        super(camera, canvas.width / 2, canvas.height / 2);
        this.setPoint(this.center);
    }

    draw(): void {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(this.center.screenX, this.center.screenY, this.RADIUS, 0, Math.PI * 2);
        ctx.fill();
    }

    update(): void {
        if (this.center.screenX - this.RADIUS < 0) {
            this._dx = -this._dx;
        } else if (this.center.screenX + this.RADIUS > canvas.width) {
            this._dx = -this._dx;
        }

        this._dy -= 0.06;
        if (this._dx > this.MAX_SPEED) {
            this._dx = this.MAX_SPEED;
        }
        else if (this._dx < -this.MAX_SPEED) {
            this._dx = -this.MAX_SPEED;
        }
        if (this._dy > this.MAX_SPEED) {
            this._dy = this.MAX_SPEED;
        }
        else if (this._dy < -this.MAX_SPEED) {
            this._dy = -this.MAX_SPEED;
        }
        this.abX += this._dx;
        this.abY += this._dy;

        //console.log(this.dy);
        super.update();
    }

    jump(angle: number, power: number) {
        this._dx = power * Math.cos(angle);
        this._dy = power * Math.sin(angle);
    }

    /*boundX() {
        this._dx = -this._dx;
    }
    boundY() {
        this._dy = -this._dy;
    }*/

    boundToRight(wallX: number) {
        this._dx = -this._dx;
        this.abX = wallX + this.RADIUS;
    }

    boundToLeft(wallX: number) {
        this._dx = -this._dx;
        this.abX = wallX - this.RADIUS;
    }

    boundUp(wallY: number) {
        this._dy = -this._dy;
        this.abY = wallY + this.RADIUS;
    }

    boundDown(wallY: number) {
        this._dy = -this._dy;
        this.abY = wallY - this.RADIUS;
    }
}