import { ctx, canvas, isMouseUp, mouseUpX, mouseDownY, mouseDownX, mouseUpY } from "./main";
import { Camera } from "./camera";
import { Trampoline } from "./trampoline";
import { Ball } from "./ball";
import { Block } from "./block";
import { Stage } from "./stage";

export class ObjectPool {
    private previousTime = new Date().getTime();

    private camera = new Camera();
    private ball = new Ball(this.camera);
    private trampolines = new Array<Trampoline>();
    private blocks = new Array<Block>();

    private stage = new Stage();

    constructor() {
        //this.stage.addBlock(this.blocks, this.camera);
    }

    startLoadingStage() {
        this.stage.startLoadingStage(1);
    }

    /**
     * @returns 読み込みが終わったか否か
     */
    continueLoadingStage() {
        return !this.stage.isLoading;
    }

    startStage() {
        this.stage.addBlock(this.blocks, this.camera);
    }

    draw() {
        this.blocks.forEach(it => it.draw());
        this.trampolines.forEach(it => it.draw());
        this.ball.draw();

        ctx.strokeStyle = "gray";
        ctx.beginPath();
        for (let x = 100 - this.camera.abX % 100; x < canvas.width; x += 100) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        for (let y = 100 - this.camera.abY % 100; y < canvas.height; y += 100) {
            ctx.moveTo(0, canvas.height - y);
            ctx.lineTo(canvas.width, canvas.height - y);
        }
        ctx.stroke();
    }

    update() {
        // 経過時間の測定
        let presentTime = new Date().getTime();
        let delta = (presentTime - this.previousTime) / 1000;
        //console.log("fps = " + 1 / delta);
        this.previousTime = presentTime;

        this.stage.addBlock(this.blocks, this.camera);
        {
            if (this.blocks.some(it => { return it.center.screenY - Block.WIDTH / 2 > canvas.height })) {
                this.blocks.shift();
                //console.log("delete block");
            }
        }

        // trampolineの追加
        if (isMouseUp) {
            this.trampolines.push(new Trampoline(this.camera, mouseDownX, mouseDownY, mouseUpX, mouseUpY));
        }
        // 一定時間経過後のtrampolineを消去
        if (this.trampolines.some(it => { return !it.isActive(); })) {
            this.trampolines.shift();
        }
        {// trampolineとballの衝突判定
            let trampoline = this.trampolines.find(it => {
                return ObjectPool.judgeIntersected(
                    it.begin.abX, it.begin.abY, it.end.abX, it.end.abY,
                    this.ball.center.abX, this.ball.center.abY,
                    this.ball.center.abX + this.ball.dx, this.ball.center.abY + this.ball.dy
                )
            })
            if (trampoline != undefined) {
                this.ball.jump(trampoline.getJumpAngle(), trampoline.getJumpPower());
                //console.log(trampoline.getJumpPower());
            }
        }
        { // blockとballの衝突判定
            //let max = this.ball.radius + Block.WIDTH / 2;
            let minIndex = -1;
            let minDistance = Math.pow(this.ball.RADIUS + Block.WIDTH / 2, 2);
            for (let i = 0; i < this.blocks.length; i++) {
                let distance = Math.pow(this.ball.center.abX - this.blocks[i].center.abX, 2) +
                    Math.pow(this.ball.center.abY - this.blocks[i].center.abY, 2);
                if (distance < minDistance) {
                    minIndex = i;
                    minDistance = distance;
                }
            }
            if (minIndex != -1) {
                let dx = this.ball.center.abX - this.blocks[minIndex].center.abX;
                let dy = this.ball.center.abY - this.blocks[minIndex].center.abY;
                let a = dy / dx;
                if (a > -1 && a < 1) {
                    //this.ball.boundX();
                    if (dx > 0) {
                        this.ball.boundToRight(this.blocks[minIndex].center.abX + Block.WIDTH / 2);
                    } else {
                        this.ball.boundToLeft(this.blocks[minIndex].center.abX - Block.WIDTH / 2);
                    }
                } else {
                    //this.ball.boundY();
                    if (dy > 0) {
                        this.ball.boundUp(this.blocks[minIndex].center.abY + Block.WIDTH / 2);
                    } else {
                        this.ball.boundDown(this.blocks[minIndex].center.abY - Block.WIDTH / 2);
                    }
                }
            }
        }
        // カメラをballに追随
        if (this.ball.center.screenY < canvas.height / 2) {
            this.camera.abY = this.ball.center.abY;
        }
        this.ball.update();
        this.trampolines.forEach(it => it.update());
        this.blocks.forEach(it => it.update());
    }

    isGameOver() {
        return this.ball.center.screenY > canvas.height;
    }

    /** 線分の交差判定 */
    private static judgeIntersected(ax: number, ay: number, bx: number, by: number,
        cx: number, cy: number, dx: number, dy: number) {
        let ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
        let tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
        let tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
        let td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);

        return tc * td < 0 && ta * tb < 0;
    }
}