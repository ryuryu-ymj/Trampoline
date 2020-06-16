import { GameObject, Point } from "./game_object";
import { ctx, canvas, asset } from "./main";
import { Camera } from "./camera";

export class Ball extends GameObject {
    center = new Point(0, 0);
    static readonly RADIUS = 5;
    private static readonly MAX_SPEED = 7;
    private static readonly BOUND_COEF = 0.9;
    private _dx = 0;
    private _dy = 0;
    get dx() { return this._dx }
    get dy() { return this._dy }
    private img = asset.getImage("ball.png");

    constructor(camera: Camera) {
        super(camera, canvas.width / 2, canvas.height / 2);
        this.setPoint(this.center);
    }

    draw(): void {
        ctx.drawImage(this.img, this.center.screenX, this.center.screenY);
    }

    update(): void {
        if (this.center.screenX - Ball.RADIUS < 0) {
            this._dx = -this._dx;
        } else if (this.center.screenX + Ball.RADIUS > canvas.width) {
            this._dx = -this._dx;
        }
        
        if (this._dx > Ball.MAX_SPEED) {
            this._dx = Ball.MAX_SPEED;
        }
        else if (this._dx < -Ball.MAX_SPEED) {
            this._dx = -Ball.MAX_SPEED;
        }
        if (this._dy > Ball.MAX_SPEED) {
            this._dy = Ball.MAX_SPEED;
        }
        else if (this._dy < -Ball.MAX_SPEED) {
            this._dy = -Ball.MAX_SPEED;
        }
        this.abX += this._dx;
        this.abY += this._dy;

        this._dy -= 0.06;

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
        this._dx = -this._dx * Ball.BOUND_COEF;
        this.abX = wallX + Ball.RADIUS;
    }

    boundToLeft(wallX: number) {
        this._dx = -this._dx * Ball.BOUND_COEF;
        this.abX = wallX - Ball.RADIUS;
    }

    boundUp(wallY: number) {
        this._dy = -this._dy * Ball.BOUND_COEF;
        this.abY = wallY + Ball.RADIUS;
    }

    boundDown(wallY: number) {
        this._dy = -this._dy * Ball.BOUND_COEF;
        this.abY = wallY - Ball.RADIUS;
    }
}