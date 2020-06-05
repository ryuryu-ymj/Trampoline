import { GameObject } from "./game_object";
import { Block } from "./block";
import { Camera } from "./camera";
import { canvas } from "./main";

export class Stage {
    private _isLoading = false;
    get isLoading() { return this._isLoading; }
    private readonly xhr = new XMLHttpRequest();
    private loadAbY = 0;
    private loadLine = 0;
    private csvData: string[][] = new Array;

    startLoadingStage(stageNum: number) {
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
        }
        /*let response = await fetch("stageData/stage01");

        if (response.ok) { // HTTP ステータスが 200-299 の場合
            // レスポンスの本文を取得(後述)
            let text = await response.text();
            console.log(text);
        } else {
            alert("HTTP-Error: " + response.status);
        }*/
    }

    addBlock(blocks: Block[], camera: Camera) {
        if (camera.abY > this.loadAbY - canvas.height / 2) {
            this.loadAbY += canvas.height / 2;
            while(true) {
                if (this.loadLine >= this.csvData.length) {
                    break;
                }
                let abY = Number.parseInt(this.csvData[this.loadLine][2]);
                if (abY > this.loadAbY) {
                    break;
                }
                let abX = Number.parseInt(this.csvData[this.loadLine][1]);
                blocks.push(new Block(camera, abX, abY));
                this.loadLine++;
            }
        }
    }
}