import { canvas } from "./main";
import { Camera } from "./camera";
import { Trampoline } from "./trampoline";
import { Ball } from "./ball";
import { Block } from "./block";
import { Stage } from "./stage";
import { Spine } from "./spine";
import { isMouseUp, mouseDownX, mouseDownY, mouseUpX, mouseUpY } from "./myCanvas";

export class ObjectPool {
    private previousTime = new Date().getTime();
    private _isGameOver = false;

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
    }

    update() {
        //console.log(this.blocks.length);
        // 経過時間の測定
        let presentTime = new Date().getTime();
        let delta = (presentTime - this.previousTime) / 1000;
        //console.log("fps = " + 1 / delta);
        this.previousTime = presentTime;

        this.stage.addBlock(this.blocks, this.camera);
        {
            if (this.blocks.some(it => { return it.center.screenY - Block.WIDTH / 2 > canvas.HEIGHT })) {
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

        for (let i = 0; i < this.blocks.length; i++) {
            let rx = this.ball.center.abX - this.blocks[i].center.abX;
            let ry = this.ball.center.abY - this.blocks[i].center.abY;
            if (rx >= - Block.WIDTH / 2 - Ball.RADIUS && rx <= Block.WIDTH / 2 + Ball.RADIUS &&
                ry >= - Block.WIDTH / 2 - Ball.RADIUS && ry <= Block.WIDTH / 2 + Ball.RADIUS) {
                if (this.blocks[i] instanceof Spine) {
                    this._isGameOver = true;
                    break;
                }
                let dir = 0;
                let right = this.blocks[i].rightIsBlock;
                let left = this.blocks[i].leftIsBlock;
                let up = this.blocks[i].upIsBlock;
                let down = this.blocks[i].downIsBlock;
                if (this.ball.dx > 0) {
                    if (this.ball.dy > 0) {
                        if (left && down) {
                            continue;
                        } else if (left) {
                            dir = 3;
                        } else if (down) {
                            dir = 2;
                        } else if (ry < ry) {
                            dir = 3;
                        } else {
                            dir = 2;
                        }
                    } else {
                        if (up && left) {
                            continue;
                        } else if (up) {
                            dir = 2;
                        } else if (left) {
                            dir = 1;
                        } else if (ry < -ry) {
                            dir = 2;
                        } else {
                            dir = 1;
                        }
                    }
                } else {
                    if (this.ball.dy > 0) {
                        if (right && down) {
                            continue;
                        } else if (right) {
                            dir = 3;
                        } else if (down) {
                            dir = 0;
                        } else if (ry < -ry) {
                            dir = 3;
                        } else {
                            dir = 0;
                        }
                    } else {
                        if (up && right) {
                            continue;
                        } else if (up) {
                            dir = 0;
                        } else if (right) {
                            dir = 1;
                        } else if (ry < ry) {
                            dir = 0;
                        } else {
                            dir = 1;
                        }
                    }
                }
                switch (dir) {
                    case 0:
                        this.ball.boundToRight(this.blocks[i].center.abX + Block.WIDTH / 2);
                        break;
                    case 1:
                        this.ball.boundUp(this.blocks[i].center.abY + Block.WIDTH / 2);
                        break;
                    case 2:
                        this.ball.boundToLeft(this.blocks[i].center.abX - Block.WIDTH / 2);
                        break;
                    case 3:
                        this.ball.boundDown(this.blocks[i].center.abY - Block.WIDTH / 2);
                        break;
                }
                break;
            }
        }

        // カメラをballに追随
        if (this.ball.center.abY > this.camera.abY + 60) {
            this.camera.abY = this.ball.center.abY - 60;
        }
        this.ball.update();
        this.trampolines.forEach(it => it.update());
        this.blocks.forEach(it => it.update());

        if (this.ball.center.screenY > canvas.HEIGHT) {
            this._isGameOver = true;
        }
    }

    isGameOver() {
        return this._isGameOver;
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