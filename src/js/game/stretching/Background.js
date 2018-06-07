import {IAdoptableBase, IAdoptableVisual} from "./AdoptableBase";
import {RENDER_LAYER} from "../../Renderer";

export const Background = () => {

    const self = {}

    Object.assign(self,
        IAdoptableVisual('background',
            {x: 800, y: 1280},
            {x: 0.5, y: 0.5},
            RENDER_LAYER.BACKGROUND))

    Object.assign(self,
        IAdoptableBase(self.visual, {x: 'center', y: 'middle'}, {x: 1, y: 1})
    )

    return self
}