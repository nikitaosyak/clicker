import {IVisual} from "./GameObjectBase";
import {RENDER_LAYER} from "../../Renderer";

export const StaticImage = (t, x, y, w, h, layer = undefined, anchor = {x: 0.5, y: 0.5}) => {
    let self = {

    }
    Object.assign(self, IVisual(t, x, y, w, h))
    Object.assign(self, {get layer() { return layer || RENDER_LAYER.BACKGROUND }})
    self.visual.anchor.x = anchor.x
    self.visual.anchor.y = anchor.y

    return self
}