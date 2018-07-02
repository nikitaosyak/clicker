import {ObjectPool} from "../../../utils/ObjectPool";
import {UpgradeListItem} from "./UpgradeListItem";
import {IVisual, IContainer} from "../../go/GameObjectBase";
import {INamedUIElement} from "../../ui/UIElementBase";
import {EmitterBehaviour} from "../../../utils/EmitterBehaviour";
import {IAdoptableBase, IAdoptableVisual} from "../../stretching/AdoptableBase";
import {RENDER_LAYER} from "../../../Renderer";
import {MAX_DRAGON_LEVEL} from "../../../GameModel";

export const UpgradeList = (model, renderer) => {

    const poolArgs = []
    const pool = ObjectPool(UpgradeListItem, poolArgs, 0)
    let children = []
    let groupedByLevel = []

    let lastVP = null
    let dragonMan = null
    let scrollable = true
    let bottomBoundY = NaN

    let dropAnimation

    const self = {
        get model() { return model },
        scrollToTop: () => {
            if (!scrollable) return
            self.visual.y = 100 + self.visual.height
            self.updateDragonsLayout(lastVP, dragonMan)
        },
        updateDragonsLayout: (viewportSize, _dragonMan) => {
            children.forEach((listItem, i) => {
                listItem.updateLayout(viewportSize, _dragonMan, i)
            })
        },
        updateBounds: (viewportSize, _dragonMan) => {
            lastVP = viewportSize
            dragonMan = _dragonMan
            self.updateDragonsLayout(viewportSize, _dragonMan)

            bottomBoundY = self.visual.y
            scrollable = viewportSize.y - 280 < self.visual.height
        },
        invalidate: (dragons) => {
            children.forEach(el => {
                self.visual.removeChild(el.visual)
                pool.putOne(el)
            })
            children = []

            groupedByLevel = []
            let listIndex = -1
            Object.keys(dragons).forEach(tier => {
                dragons[tier].sort((a, b) => {
                    if (a.level < b.level) return -1
                    if (a.level > b.level) return 1
                    return 0
                })
                let currentLevel = 0
                for (let i = 0; i < dragons[tier].length; i++) {
                    const dragon = dragons[tier][i]
                    if (dragon.level > currentLevel) {
                        groupedByLevel.push([])
                        listIndex+=1
                        currentLevel = dragon.level
                    }
                    groupedByLevel[listIndex].push(dragon)
                }
            })

            const currentDamage = window.GD.getClickDamage(model.dragons)
            let currentTier = 0
            for (let i = 0; i < groupedByLevel.length; i++) {
                const dragonsOfLevel = groupedByLevel[i]
                const addDragonItem = () => {
                    const listItem = pool.getOne()
                    listItem.setupWithDragons(dragonsOfLevel, currentDamage)
                    self.visual.addChild(listItem.visual)
                    children.push(listItem)
                }

                if (currentTier === dragonsOfLevel[0].tier) {
                    addDragonItem()
                } else {
                    currentTier += 1
                    if (dragonsOfLevel[0].level >= MAX_DRAGON_LEVEL) {
                        addDragonItem()
                    } else {
                        const listItem = pool.getOne()
                        listItem.setupUpgradeButton(window.GD.getUpgradePrice(dragonsOfLevel[0].tier, dragonsOfLevel[0].level), dragonsOfLevel[0])
                        self.visual.addChild(listItem.visual)
                        children.push(listItem)
                        addDragonItem()
                    }
                }
            }

            children.forEach(el => self.visual.addChild(el.visual))
        }
    }
    poolArgs.push(self)

    Object.assign(self, INamedUIElement('upgrade', 'list'))
    Object.assign(self, IContainer(0, 0, RENDER_LAYER.UI))
    self.visual.interactive = true
    Object.assign(self, IAdoptableBase(self.visual, {x: 'left', y: 'bottom', yOffset: 170}))
    Object.assign(self, EmitterBehaviour({}))

    const cachedPoint = new PIXI.Point()
    let dragging = false
    let startAnchorY = NaN
    let lastEventAnchorY = NaN
    let visualAnchorY = NaN
    self.visual.on('pointerdown', e => {
        if (!scrollable) return
        dropAnimation.pause()
        dragging = true

        startAnchorY = lastEventAnchorY = e.data.getLocalPosition(renderer.stage, cachedPoint).y
        visualAnchorY = self.visual.y
    })
    self.visual.on('pointermove', e => {
        if (!dragging) return

        const pointerPosition = e.data.getLocalPosition(renderer.stage, cachedPoint)

        let movement = pointerPosition.y - startAnchorY
        let eventMovement = pointerPosition.y - lastEventAnchorY
        if (self.visual.y < bottomBoundY) {
            const maxFullAccMovement = bottomBoundY - visualAnchorY
            movement = maxFullAccMovement + (movement - maxFullAccMovement)/2
            eventMovement /= 2
        } else if (self.visual.y > 100 + self.visual.height) {
            const maxFullAccMovement = (self.visual.height+100) - visualAnchorY
            movement = maxFullAccMovement + (movement - maxFullAccMovement) / 2
            eventMovement /= 2
        }
        dragonMan.dragons.forEach(d => {
            if (d.boundsDifference > 50) return
            d.visual.y += eventMovement * 0.95
        })
        lastEventAnchorY = pointerPosition.y
        self.visual.y = visualAnchorY + movement
        self.updateDragonsLayout(lastVP, dragonMan)
    })

    const finishDrag = e => {
        if (!dragging) return

        if (self.visual.y < bottomBoundY) {
            dropAnimation.invalidate()
            dropAnimation.vars.y = bottomBoundY
            dropAnimation.restart()
        }

        if (self.visual.y > 100 + self.visual.height) {
            dropAnimation.invalidate()
            dropAnimation.vars.y = 100 + self.visual.height
            dropAnimation.restart()
        }

        self.updateDragonsLayout(lastVP, dragonMan)

        dragging = false
    }
    self.visual.on('pointerup', finishDrag)
    self.visual.on('pointerupoutside', finishDrag)
    self.visual.on('pointerout', finishDrag)
    self.visual.on('pointercancel', finishDrag)

    dropAnimation = TweenLite.to(self.visual, 0.5, {y: 0, ease: Expo.easeOut, roundProps: 'y',
        onStart: () => {
            dropAnimation.prevTargetY = self.visual.y
        },
        onUpdate: () => {
            const diffY = self.visual.y - dropAnimation.prevTargetY
            dropAnimation.prevTargetY = self.visual.y
            dragonMan.dragons.forEach(d => {
                d.visual.y += diffY * 0.75
            })
            self.updateDragonsLayout(lastVP, dragonMan)
        }})
    dropAnimation.pause()

    return self
}