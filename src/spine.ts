import { Block } from "./block";
import { ctx } from "./main";
import { Point } from "./game_object";
import { Camera } from "./camera";

export class Spine extends Block {
    shape:Point[];
    
    constructor(camera: Camera, abX: number, abY: number) {
        super(camera, abX, abY, false, false, false, false);
        this.shape = new Array(8);
        const WIDTH = Block.WIDTH;
        this.shape[0] = new Point(0, WIDTH / 2);
        this.shape[1] = new Point(WIDTH / 6, WIDTH / 6);
        this.shape[2] = new Point(WIDTH / 2, 0);
        this.shape[3] = new Point(WIDTH / 6, -WIDTH / 6);
        this.shape[4] = new Point(0, -WIDTH / 2);
        this.shape[5] = new Point(-WIDTH / 6, -WIDTH / 6);
        this.shape[6] = new Point(-WIDTH / 2, 0);
        this.shape[7] = new Point(-WIDTH / 6, WIDTH / 6);
        this.setPoints(this.shape);
    }
    
    draw() {
        ctx.fillStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(this.shape[0].screenX, this.shape[0].screenY);
        for (let i = 1; i < this.shape.length; i++) {
            ctx.lineTo(this.shape[i].screenX, this.shape[i].screenY);
        }
        ctx.fill();
    }
}