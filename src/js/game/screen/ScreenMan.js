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
        instantTransit: screen => {
            if (currentScreen) {
                screens[currentScreen].hide()
            }
            screens[screen].show()
            currentScreen = screen
        },
        transit: to => {
            if (typeof transitions[currentScreen][to] === "undefined") {
                console.warn(`unhandled transition ${currentScreen}->${to}`)
                self.instantTransit(to)
            } else {
                transitions[currentScreen][to]()
            }
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
            [SCREEN_TYPE.UPGRADE]: () => {
                makeTransition(SCREEN_TYPE.GAME, 800, SCREEN_TYPE.UPGRADE, -800)
            },
            [SCREEN_TYPE.LEADERBOARD]: () => {
                makeTransition(SCREEN_TYPE.GAME, -800, SCREEN_TYPE.LEADERBOARD, 800)
            }
        },
        [SCREEN_TYPE.UPGRADE]: {
            [SCREEN_TYPE.GAME]: () => {
                makeTransition(SCREEN_TYPE.UPGRADE, -800, SCREEN_TYPE.GAME, 800)
            }
        },
        [SCREEN_TYPE.LEADERBOARD]: {
            [SCREEN_TYPE.GAME]: () => {
                makeTransition(SCREEN_TYPE.LEADERBOARD, 800, SCREEN_TYPE.GAME, -800)
            }
        }
    }

    return self
}