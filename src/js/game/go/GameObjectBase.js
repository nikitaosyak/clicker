import {SLOTS} from "../SLOTS";

export const ObjectType = { CHEST: 'chest', EGG: 'egg', DRAGON: 'gragon', GOLD: 'gold' }

let INSTANCE_COUNTER = 0

export const ITypedObject = v => { return {get type() {return v}} }
export const ITieredObject = t => { return {get tier() {return t}}}
export const INamedObject = self => {
    if (self.type && self.tier) return {get name() {return `${self.type}_${self.tier}_${INSTANCE_COUNTER++}`}}
    if (self.type) return {get name() {return `${self.type}_${INSTANCE_COUNTER++}`}}
    return {get name() {return `unknown_entity_${INSTANCE_COUNTER++}`}}
}

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

export const IVisualHealthBar = self => {
    const parent = self.visual
    const sprite = new PIXI.Sprite(window.resources.getTexture('pixel'))

    sprite.width = parent.width/parent.scale.x * 0.9;
    sprite.height = 10/parent.scale.y

    console.log(parent.height, parent.scale.y)
    sprite.x = -(parent.width/parent.scale.x)/2 + (parent.width/parent.scale.x)*0.05;
    sprite.y = -(parent.height/parent.scale.y)/2

    sprite.anchor.x = 0; sprite.anchor.y = 1
    sprite.tint = 0xCC0000
    sprite.alpha = 0.7

    parent.addChild(sprite)

    const maxWidth = sprite.width

    return {
        setHealthBarValue(v) {
            sprite.width = Math.max(0, maxWidth * v)
        }
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

export const IClickable = (self) => {

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