import { ObjectPool } from "./objectPool";

export let isMouseDown = false;
export let isMousePressed = false;
export let isMouseUp = false;
export let mouseDownX = 0;
export let mouseDownY = 0;
export let mouseUpX = 0;
export let mouseUpY = 0;

export const canvas = <HTMLCanvasElement>document.getElementById('canvas');
export const ctx = canvas.getContext('2d');

// マウス入力
canvas.addEventListener("mousedown", (event: MouseEvent) => {
    isMouseDown = true;
    isMousePressed = true;
    mouseDownX = event.pageX;
    mouseDownY = event.pageY;
    //console.log("mousedown" + mouseDownX + ", " + mouseDownY);
});
canvas.addEventListener("mouseup", (event: MouseEvent) => {
    if (isMousePressed) {
        isMouseUp = true;
        isMousePressed = false;
        mouseUpX = event.pageX;
        mouseUpY = event.pageY;
        //console.log("mouseup" + mouseUpX + ", " + mouseUpY);
    }
});
canvas.addEventListener("mouseleave", (event: MouseEvent) => {
    if (isMousePressed) {
        isMouseUp = true;
        isMousePressed = false;
        mouseUpX = event.pageX;
        mouseUpY = event.pageY;
        //console.log("mouseleave" + mouseUpX + ", " + mouseUpY);
    }
});

// タッチ入力
/*canvas.addEventListener("touchstart", touchStart);
function touchStart(event: TouchEvent) {
    if (event.targetTouches[0].pageX < canvas.width / 2) inputL = true;
    else inputR = true;
}
canvas.addEventListener("touchend", () => {
    inputL = false;
    inputR = false;
});*/

let objectPool = new ObjectPool();
let state = 0;

function render() {
    // 画面のクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (state) {
        case 0:
            objectPool.startLoadingStage();
            state = 1;
            break;
        case 1:
            if (objectPool.continueLoadingStage()) {
                state = 2;
            }
            break;
        case 2:
            objectPool.startStage();
            state = 3;
            break;
        case 3:
            objectPool.draw();
            objectPool.update();
            break;
    }
    if (isMouseDown) isMouseDown = false;
    if (isMouseUp) isMouseUp = false;

    window.requestAnimationFrame(render);
}

render();