import {IParticleContainer} from "../../go/GameObjectBase";
import {RENDER_LAYER} from "../../../Renderer";

export const CoinParticlesManager = (targetLocation) => {

    const coins = []
    const animations = []

    const self = {
        dropCoin: (fromSlot, value) => {
            return new Promise(resolve => {
                resolve()
            })
        }
    }

    Object.assign(self, IParticleContainer(RENDER_LAYER.UI))

    return self
}