import {SCREEN_TYPE} from "./ScreenMan";
import {UIFactory} from "../ui/UIFactory";
import {SlotItemGenerator} from "../game/SlotItemGenerator";
import {BaseScreen} from "./BaseScreen";
import {GoldCounter} from "../ui/GoldCounter";
import {IButton, ObjectType} from "../behaviours/Base";
import {CoinParticlesManager} from "../game/CoinParticlesManager";
import {ObjectPool} from "../game/poolable/ObjectPool";
import {DamagePercent} from "../debug/debugDamagePercent";
import {DestroyAnimation} from "../game/poolable/DestroyAnimation";
import {DAMAGE_SOURCE} from "../game/DamageSource";
import {IAdoptable} from "../behaviours/IAdoptable";
import {SlotItemHpBar} from "../game/SlotItemHpBar";

export class GameScreen extends BaseScreen {

    constructor(owner) {
        super(owner, SCREEN_TYPE.GAME)

        this.uiCreator = UIFactory.forParent(this.type)

        const fs = this.uiCreator.getFullScreenButton(
            owner.renderer.dom,
            {x: 1, y: 0}, {x: 'right', xOffset: 40, y: 'top', yOffset: 160})
        fs && this.addControl(fs)

        if (this._owner.model.slotItems.length === 3) {
            this.addControl(this.uiCreator.getNavButton(
                owner, SCREEN_TYPE.UPGRADE,
                'ui_button_upgrade', {x: 0, y: 0}, {x: 'left', xOffset: 40, y: 'top', yOffset: 40}))

            // this.addControl(this.uiCreator.getNavButton(
            //     owner, SCREEN_TYPE.LEADERBOARD,
            //     'ui_leaderboard', {x: 1, y: 0}, {x: 'right', xOffset: 40, y: 'top', yOffset: 40}))
        }

        const settingsBtn = IButton('ui_button_settings', () =>
            window.dialogs.showSettings(owner.model.settings).then(changedSettings => {
                owner.model.updateSettings(changedSettings)
            })
        ).setAnchor(1, 0).setSize(90, 90)
        Object.assign(settingsBtn, IAdoptable(settingsBtn.visual, {x: 'right', xOffset: 40, y: 'top', yOffset: 40}))
        this.addControl(settingsBtn)

        // if (window.config.MODE !== 'production') {
        //     this.addControl(this.uiCreator.getButton2('ui_restart', () => {
        //         if (window.confirm('прогресс будет сброшен. продолжить?')) {
        //             this._owner.model.restart()
        //         }
        //     }, {x: 1, y: 0}, {x: 'right', xOffset: 40, y: 'top', yOffset: 280}))
        // }

        this._goldCounter = GoldCounter({x: 'center', xOffset: 10, y: 'bottom', yOffset: 420}, this._owner.model.gold)
        this.add(this._goldCounter)

        this._particles = CoinParticlesManager(this, this._goldCounter.visual)
        this.add(this._particles)

        this._slotHealthBars = [
            SlotItemHpBar(0, 200, 12),
            SlotItemHpBar(1, 220, 12),
            SlotItemHpBar(2, 260, 12)
        ]
        this._slotHealthBars.forEach(hpbar => {
            hpbar.visual.visible = false
            this.add(hpbar)
        })
        this._generator = SlotItemGenerator(this, owner.model, this._owner.model.stageItems, this._slotHealthBars)
        let proposeRestart = true
        let firstReminder = true
        this._generator.on('game_ended', () => {
            if (!proposeRestart) return
            window.dialogs.showRestartGame(firstReminder).then(result => {
                firstReminder = false
                if (result.allowRestart) {
                    owner.model.restart()
                } else {
                    proposeRestart = result.remind
                }
            })
        })
        this._slotItems = [null, null, null]
        if (this._owner.model.slotItems.length > 0) {
            this._owner.model.slotItems.forEach((dataItem, i) => {
                if (dataItem === null) return
                this._generator.populateConcrete(this._slotItems, i, dataItem)
            })
        } else {
            this._generator.populateAtGameStart(this._slotItems)
        }

        const self = this
        const dragons = this._owner.model.dragons
        Object.keys(dragons).forEach(tier => {
            dragons[tier].forEach(dragonData => {
                self._owner.dragonManager.addVisualDragon(dragonData.tier, dragonData.level)
            })
        })

        this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)
        this._itemDestroyAnimPool = ObjectPool(DestroyAnimation, [], 3)
        if (window.config.MODE === 'development') {
            this._clickDamageVisPool = ObjectPool(DamagePercent, [_self => {
                self.remove(_self)
            }], 10)
        }

