import {RENDER_LAYER} from "../../Renderer";

export const ObjectType = {
    PAID_EGG: 'paid_egg', PAID_CHEST: 'paid_chest',
    CHEST: 'chest', EGG: 'egg', DRAGON: 'dragon', GOLD: 'gold'
}

let INSTANCE_COUNTER = 0

export const ITypedObject = v => { return {get type() {return v}} }
export const IStageObject = t => { return {get stage() {return t}}}
export const INamedObject = self => {
    if (self.type && self.stage) return {get name() {return `${self.type}_${self.stage}_${INSTANCE_COUNTER++}`}}
    if (self.type) return {get name() {return `${self.type}_${INSTANCE_COUNTER++}`}}
    return {get name() {return `unknown_entity_${INSTANCE_COUNTER++}`}}
}

export const IContainer = (x, y, layer) => {
    const c = new PIXI.Container()
    c.x = x; c.y = y;

    return {
        destroy: () => {
            c.children.forEach(ch => ch.destroy())
            c.destroy()
        },
        add: (obj) => {
            c.addChild(obj.visual)
        },
        get layer() { return layer },
        get hasVisual() { return true },
        get visual() { return c }
    }
}

export const IVisual = (t, x, y, w, h, layer = undefined) => {
    const s = new PIXI.Sprite(window.resources.getTexture(t))
    s.width = w; s.height = h
    s.x = x; s.y = y
    s.anchor.x = s.anchor.y = 0.5

    return {
        get layer() { return layer || RENDER_LAYER.GAME },
        get hasVisual() { return true },
        get visual() { return s }
    }
}

export const IUnimportantContent = () => {
    return {
        get unimportantContent() { return true }
    }
}

export const IText = (text, x, y, style, anchorX = undefined, anchorY = undefined, layer = undefined) => {
    const t = new PIXI.Text(text, new PIXI.TextStyle(style))
    t.x = x; t.y = y;
    t.anchor.x = anchorX || 0.5; t.anchor.y = anchorY || 0.5

    return {
        get layer() { return RENDER_LAYER.UI },
        get hasVisual() { return true },
        get visual() { return t }
    }
}

export const IAnimated = (texture, x, y, w, h, layer = undefined) => {
    const textures = []
    Object.keys(window.resources.getAnimation(texture)).forEach(f => {
        textures.push(PIXI.Texture.fromFrame(f))
    })
    const s = new PIXI.extras.AnimatedSprite(textures)
    s.x = x; s.y = y; s.width = w; s.height = h
    s.anchor.set(0.5)
    s.loop = true
    s.animationSpeed = 0.7
    s.play()

    return {
        get layer() { return layer || RENDER_LAYER.UI },
        get hasVisual() { return true },
        get visual() { return s }
    }
}

export const IParticleContainer = layer => {
    const pc = new PIXI.particles.ParticleContainer()
    return {
        get layer() { return layer || RENDER_LAYER.UI },
        get hasVisual() { return true },
        get visual() { return pc }
    }
}

export const IHealthBarOwner = self => {
    const parent = self.visual
    const sprite = new PIXI.Sprite(window.resources.getTexture('pixel'))

    sprite.width = parent.width/parent.scale.x * 0.9;
    sprite.height = 10/parent.scale.y

    sprite.x = -(parent.width/parent.scale.x)/2 + (parent.width/parent.scale.x)*0.05;
    sprite.y = -(parent.height/parent.scale.y)/2

    sprite.anchor.x = 0; sprite.anchor.y = 1
    sprite.tint = 0xCC0000
    sprite.alpha = 0.7

    parent.addChild(sprite)

    const maxWidth = sprite.width

    return {
        get healthbarVisual() { return sprite },
        setHealthBarValue(v) {
            sprite.width = Math.max(0, maxWidth * v)
        }
    }
}

export const IVisualNumericRep = (owner, property, offsetX, offsetY, color, size = 0.3) => {
    if (typeof owner[property] === `undefined`) {
        return {
            get [`${property}RepVisual`]() { return { destroy: () => {} } },
            [`${property}VisualRefresh`]: () => {},
            [`${property}Destroy`]: () => { }
        }
    }
    const parent = owner.visual
    const container = new PIXI.Container()
    container.x = (parent.width/parent.scale.x) * offsetX
    container.y = (parent.height/parent.scale.y) * offsetY

    const sprite = new PIXI.Sprite(window.resources.getTexture('ui_white_circle'))
    sprite.width = parent.width/parent.scale.x * size;
    sprite.height = parent.width/parent.scale.x * size;
    sprite.anchor.x = 0.5; sprite.anchor.y = 0.5
    sprite.tint = color
    container.addChild(sprite)
    const text = new PIXI.Text(owner[property], new PIXI.TextStyle({
        fontSize: 80, fontWeight: 'bold', fill: '#EEffff'
    }))
    text.anchor.x = text.anchor.y = 0.5
    container.addChild(text)
    parent.addChild(container)

    return {
        get [`${property}RepVisual`]() { return sprite },
        [`${property}VisualRefresh`]: () => { text.text = owner[property] },
        [`${property}Destroy`]: () => { text.destroy(); sprite.destroy() },
    }
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