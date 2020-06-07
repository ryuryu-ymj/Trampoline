const fs = require("fs");

for (let stageNum = 1; ; stageNum++) {
    try {
        text = fs.readFileSync("stageText/stage" + ("00" + stageNum).slice(-2) + ".txt", "utf-8");
    } catch (e) {
        break;
    }
    //console.log(text);
    let stageText = text.split("\n");
    let csv = "";
    for (let i = 0; i < stageText.length; i++) {
        if (stageText[i].length == 0) {
            csv += "\n";
        }
        for (let j = 0; j < stageText[i].length; j++) {
            let x = (j + 0.5) * 20;
            let y = (i + 0.5) * 20;
            switch (stageText[i][j]) {
                case "b":
                    let rightIsBlock = false;
                    let leftIsBlock = false;
                    let upIsBlock = false;
                    let downIsBlock = false;
                    try {
                        rightIsBlock = stageText[i][j + 1] == "b";
                    } catch (e) { }
                    try {
                        leftIsBlock = stageText[i][j - 1] == "b";
                    } catch (e) { }
                    try {
                        upIsBlock = stageText[i + 1][j] == "b";
                    } catch (e) { }
                    try {
                        downIsBlock = stageText[i - 1][j] == "b";
                    } catch (e) { }
                    csv += "block," + x + "," + y + "," + rightIsBlock + "," + leftIsBlock + "," + upIsBlock
                        + "," + downIsBlock + "\n";
                    break;
                case "s":
                    csv += "spine," + x + "," + y + "\n";
                    break;
            }
        }
    }

    fs.writeFileSync("stageData/stage" + ("00" + stageNum).slice(-2) + ".csv", csv, "utf-8");
}