import {IVisual} from "./GameObjectBase";

export const StaticImage = (t, x, y, w, h) => {
    return Object.assign({}, IVisual(t, x, y, w, h))
}