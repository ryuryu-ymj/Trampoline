import { ObjectPool } from "./objectPool";
import { AssetManager } from "./assetManager";
import { MyCanvas } from "./myCanvas";

export const canvas = new MyCanvas();
export const asset = new AssetManager();
asset.loadImage("ball.png");

let objectPool: ObjectPool;
let state = 0;

function render() {
    canvas.begin();
    switch (state) {
        case 0:
            if (asset.update()) {
                state++;
            }
            break;
        case 1:
            objectPool = new ObjectPool();
            objectPool.startLoadingStage();
            state++;
            break;
        case 2:
            if (objectPool.continueLoadingStage()) {
                state++;
            }
            break;
        case 3:
            objectPool.startStage();
            state++;
            break;
        case 4:
            objectPool.draw();
            objectPool.update();
            if (objectPool.isGameOver()) {
                state = 0;
            }
            break;
    }
    canvas.end();

    window.requestAnimationFrame(render);
}

render();