import {AdoptableBase} from "./AdoptableBase";
import {IVisual2} from "../go/GameObjectBase";

export class AdoptableSprite extends AdoptableBase{

    constructor(texture, size, anchor, pivotRules, stretchingRules, layer = undefined) {
        super(size, pivotRules, stretchingRules)
        Object.assign(this, IVisual2(texture, size, anchor, layer))
    }

}