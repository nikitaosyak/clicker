import {IVisual} from "./GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";

export const StaticImage = (t, x, y, w, h) => {
    let self = {

    }
    Object.assign(self, IVisual(t, x, y, w, h))
    Object.assign(self, {get layer() { return RENDER_LAYER.BACKGROUND }})

    return self
}