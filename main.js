define("camera", ["require", "exports", "main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Camera {
        constructor() {
            this.abX = main_1.canvas.width / 2;
            this.abY = main_1.canvas.height / 2;
        }
    }
    exports.Camera = Camera;
});
define("trampoline", ["require", "exports", "game_object", "main"], function (require, exports, game_object_1, main_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Trampoline extends game_object_1.GameObject {
        constructor(camera, beginScreenX, beginScreenY, endScreenX, endScreenY) {
            super(camera, 0, 0);
            this.counter = 0;
            this.setScreenPosition(beginScreenX, beginScreenY);
            this.begin = new game_object_1.Point(0, 0);
            this.end = new game_object_1.Point(endScreenX - beginScreenX, -endScreenY + beginScreenY);
            this.setPoints([this.begin, this.end]);
        }
        draw() {
            main_2.ctx.strokeStyle = "green";
            main_2.ctx.beginPath();
            main_2.ctx.moveTo(this.begin.screenX, this.begin.screenY);
            main_2.ctx.lineTo(this.end.screenX, this.end.screenY);
            main_2.ctx.stroke();
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
define("block", ["require", "exports", "game_object", "main"], function (require, exports, game_object_2, main_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Block extends game_object_2.GameObject {
        constructor(camera, abX, abY) {
            super(camera, abX, abY);
            this.center = new game_object_2.Point(0, 0);
            this.setPoint(this.center);
        }
        draw() {
            main_3.ctx.fillStyle = "brown";
            main_3.ctx.fillRect(this.center.screenX - Block.WIDTH / 2, this.center.screenY - Block.WIDTH / 2, Block.WIDTH, Block.WIDTH);
        }
    }
    exports.Block = Block;
    Block.WIDTH = 20;
});
define("stage", ["require", "exports", "block", "main"], function (require, exports, block_1, main_4) {
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
                console.log(this.csvData);
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
            if (camera.abY > this.loadAbY - main_4.canvas.height / 2) {
                this.loadAbY += main_4.canvas.height / 2;
                while (true) {
                    if (this.loadLine >= this.csvData.length) {
                        break;
                    }
                    let abY = Number.parseInt(this.csvData[this.loadLine][2]);
                    if (abY > this.loadAbY) {
                        break;
                    }
                    let abX = Number.parseInt(this.csvData[this.loadLine][1]);
                    blocks.push(new block_1.Block(camera, abX, abY));
                    this.loadLine++;
                }
            }
        }
    }
    exports.Stage = Stage;
});
define("objectPool", ["require", "exports", "main", "camera", "trampoline", "ball", "block", "stage"], function (require, exports, main_5, camera_1, trampoline_1, ball_1, block_2, stage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ObjectPool {
        constructor() {
            this.previousTime = new Date().getTime();
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
            main_5.ctx.strokeStyle = "gray";
            main_5.ctx.beginPath();
            for (let x = 100 - this.camera.abX % 100; x < main_5.canvas.width; x += 100) {
                main_5.ctx.moveTo(x, 0);
                main_5.ctx.lineTo(x, main_5.canvas.height);
            }
            for (let y = 100 - this.camera.abY % 100; y < main_5.canvas.height; y += 100) {
                main_5.ctx.moveTo(0, main_5.canvas.height - y);
                main_5.ctx.lineTo(main_5.canvas.width, main_5.canvas.height - y);
            }
            main_5.ctx.stroke();
        }
        update() {
            // 経過時間の測定
            let presentTime = new Date().getTime();
            let delta = (presentTime - this.previousTime) / 1000;
            //console.log("fps = " + 1 / delta);
            this.previousTime = presentTime;
            this.stage.addBlock(this.blocks, this.camera);
            {
                if (this.blocks.some(it => { return it.center.screenY - block_2.Block.WIDTH / 2 > main_5.canvas.height; })) {
                    this.blocks.shift();
                    //console.log("delete block");
                }
            }
            // trampolineの追加
            if (main_5.isMouseUp) {
                this.trampolines.push(new trampoline_1.Trampoline(this.camera, main_5.mouseDownX, main_5.mouseDownY, main_5.mouseUpX, main_5.mouseUpY));
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
            { // blockとballの衝突判定
                //let max = this.ball.radius + Block.WIDTH / 2;
                let minIndex = -1;
                let minDistance = Math.pow(this.ball.RADIUS + block_2.Block.WIDTH / 2, 2);
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
                            this.ball.boundToRight(this.blocks[minIndex].center.abX + block_2.Block.WIDTH / 2);
                        }
                        else {
                            this.ball.boundToLeft(this.blocks[minIndex].center.abX - block_2.Block.WIDTH / 2);
                        }
                    }
                    else {
                        //this.ball.boundY();
                        if (dy > 0) {
                            this.ball.boundUp(this.blocks[minIndex].center.abY + block_2.Block.WIDTH / 2);
                        }
                        else {
                            this.ball.boundDown(this.blocks[minIndex].center.abY - block_2.Block.WIDTH / 2);
                        }
                    }
                }
            }
            // カメラをballに追随
            if (this.ball.center.screenY < main_5.canvas.height / 2) {
                this.camera.abY = this.ball.center.abY;
            }
            this.ball.update();
            this.trampolines.forEach(it => it.update());
            this.blocks.forEach(it => it.update());
        }
        isGameOver() {
            return this.ball.center.screenY > main_5.canvas.height;
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
define("main", ["require", "exports", "objectPool"], function (require, exports, objectPool_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isMouseDown = false;
    exports.isMousePressed = false;
    exports.isMouseUp = false;
    exports.mouseDownX = 0;
    exports.mouseDownY = 0;
    exports.mouseUpX = 0;
    exports.mouseUpY = 0;
    exports.canvas = document.getElementById('canvas');
    exports.ctx = exports.canvas.getContext('2d');
    // マウス入力
    exports.canvas.addEventListener("mousedown", (event) => {
        exports.isMouseDown = true;
        exports.isMousePressed = true;
        exports.mouseDownX = event.pageX;
        exports.mouseDownY = event.pageY;
        //console.log("mousedown" + mouseDownX + ", " + mouseDownY);
    });
    exports.canvas.addEventListener("mouseup", (event) => {
        if (exports.isMousePressed) {
            exports.isMouseUp = true;
            exports.isMousePressed = false;
            exports.mouseUpX = event.pageX;
            exports.mouseUpY = event.pageY;
            //console.log("mouseup" + mouseUpX + ", " + mouseUpY);
        }
    });
    exports.canvas.addEventListener("mouseleave", (event) => {
        if (exports.isMousePressed) {
            exports.isMouseUp = true;
            exports.isMousePressed = false;
            exports.mouseUpX = event.pageX;
            exports.mouseUpY = event.pageY;
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
    let objectPool = new objectPool_1.ObjectPool();
    let state = 0;
    function render() {
        // 画面のクリア
        exports.ctx.clearRect(0, 0, exports.canvas.width, exports.canvas.height);
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
        if (exports.isMouseDown)
            exports.isMouseDown = false;
        if (exports.isMouseUp)
            exports.isMouseUp = false;
        window.requestAnimationFrame(render);
    }
    render();
});
define("game_object", ["require", "exports", "main"], function (require, exports, main_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GameObject {
        constructor(camera, abX, abY) {
            this.camera = camera;
            this.abX = abX;
            this.abY = abY;
            this.points = new Array();
        }
        setScreenPosition(screenX, screenY) {
            this.abX = screenX + this.camera.abX - main_6.canvas.width / 2;
            this.abY = -screenY + this.camera.abY + main_6.canvas.height / 2;
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
            let screenX = this.abX - this.camera.abX + main_6.canvas.width / 2;
            let screenY = -this.abY + this.camera.abY + main_6.canvas.height / 2;
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
define("ball", ["require", "exports", "game_object", "main"], function (require, exports, game_object_3, main_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ball extends game_object_3.GameObject {
        constructor(camera) {
            super(camera, main_7.canvas.width / 2, main_7.canvas.height / 2);
            this.center = new game_object_3.Point(0, 0);
            this.RADIUS = 5;
            this.MAX_SPEED = 7;
            this._dx = 0;
            this._dy = 0;
            this.setPoint(this.center);
        }
        get dx() { return this._dx; }
        get dy() { return this._dy; }
        draw() {
            main_7.ctx.fillStyle = "orange";
            main_7.ctx.beginPath();
            main_7.ctx.arc(this.center.screenX, this.center.screenY, this.RADIUS, 0, Math.PI * 2);
            main_7.ctx.fill();
        }
        update() {
            if (this.center.screenX - this.RADIUS < 0) {
                this._dx = -this._dx;
            }
            else if (this.center.screenX + this.RADIUS > main_7.canvas.width) {
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
            this._dx = -this._dx;
            this.abX = wallX + this.RADIUS;
        }
        boundToLeft(wallX) {
            this._dx = -this._dx;
            this.abX = wallX - this.RADIUS;
        }
        boundUp(wallY) {
            this._dy = -this._dy;
            this.abY = wallY + this.RADIUS;
        }
        boundDown(wallY) {
            this._dy = -this._dy;
            this.abY = wallY - this.RADIUS;
        }
    }
    exports.Ball = Ball;
});
//# sourceMappingURL=main.js.map