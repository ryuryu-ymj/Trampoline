export class AssetManager {
    private imgs = new Array<HTMLImageElement>();
    private nameList = new Array<string>();
    private loadCnt = 0;

    loadImage(fileName: string) {
        this.loadCnt++;
        let img = new Image();
        img.onload = () => {
            this.loadCnt--;
        }
        img.src = "img/" + fileName;
        this.imgs.push(img);
        this.nameList.push(fileName);
    }

    update() {
        return this.loadCnt == 0;
    }

    getImage(fileName: string) {
        return this.imgs[this.nameList.findIndex(it => it == fileName)];
    }
}