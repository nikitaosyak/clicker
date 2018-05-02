import {StaticImage} from "../go/StaticImage";
import {RENDER_LAYER} from "../../Renderer";
import {IContainer} from "../go/GameObjectBase";
import {UIFactory} from "./UIFactory";

export const GoldCounter = (x, y) => {

    const self = {
    }
    Object.assign(self, IContainer(x, y, RENDER_LAYER.UI))
    const counter = UIFactory.forParent('gold_counter')
        .getText('99999999999999999999', -50, 0, {fontSize: 60, fill: '#ffd700'}, {x: 1, y: 0.5})
    self.add(counter)
    self.add(StaticImage('ui_coin', 0, 0, 80, 80, RENDER_LAYER.UI))

    return self
}