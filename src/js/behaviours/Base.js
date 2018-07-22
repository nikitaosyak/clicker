import {RENDER_LAYER} from "../Renderer";

export const ObjectType = {
    PAID_EGG: 'paid_egg', PAID_CHEST: 'paid_chest',
    CHEST: 'chest', EGG: 'egg', DRAGON: 'dragon', GOLD: 'gold'
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
        get visual() { return c }
    }
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
            onClick(true)
        } else {
            current = TOGGLE_STATE.NORMAL
            button.visual.texture = window.resources.getTexture(normal)
            onClick(false)
        }
    })

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
    t.anchor.x = anchorX || 0.5; t.anchor.y = anchorY || 0.5

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

export const IHealthBarOwner = (self, pos = null) => {

    const getChildSprite = (parent, size, anchor, tint, alpha) => {
        const pw = parent.width/parent.scale.x
        const ph = parent.height/parent.scale.y

        const child = new PIXI.Sprite(window.resources.getTexture('pixel'))

        child.width = pw*size.x; child.height = ph*size.y
        child.anchor.x = anchor.x; child.anchor.y = anchor.y
        child.tint = tint; child.alpha = alpha
        parent.addChild(child)

        Object.assign(child, {
            get pw() {return parent.width/parent.scale.x},
            get ph() {return parent.height/parent.scale.y}
        })

        return child
    }

    const background = getChildSprite(self.visual, {x:1,y:0.06}, {x:0,y:0.5}, 0x666666, 0.85)
    if (pos === null) {
        background.x = -background.pw/2
        background.y = -background.ph/2
    } else {
        background.x = pos.x; background.y = pos.y
    }

    const mainHp = getChildSprite(background, {x:0.98, y:0.9}, {x:0,y:0.5}, 0xAA0000, 0.9)
    mainHp.x = mainHp.pw * 0.01

    const drainedHp = getChildSprite(background, {x:0, y:0.9}, {x:0,y:0.5}, 0xAACC00, 0.9)
    drainedHp.x = mainHp.x + mainHp.width

    const maxWidth = mainHp.width
    let lastValue = 1

    const drainAnimation = TweenLite.to(drainedHp, 0.3, {width: 0, delay: 0.5})
    drainAnimation.pause()

    return {
        get healthbarVisual() { return background },
        setHealthBarValue(v) {
            mainHp.width = Math.max(0, maxWidth * v)

            const diff = lastValue - v
            lastValue = v

            drainedHp.x = mainHp.x + mainHp.width
            drainedHp.width += maxWidth * diff
            drainAnimation.invalidate().restart(true)
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