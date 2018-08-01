import {IContainer, IVisual} from "../../behaviours/Base";
import {RENDER_LAYER} from "../../Renderer";
import {IAdoptable} from "../../behaviours/IAdoptable";

export class DialogBase {

    constructor(owner) {
        this._owner = owner

        Object.assign(this, IContainer().setLayer(RENDER_LAYER.DIALOG))
        Object.assign(this, IAdoptable(this.visual, { x: 'center', y: 'middle' }))

        this._bg = IVisual('pixel')
            .setTint(0)
            .setAlpha(0.5)
            .setAnchor(0.5, 0.5)
            .setLayer(RENDER_LAYER.DIALOG)

        this._bg.visual.interactive = true
        this._bg.visual.on('click', e => e.stopPropagation())
        this._bg.visual.on('tap', e => e.stopPropagation())
        Object.assign(this._bg, {
            adopt: () => {
                this._bg.visual.x = this._owner.renderer.size.x/2
                this._bg.visual.y = this._owner.renderer.size.y/2
                this._bg.visual.width = this._owner.renderer.canvasW / this._owner.renderer.stage.scale.x
                this._bg.visual.height = this._owner.renderer.canvasH / this._owner.renderer.stage.scale.y
            }
        })
    }

    show() {
        const self = this
        self._owner.renderer.addObject(self._bg)
        self._owner.renderer.addObject(self)

        TweenLite.fromTo(this._bg.visual, 0.5, {alpha: 0}, {alpha: 0.5})

        return new Promise(resolve => {
            TweenLite.fromTo(this.visual, 0.6,
                {
                    pixi: {
                        y: self._owner.renderer.size.y + self.visual.height/2,
                        x: self._owner.renderer.size.x/2
                    }
                },
                {
                    pixi: {y: 600},
                    ease: Elastic.easeOut.config(0.98, 0.98),
                    roundProps: 'y',
                    onComplete: resolve
                })
        })
    }

    hide() {
        const self = this

        TweenLite.fromTo(self._bg.visual, 0.5, {alpha: 0.5}, {alpha: 0})

        return new Promise(resolve => {
            TweenLite.fromTo(self.visual, 0.6,
                {pixi: {x: self.visual.x, y: self.visual.y}},
                {
                    pixi: {y: 1600},
                    ease: Elastic.easeIn.config(0.98, 0.98),
                    roundProps: 'y',
                    onComplete: () => {
                        self._owner.renderer.removeObject(this._bg)
                        self._owner.renderer.removeObject(self)
                        resolve()
                    }
                })
        })
    }
}