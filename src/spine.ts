import { Block } from "./block";
import { Point } from "./game_object";
import { Camera } from "./camera";

export class Spine extends Block {
    
    constructor(camera: Camera, abX: number, abY: number) {
        super(camera, abX, abY, false, false, false, false);
    }
    
    draw() {
    }
}