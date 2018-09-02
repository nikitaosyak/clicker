import {RENDER_LAYER} from "../Renderer";

export const ObjectType = {
    PAID_EGG: 'paid_egg', PAID_CHEST: 'paid_chest',
    CHEST: 'chest', EGG: 'egg', DRAGON: 'dragon', GOLD: 'gold'
}

export const IContainer = () => {
    let layer = RENDER_LAYER.GAME
    const c = new PIXI.Container()

    const self = {
        setPivot: (x, y) => { c.pivot.x = x; c.pivot.y = y; return self },
        setLayer: v => { layer = v; return self },
        setPosition: (x, y) => { c.x = x; c.y = y; return self },
        destroy: () => {
            c.children.forEach(ch => ch.destroy())
            c.destroy()
        },
        add: (obj) => {
            c.addChild(obj.visual)
        },
        get layer() { return layer },
        get visual() { return c }
    }

    return self
}

export const IVisual = texture => {
    let layer = RENDER_LAYER.GAME
    const s = new PIXI.Sprite(window.resources.getTexture(texture))
    s.anchor.x = s.anchor.y = 0.5

    const self = {
        setSize: (x, y) => { s.width = x; s.height = y; return self },
        setAnchor: (x, y) => { s.anchor.x = x; s.anchor.y = y; return self },
        setPosition: (x, y) => { s.x = x; s.y = y; return self },
        setLayer: v => { layer = v; return self },
        setScale: (x, y) => { s.scale.x = x; s.scale.y = y; return self },
        setPivot: (x, y) => { s.pivot.x = x; s.pivot.y = y; return self },
        setTint: v => { s.tint = v; return self },
        setAlpha: v => { s.alpha = v; return self },
        setTexture: v => { s.texture = window.resources.getTexture(v); return self; },
        get layer() { return layer || RENDER_LAYER.GAME },
        get visual() { return s }
    }

    return self
}

export const IButton = (texture, onClick) => {
    const button = IVisual(texture)

    button.visual.interactive = true
    button.visual.on('click', onClick)
    button.visual.on('tap', onClick)

    Object.assign(button, {
        get interactive() { return button.visual.interactive },
        set interactive(v) { button.visual.interactive = v },
    })

    return button
}

const TOGGLE_STATE = {NORMAL: 'NORMAL', TOGGLED: 'TOGGLED'}
export const IToggleButton = (normal, toggled, onClick) => {
    let current = TOGGLE_STATE.NORMAL

    const button = IButton(normal, () => {
        if (current === TOGGLE_STATE.NORMAL) {
            current = TOGGLE_STATE.TOGGLED
            button.visual.texture = window.resources.getTexture(toggled)
            button.toggleState = true
            onClick&&onClick(true)
        } else {
            current = TOGGLE_STATE.NORMAL
            button.visual.texture = window.resources.getTexture(normal)
            button.toggleState = false
            onClick&&onClick(false)
        }
    })

    button.setToggleState = v => {
        if (v) {
            current = TOGGLE_STATE.TOGGLED
            button.visual.texture = window.resources.getTexture(toggled)
            button.toggleState = true
        } else {
            current = TOGGLE_STATE.NORMAL
            button.visual.texture = window.resources.getTexture(normal)
            button.toggleState = false
        }
    }

    return button
}

export const IUnimportantContent = () => {
    return {
        get unimportantContent() { return true }
    }
}

export const IText = (text, x, y, style, anchorX = undefined, anchorY = undefined, layer = undefined) => {
    const t = new PIXI.Text(text, new PIXI.TextStyle(style))
    t.x = x; t.y = y;
    t.anchor.x = typeof anchorX === 'undefined' ? 0.5 : anchorX
    t.anchor.y = typeof anchorY === 'undefined' ? 0.5 : anchorY

    return {
        get layer() { return RENDER_LAYER.UI },
        get visual() { return t }
    }
}

export const IAnimated = (descriptor) => {
    let layer = RENDER_LAYER.GAME

    const textures = []
    Object.keys(window.resources.getAnimation(descriptor)).forEach(f => {
        textures.push(PIXI.Texture.fromFrame(f))
    })
    const s = new PIXI.extras.AnimatedSprite(textures)
    s.anchor.set(0.5)
    s.loop = true
    s.play()

    const self = {
        setSize: (x, y) => { s.width = x; s.height = y; return self },
        setAnchor: (x, y) => { s.anchor.x = x; s.anchor.y = y; return self },
        setPosition: (x, y) => { s.x = x; s.y = y; return self },
        setLayer: v => { layer = v; return self },
        setAnimationSpeed: v => { s.animationSpeed = v; return self },
        get layer() { return layer },
        get visual() { return s }
    }
    return self
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
        fontSize: 240 * size, fontWeight: 'bold', fill: '#EEffff'
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

export const IClickable = (self, needHitArea = false) => {
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

let UI_INSTANCE_COUNTER = 0
export const INamedUIElement = (parent, type) => {
    return {
        get name() {
            return `${type}_${parent}_${UI_INSTANCE_COUNTER++}`
        }
    }
}