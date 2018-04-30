import {SLOTS} from "../SLOTS";

export const IVisual = (t, x, y, w, h) => {
    const s = new PIXI.Sprite(window.resources.getTexture(t))
    s.width = w; s.height = h
    s.x = x; s.y = y
    s.anchor.x = s.anchor.y = 0.5

    return {
        get hasVisual() { return true },
        get visual() { return s }
    }
}

export const ISlotItem = slot => {
    return {
        get slotRect() { return SLOTS.getRect(slot) }
    }
}
export const ISlotVisualItem = (self, t) => {
    return IVisual(t,
        self.slotRect.x, self.slotRect.y,
        self.slotRect.w, self.slotRect.h)
}

export const IClickable = self => {

    let clicks = 0

    self.visual.interactive = true
    self.visual.on('click', e => {
        clicks += 1
    })
    self.visual.on('tap', e => {
        clicks += 1
    })

    return {
        extractClicks: () => {
            const count = clicks
            clicks = 0
            return count
        }
    }
}