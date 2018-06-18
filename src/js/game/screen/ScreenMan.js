import {GameScreen} from "../GameScreen";
import {UpgradeScreen} from "../UpgradeScreen";
import {LeaderboardScreen} from "../LeaderboardScreen";

export const SCREEN_TYPE = {GAME: 'GAME', UPGRADE: 'UPGRADE', LEADERBOARD: 'LEADERBOARD'}

export const ScreenMan = (dragonMan, renderer, model) => {

    let currentScreen = null

    const self =  {
        get current() { return null },
        get renderer() { return renderer },
        get dragonManager() { return dragonMan },
        get model() { return model },
        instantTransit: to => {
            if (currentScreen) {
                screens[currentScreen].hide()
            }
            screens[to].show()
            currentScreen = to
            dragonMan.canUpdateBounds = to === SCREEN_TYPE.GAME
        },
        transit: to => {
            if (typeof transitions[currentScreen][to] === "undefined") {
                console.warn(`unhandled transition ${currentScreen}->${to}`)
                self.instantTransit(to)
            } else {
                transitions[currentScreen][to](renderer.size.x)
            }
            dragonMan.canUpdateBounds = to === SCREEN_TYPE.GAME
        },
        update: dt => {
            Object.keys(screens).forEach(k => {
                screens[k].update(dt)
            })
        }
    }

    const screens = {
        [SCREEN_TYPE.GAME] : new GameScreen(self),
        [SCREEN_TYPE.UPGRADE] : new UpgradeScreen(self),
        [SCREEN_TYPE.LEADERBOARD] : new LeaderboardScreen(self)
    }
    dragonMan.injectGameScreen(screens[SCREEN_TYPE.GAME])

    const makeTransition = (current, currentToOffset, next, nextFromOffset) => {
        screens[current].disableControls()
        screens[current].animateHide({x: currentToOffset}, () => {
            screens[current].hide()
        })
        screens[next].animateShow({x: nextFromOffset}, () => {
            screens[next].enableControls()
            currentScreen = next
        })
    }

    const transitions = {
        [SCREEN_TYPE.GAME] : {
            [SCREEN_TYPE.UPGRADE]: (offset) => {
                makeTransition(SCREEN_TYPE.GAME, offset, SCREEN_TYPE.UPGRADE, -offset)
            },
            [SCREEN_TYPE.LEADERBOARD]: (offset) => {
                makeTransition(SCREEN_TYPE.GAME, -offset, SCREEN_TYPE.LEADERBOARD, offset)
            }
        },
        [SCREEN_TYPE.UPGRADE]: {
            [SCREEN_TYPE.GAME]: (offset) => {
                makeTransition(SCREEN_TYPE.UPGRADE, -offset, SCREEN_TYPE.GAME, offset)
            }
        },
        [SCREEN_TYPE.LEADERBOARD]: {
            [SCREEN_TYPE.GAME]: (offset) => {
                makeTransition(SCREEN_TYPE.LEADERBOARD, offset, SCREEN_TYPE.GAME, -offset)
            }
        }
    }

    return self
}