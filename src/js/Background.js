import {IAdoptable} from "./behaviours/IAdoptable";
import {RENDER_LAYER} from "./Renderer";
import {IVisual} from "./behaviours/Base";

export const Background = () => {

    const self = {}

    Object.assign(self,
        IVisual('background')
            .setSize(720, 1280)
            .setLayer(RENDER_LAYER.BACKGROUND)
    )

    Object.assign(self,
        IAdoptable(self.visual, {x: 'center', y: 'middle'}, true)
    )

    return self
}