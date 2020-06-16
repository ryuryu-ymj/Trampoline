import { ctx, canvas } from "./main";

export class MyCanvas {
    private readonly canvas = <HTMLCanvasElement>document.getElementById('canvas');
    private readonly ctx = this.canvas.getContext('2d');
    readonly WIDTH = 400;
    readonly HEIGHT = 711;

    /** 画面サイズに合わせてcanvasのサイズを調整する */
    fitSize() {
        let unit = Math.min(document.body.offsetWidth / 9, document.documentElement.clientHeight * 0.95 / 16);
        this.canvas.width = unit * 9;
        this.canvas.height = unit * 16;
    }

    drawImage(image: CanvasImageSource, x: number, y: number, width: number, height: number) {
        let cx = x * canvas.width / this.WIDTH;
        let cy = y * canvas.height / this.HEIGHT;
        let cw = width * canvas.width / this.WIDTH;
        let ch = height * canvas.height / this.HEIGHT;
        ctx.drawImage(image, cx, cy, cw, ch);
    }
}