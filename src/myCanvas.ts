import { Camera } from "./camera";

export let isMouseDown = false;
export let isMousePressed = false;
export let isMouseUp = false;
export let mouseDownX = 0;
export let mouseDownY = 0;
export let mouseUpX = 0;
export let mouseUpY = 0;

export class MyCanvas {
    private readonly canvas = <HTMLCanvasElement>document.getElementById('canvas');
    private readonly ctx = this.canvas.getContext('2d');
    readonly WIDTH = 400;
    readonly HEIGHT = 711;

    constructor() {
        // マウス入力
        this.canvas.addEventListener("mousedown", (event: MouseEvent) => {
            isMouseDown = true;
            isMousePressed = true;
            mouseDownX = event.pageX;
            mouseDownY = event.pageY;
            //console.log("mousedown" + mouseDownX + ", " + mouseDownY);
        });
        this.canvas.addEventListener("mouseup", (event: MouseEvent) => {
            if (isMousePressed) {
                isMouseUp = true;
                isMousePressed = false;
                mouseUpX = event.pageX;
                mouseUpY = event.pageY;
                //console.log("mouseup" + mouseUpX + ", " + mouseUpY);
            }
        });
        this.canvas.addEventListener("mouseleave", (event: MouseEvent) => {
            if (isMousePressed) {
                isMouseUp = true;
                isMousePressed = false;
                mouseUpX = event.pageX;
                mouseUpY = event.pageY;
                //console.log("mouseleave" + mouseUpX + ", " + mouseUpY);
            }
        });

        // タッチ入力
        /*this.canvas.addEventListener("touchstart", touchStart);
        function touchStart(event: TouchEvent) {
            if (event.targetTouches[0].pageX < this.canvas.width / 2) inputL = true;
            else inputR = true;
        }
        this.canvas.addEventListener("touchend", () => {
            inputL = false;
            inputR = false;
        });*/
    }

    /** 更新処理　毎フレーム呼ぶ必要がある */
    begin() {
        // 画面サイズに合わせてcanvasのサイズを調整する
        let unit = Math.min(document.body.offsetWidth / 9, document.documentElement.clientHeight * 0.95 / 16);
        this.canvas.width = unit * 9;
        this.canvas.height = unit * 16;

        // 画面のクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    end() {
        if (isMouseDown) isMouseDown = false;
        if (isMouseUp) isMouseUp = false;
    }

    drawImage(image: CanvasImageSource, x: number, y: number, width: number, height: number, margin: number = 0) {
        let cmargin = margin * this.canvas.width / this.WIDTH;
        let cx = x * this.canvas.width / this.WIDTH - cmargin;
        let cy = y * this.canvas.height / this.HEIGHT - cmargin;
        let cw = width * this.canvas.width / this.WIDTH + cmargin * 2;
        let ch = height * this.canvas.height / this.HEIGHT + cmargin * 2;
        this.ctx.drawImage(image, cx, cy, cw, ch);
    }

    drawLine(color: string, x1: number, y1: number, x2: number, y2: number) {
        let cx1 = x1 * this.canvas.width / this.WIDTH;
        let cy1 = y1 * this.canvas.height / this.HEIGHT;
        let cx2 = x2 * this.canvas.width / this.WIDTH;
        let cy2 = y2 * this.canvas.height / this.HEIGHT;
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(cx1, cy1);
        this.ctx.lineTo(cx2, cy2);
        this.ctx.stroke();
    }

    getAbXFromCanvas(camera: Camera, canvasX: number) {
        return camera.abX - this.WIDTH / 2 + canvasX * this.WIDTH / this.canvas.width;
    }

    getAbYFromCanvas(camera: Camera, canvasY: number) {
        return camera.abY + this.HEIGHT / 2 - canvasY * this.HEIGHT / this.canvas.height;
    }
}