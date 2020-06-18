define("assetManager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AssetManager {
        constructor() {
            this.imgs = new Array();
            this.nameList = new Array();
            this.loadCnt = 0;
        }
        loadImage(fileName) {
            this.loadCnt++;
            let img = new Image();
            img.onload = () => {
                this.loadCnt--;
            };
            img.src = "img/" + fileName;
            this.imgs.push(img);
            this.nameList.push(fileName);
        }
        update() {
            return this.loadCnt == 0;
        }
        getImage(fileName) {
            return this.imgs[this.nameList.findIndex(it => it == fileName)];
        }
    }
    exports.AssetManager = AssetManager;
});
define("camera", ["require", "exports", "main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Camera {
        constructor() {
            this.abX = main_1.canvas.WIDTH / 2;
            this.abY = main_1.canvas.HEIGHT / 2;
        }
    }
    exports.Camera = Camera;
});
define("trampoline", ["require", "exports", "game_object", "main"], function (require, exports, game_object_1, main_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Trampoline extends game_object_1.GameObject {
        constructor(camera, beginCanvasX, beginCanvasY, endCanvasX, endCanvasY) {
            super(camera, main_2.canvas.getAbXFromCanvas(camera, beginCanvasX), main_2.canvas.getAbYFromCanvas(camera, beginCanvasY));
            this.counter = 0;
            this.begin = new game_object_1.Point(0, 0);
            this.end = new game_object_1.Point(main_2.canvas.getAbXFromCanvas(camera, endCanvasX) - this.abX, main_2.canvas.getAbYFromCanvas(camera, endCanvasY) - this.abY);
            this.setPoints([this.begin, this.end]);
        }
        draw() {
            main_2.canvas.drawLine("green", this.begin.screenX, this.begin.screenY, this.end.screenX, this.end.screenY);
        }
        update() {
            this.counter++;
            super.update();
        }
        isActive() {
            return this.counter < 180;
        }
        getJumpAngle() {
            return Math.atan((this.end.abY - this.begin.abY) / (this.end.abX - this.begin.abX)) + Math.PI / 2;
        }
        getJumpPower() {
            let length = Math.sqrt(Math.pow(this.end.abX - this.begin.abX, 2) + Math.pow(this.end.abY - this.begin.abY, 2));
            if (length > 500)
                length = 500;
            return (1 - length / 500) * 6;
        }
    }
    exports.Trampoline = Trampoline;
});
define("block", ["require", "exports", "game_object"], function (require, exports, game_object_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Block extends game_object_2.GameObject {
        constructor(camera, abX, abY, rightIsBlock, leftIsBlock, upIsBlock, downIsBlock) {
            super(camera, abX, abY);
            this.rightIsBlock = rightIsBlock;
            this.leftIsBlock = leftIsBlock;
            this.upIsBlock = upIsBlock;
            this.downIsBlock = downIsBlock;
            this.center = new game_object_2.Point(0, 0);
            this.setPoint(this.center);
        }
        draw() {
        }
    }
    exports.Block = Block;
    Block.WIDTH = 20;
});
define("spine", ["require", "exports", "block"], function (require, exports, block_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Spine extends block_1.Block {
        constructor(camera, abX, abY) {
            super(camera, abX, abY, false, false, false, false);
        }
        draw() {
        }
    }
    exports.Spine = Spine;
});
define("stage", ["require", "exports", "block", "main", "spine"], function (require, exports, block_2, main_3, spine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Stage {
        constructor() {
            this._isLoading = false;
            this.xhr = new XMLHttpRequest();
            this.loadAbY = 0;
            this.loadLine = 0;
            this.csvData = new Array;
        }
        get isLoading() { return this._isLoading; }
        startLoadingStage(stageNum) {
            // TODO 
            this._isLoading = true;
            this.xhr.open("GET", "stageData/stage" + ("00" + stageNum).slice(-2) + ".csv", true);
            this.xhr.send();
            this.xhr.onload = (ev) => {
                this._isLoading = false;
                let text = this.xhr.responseText;
                let lines = text.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    this.csvData[i] = lines[i].split(",");
                }
                //console.log(this.csvData);
            };
            this.xhr.onerror = (ev) => {
                console.error("ステージの読み込みに失敗しました" + this.xhr.status);
            };
            /*let response = await fetch("stageData/stage01");
    
            if (response.ok) { // HTTP ステータスが 200-299 の場合
                // レスポンスの本文を取得(後述)
                let text = await response.text();
                console.log(text);
            } else {
                alert("HTTP-Error: " + response.status);
            }*/
        }
        addBlock(blocks, camera) {
            if (camera.abY > this.loadAbY - main_3.canvas.HEIGHT / 2) {
                this.loadAbY += main_3.canvas.HEIGHT / 2;
                while (true) {
                    if (this.loadLine >= this.csvData.length) {
                        break;
                    }
                    let abY = Number.parseInt(this.csvData[this.loadLine][2]);
                    if (abY > this.loadAbY) {
                        break;
                    }
                    let abX = Number.parseInt(this.csvData[this.loadLine][1]);
                    switch (this.csvData[this.loadLine][0]) {
                        case "block":
                            let rightIsBlock = this.csvData[this.loadLine][3] == "true";
                            let leftIsBlock = this.csvData[this.loadLine][4] == "true";
                            let upIsBlock = this.csvData[this.loadLine][5] == "true";
                            let downIsBlock = this.csvData[this.loadLine][6] == "true";
                            blocks.push(new block_2.Block(camera, abX, abY, rightIsBlock, leftIsBlock, upIsBlock, downIsBlock));
                            break;
                        case "spine":
                            blocks.push(new spine_1.Spine(camera, abX, abY));
                            break;
                    }
                    this.loadLine++;
                }
            }
        }
    }
    exports.Stage = Stage;
});
define("myCanvas", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isMouseDown = false;
    exports.isMousePressed = false;
    exports.isMouseUp = false;
    exports.mouseDownX = 0;
    exports.mouseDownY = 0;
    exports.mouseUpX = 0;
    exports.mouseUpY = 0;
    class MyCanvas {
        constructor() {
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.WIDTH = 400;
            this.HEIGHT = 711;
            // マウス入力
            this.canvas.addEventListener("mousedown", (event) => {
                exports.isMouseDown = true;
                exports.isMousePressed = true;
                exports.mouseDownX = event.pageX;
                exports.mouseDownY = event.pageY;
                //console.log("mousedown" + mouseDownX + ", " + mouseDownY);
            });
            this.canvas.addEventListener("mouseup", (event) => {
                if (exports.isMousePressed) {
                    exports.isMouseUp = true;
                    exports.isMousePressed = false;
                    exports.mouseUpX = event.pageX;
                    exports.mouseUpY = event.pageY;
                    //console.log("mouseup" + mouseUpX + ", " + mouseUpY);
                }
            });
            this.canvas.addEventListener("mouseleave", (event) => {
                if (exports.isMousePressed) {
                    exports.isMouseUp = true;
                    exports.isMousePressed = false;
                    exports.mouseUpX = event.pageX;
                    exports.mouseUpY = event.pageY;
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
            if (exports.isMouseDown)
                exports.isMouseDown = false;
            if (exports.isMouseUp)
                exports.isMouseUp = false;
        }
        drawImage(image, x, y, width, height, margin = 0) {
            let cmargin = margin * this.canvas.width / this.WIDTH;
            let cx = x * this.canvas.width / this.WIDTH - cmargin;
            let cy = y * this.canvas.height / this.HEIGHT - cmargin;
            let cw = width * this.canvas.width / this.WIDTH + cmargin * 2;
            let ch = height * this.canvas.height / this.HEIGHT + cmargin * 2;
            this.ctx.drawImage(image, cx, cy, cw, ch);
        }
        drawLine(color, x1, y1, x2, y2) {
            let cx1 = x1 * this.canvas.width / this.WIDTH;
            let cy1 = y1 * this.canvas.height / this.HEIGHT;
            let cx2 = x2 * this.canvas.width / this.WIDTH;
            let cy2 = y2 * this.canvas.height / this.HEIGHT;
            this.ctx.strokeStyle = color;
            this.ctx.moveTo(cx1, cy1);
            this.ctx.lineTo(cx2, cy2);
            this.ctx.stroke();
        }
        getAbXFromCanvas(camera, canvasX) {
            return camera.abX - this.WIDTH / 2 + canvasX * this.WIDTH / this.canvas.width;
        }
        getAbYFromCanvas(camera, canvasY) {
            return camera.abY + this.HEIGHT / 2 - canvasY * this.HEIGHT / this.canvas.height;
        }
    }
    exports.MyCanvas = MyCanvas;
});
define("objectPool", ["require", "exports", "main", "camera", "trampoline", "ball", "block", "stage", "spine", "myCanvas"], function (require, exports, main_4, camera_1, trampoline_1, ball_1, block_3, stage_1, spine_2, myCanvas_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ObjectPool {
        constructor() {
            this.previousTime = new Date().getTime();
            this._isGameOver = false;
            this.camera = new camera_1.Camera();
            this.ball = new ball_1.Ball(this.camera);
            this.trampolines = new Array();
            this.blocks = new Array();
            this.stage = new stage_1.Stage();
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
                if (this.blocks.some(it => { return it.center.screenY - block_3.Block.WIDTH / 2 > main_4.canvas.HEIGHT; })) {
                    this.blocks.shift();
                    //console.log("delete block");
                }
            }
            // trampolineの追加
            if (myCanvas_1.isMouseUp) {
                this.trampolines.push(new trampoline_1.Trampoline(this.camera, myCanvas_1.mouseDownX, myCanvas_1.mouseDownY, myCanvas_1.mouseUpX, myCanvas_1.mouseUpY));
            }
            // 一定時間経過後のtrampolineを消去
            if (this.trampolines.some(it => { return !it.isActive(); })) {
                this.trampolines.shift();
            }
            { // trampolineとballの衝突判定
                let trampoline = this.trampolines.find(it => {
                    return ObjectPool.judgeIntersected(it.begin.abX, it.begin.abY, it.end.abX, it.end.abY, this.ball.center.abX, this.ball.center.abY, this.ball.center.abX + this.ball.dx, this.ball.center.abY + this.ball.dy);
                });
                if (trampoline != undefined) {
                    this.ball.jump(trampoline.getJumpAngle(), trampoline.getJumpPower());
                    //console.log(trampoline.getJumpPower());
                }
            }
            for (let i = 0; i < this.blocks.length; i++) {
                let rx = this.ball.center.abX - this.blocks[i].center.abX;
                let ry = this.ball.center.abY - this.blocks[i].center.abY;
                if (rx >= -block_3.Block.WIDTH / 2 - ball_1.Ball.RADIUS && rx <= block_3.Block.WIDTH / 2 + ball_1.Ball.RADIUS &&
                    ry >= -block_3.Block.WIDTH / 2 - ball_1.Ball.RADIUS && ry <= block_3.Block.WIDTH / 2 + ball_1.Ball.RADIUS) {
                    if (this.blocks[i] instanceof spine_2.Spine) {
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
                            }
                            else if (left) {
                                dir = 3;
                            }
                            else if (down) {
                                dir = 2;
                            }
                            else if (ry < ry) {
                                dir = 3;
                            }
                            else {
                                dir = 2;
                            }
                        }
                        else {
                            if (up && left) {
                                continue;
                            }
                            else if (up) {
                                dir = 2;
                            }
                            else if (left) {
                                dir = 1;
                            }
                            else if (ry < -ry) {
                                dir = 2;
                            }
                            else {
                                dir = 1;
                            }
                        }
                    }
                    else {
                        if (this.ball.dy > 0) {
                            if (right && down) {
                                continue;
                            }
                            else if (right) {
                                dir = 3;
                            }
                            else if (down) {
                                dir = 0;
                            }
                            else if (ry < -ry) {
                                dir = 3;
                            }
                            else {
                                dir = 0;
                            }
                        }
                        else {
                            if (up && right) {
                                continue;
                            }
                            else if (up) {
                                dir = 0;
                            }
                            else if (right) {
                                dir = 1;
                            }
                            else if (ry < ry) {
                                dir = 0;
                            }
                            else {
                                dir = 1;
                            }
                        }
                    }
                    switch (dir) {
                        case 0:
                            this.ball.boundToRight(this.blocks[i].center.abX + block_3.Block.WIDTH / 2);
                            break;
                        case 1:
                            this.ball.boundUp(this.blocks[i].center.abY + block_3.Block.WIDTH / 2);
                            break;
                        case 2:
                            this.ball.boundToLeft(this.blocks[i].center.abX - block_3.Block.WIDTH / 2);
                            break;
                        case 3:
                            this.ball.boundDown(this.blocks[i].center.abY - block_3.Block.WIDTH / 2);
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
            if (this.ball.center.screenY > main_4.canvas.HEIGHT) {
                this._isGameOver = true;
            }
        }
        isGameOver() {
            return this._isGameOver;
        }
        /** 線分の交差判定 */
        static judgeIntersected(ax, ay, bx, by, cx, cy, dx, dy) {
            let ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
            let tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
            let tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
            let td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);
            return tc * td < 0 && ta * tb < 0;
        }
    }
    exports.ObjectPool = ObjectPool;
});
define("main", ["require", "exports", "objectPool", "assetManager", "myCanvas"], function (require, exports, objectPool_1, assetManager_1, myCanvas_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.canvas = new myCanvas_2.MyCanvas();
    exports.asset = new assetManager_1.AssetManager();
    exports.asset.loadImage("ball.png");
    let objectPool;
    let state = 0;
    function render() {
        exports.canvas.begin();
        switch (state) {
            case 0:
                if (exports.asset.update()) {
                    state++;
                }
                break;
            case 1:
                objectPool = new objectPool_1.ObjectPool();
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
        exports.canvas.end();
        window.requestAnimationFrame(render);
    }
    render();
});
define("game_object", ["require", "exports", "main"], function (require, exports, main_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GameObject {
        constructor(camera, abX, abY) {
            this.camera = camera;
            this.abX = abX;
            this.abY = abY;
            this.points = new Array();
        }
        setPoint(point) {
            this.points[0] = point;
            this.update();
        }
        setPoints(points) {
            this.points = points;
            this.update();
        }
        update() {
            let screenX = this.abX - this.camera.abX + main_5.canvas.WIDTH / 2;
            let screenY = -this.abY + this.camera.abY + main_5.canvas.HEIGHT / 2;
            this.points.forEach(it => it.update(this.abX, this.abY, screenX, screenY));
        }
    }
    exports.GameObject = GameObject;
    class Point {
        constructor(reX, reY) {
            this.reX = reX;
            this.reY = reY;
            this._abX = 0;
            this._abY = 0;
            this._screenX = 0;
            this._screenY = 0;
        }
        get abX() { return this._abX; }
        get abY() { return this._abY; }
        get screenX() { return this._screenX; }
        get screenY() { return this._screenY; }
        update(originAbX, originAbY, orginScreenX, originScreenY) {
            this._abX = originAbX + this.reX;
            this._abY = originAbY + this.reY;
            this._screenX = orginScreenX + this.reX;
            this._screenY = originScreenY - this.reY;
        }
    }
    exports.Point = Point;
});
define("ball", ["require", "exports", "game_object", "main"], function (require, exports, game_object_3, main_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ball extends game_object_3.GameObject {
        constructor(camera) {
            super(camera, main_6.canvas.WIDTH / 2, main_6.canvas.HEIGHT / 2);
            this.center = new game_object_3.Point(0, 0);
            this._dx = 0;
            this._dy = 0;
            this.img = main_6.asset.getImage("ball.png");
            this.setPoint(this.center);
        }
        get dx() { return this._dx; }
        get dy() { return this._dy; }
        draw() {
            //mcanvas.drawImage(this.img, this.center.screenX, this.center.screenY, Ball.RADIUS * 2, Ball.RADIUS * 2);
        }
        update() {
            if (this.center.screenX - Ball.RADIUS < 0) {
                this._dx = -this._dx;
            }
            else if (this.center.screenX + Ball.RADIUS > main_6.canvas.WIDTH) {
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
        jump(angle, power) {
            this._dx = power * Math.cos(angle);
            this._dy = power * Math.sin(angle);
        }
        /*boundX() {
            this._dx = -this._dx;
        }
        boundY() {
            this._dy = -this._dy;
        }*/
        boundToRight(wallX) {
            this._dx = -this._dx * Ball.BOUND_COEF;
            this.abX = wallX + Ball.RADIUS;
        }
        boundToLeft(wallX) {
            this._dx = -this._dx * Ball.BOUND_COEF;
            this.abX = wallX - Ball.RADIUS;
        }
        boundUp(wallY) {
            this._dy = -this._dy * Ball.BOUND_COEF;
            this.abY = wallY + Ball.RADIUS;
        }
        boundDown(wallY) {
            this._dy = -this._dy * Ball.BOUND_COEF;
            this.abY = wallY - Ball.RADIUS;
        }
    }
    exports.Ball = Ball;
    Ball.RADIUS = 5;
    Ball.MAX_SPEED = 7;
    Ball.BOUND_COEF = 0.9;
});
//# sourceMappingURL=main.js.map