        this._canUseCommonBounds = true
    }

    _dropGold(i, dropData, value) {
        const self = this
		const allCoins = dropData[ObjectType.GOLD];
        dropData[ObjectType.GOLD] -= value
        self._owner.model.addGold(value)
		const visualCoins = Math.floor(Math.max(1, (value / allCoins) * 200));
        // console.log(allCoins, value, value/allCoins)
        self._particles.dropCoin(i, visualCoins)
        self._goldCounter.setValue(this._owner.model.gold)
        window.GA.accumulate('gold', {stage: this._slotItems[i].stage, num: value})
		
        window.soundman.play(
            'sound_sfx', 
            'coin' + (Math.random() > 0.5 ? 1 : 2), 
            0.25 + Math.random() * 0.1
        )
    }

    _updateBounds() {
        this._owner.dragonManager.setCommonBounds(
            50, this._owner.renderer.size.x-50,
            50, this._owner.renderer.size.y-450
        )
    }

    onViewportSizeChanged() {
        if (!this._canUseCommonBounds) return
        this._updateBounds()
    }

    show() {
        super.show()
        this._goldCounter.setValueInstantly(this._owner.model.gold)
        this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)

        this._updateBounds()
    }

    animateHide(to, onComplete) {
        this._slotItems.forEach(si => si.disable())
        super.animateHide(to, onComplete)
    }

    animateShow(from, onComplete) {
        super.animateShow(from, () => {
            this._slotItems.forEach(si => si.enable())
            onComplete()
        })
    }
	
	isSlotLive(idx) {
        if (this._slotItems[idx] === null) return false
        return this._slotItems[idx].health > 0
    }

    update(dt) {
        super.update(dt)

        this._particles.update(dt)
        this._slotItems.forEach((item, i) => {
            if (item === null) return
            item.update && item.update(dt)
            const clicks = item.extractClicks()
            if (clicks > 0) {
                this._canUseCommonBounds = false
                window.GA.accumulate('clicks', {num: clicks, stage: item.stage})
                const targetDmg = window.GD.getTargetDamage(item.stage)
                if (window.config.MODE === 'development') {
                    const dmgVis = this._clickDamageVisPool.getOne()
                    this.add(dmgVis)
                    dmgVis.initialize(`${Math.round((this._clickDamage / targetDmg) * 100)}%`, item.visual.x, item.visual.y)
                }

                const totalDamage = clicks * this._clickDamage
                const clickDamage = Math.floor(totalDamage * window.GD.clickSourceDamage)
                const dragonDamage = totalDamage - clickDamage
                this._owner.dragonManager.attack(i, dragonDamage)
                this.processSlotDamage(i, DAMAGE_SOURCE.CLICK, clickDamage)
            }
        })
    }

    openItem(slotItem) {
        const slotIdx = slotItem.slot
        const drop = slotItem.drop
        const dropsGold = typeof drop[ObjectType.GOLD] !== "undefined"
        const dropsDragon = typeof drop[ObjectType.DRAGON] !== "undefined"
        const dropsEgg = typeof drop[ObjectType.EGG] !== "undefined"

        slotItem.animateOpen().then(()=> {
            slotItem.clear(this._itemDestroyAnimPool.getOne()).then(() => {
                this.remove(slotItem)
                this._slotItems[slotIdx] = null
                if (dropsEgg) {
                    this._generator.populateConcrete(
                        this._slotItems, slotIdx, drop[ObjectType.EGG]
                    )
                } else {
                    this._generator.populate(this._slotItems)
                }
            })
            if (dropsGold) {
                this._dropGold(slotIdx, drop, drop[ObjectType.GOLD])
                window.soundman.play('sound_sfx', 'coins', 0.5)
            }
            if (dropsDragon) {
                if (this._owner.model.dragonsCount === 0) {
                    this.addControl(this.uiCreator.getNavButton(
                        this._owner, SCREEN_TYPE.UPGRADE,
                        'ui_button_upgrade', {x: 0, y: 0}, {x: 'left', xOffset: 40, y: 'top', yOffset: 40}))
                    TweenLite.from(this._controls[this._controls.length-1].visual, 1, {x: -80})
                }
                const dragonData = drop[ObjectType.DRAGON]
                this._owner.model.addDragon(dragonData.tier, dragonData.level)
                this._clickDamage = window.GD.getClickDamage(this._owner.model.dragons)

                this._owner.dragonManager.addVisualDragon(
                    dragonData.tier,
                    dragonData.level,
                    this._slotItems[slotIdx].visual
                )

                window.soundman.play(
                    'sound_sfx',
                    `egg${Math.random() > 0.5 ? 1 : 2}`,
                    0.5
                )
            }
            if (slotItem.type === ObjectType.CHEST || slotItem.type === ObjectType.PAID_CHEST) {
                window.soundman.play('sound_sfx', 'chest', 0.65)
            }
        })
    }

    processSlotDamage(slotIdx, source, damage) {
        if (!this._active || this._hiding) return

        const slotItem = this._slotItems[slotIdx]
        if (slotItem.health <= 0) {
            // console.log('slot item already destroying, but got damage from source ', source)
            return
        }
        const rewardingClick = slotItem.processDamage(damage, source)
        if (slotItem.health <= 0) {
            this.openItem(slotItem)
        } else if (rewardingClick === true && typeof slotItem.drop[ObjectType.GOLD] !== "undefined") {
            if (this._active && !this._hiding) {
                const intermediateGold = Math.max(1, Math.floor(slotItem.drop[ObjectType.GOLD] * 0.03))
                this._dropGold(slotIdx, slotItem.drop, intermediateGold)
            }
        }
    }
}