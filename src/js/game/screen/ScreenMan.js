import {GameScreen} from "../GameScreen";
import {UpgradeScreen} from "../UpgradeScreen";
import {LeaderboardScreen} from "../LeaderboardScreen";

export const SCREEN_TYPE = {GAME: 'GAME', UPGRADE: 'UPGRADE', LEADERBOARD: 'LEADERBOARD'}

export const ScreenMan = (renderer) => {

    let currentScreen = null

    const self =  {
        get current() { return null },
        get renderer() { return renderer },
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

    const transitions = {
        [SCREEN_TYPE.GAME] : {
            [SCREEN_TYPE.UPGRADE]: () => {
                self.instantTransit(SCREEN_TYPE.UPGRADE)
            },
            [SCREEN_TYPE.LEADERBOARD]: () => {
                self.instantTransit(SCREEN_TYPE.LEADERBOARD)
            }
        },
        [SCREEN_TYPE.UPGRADE]: {
            [SCREEN_TYPE.GAME]: () => {
                self.instantTransit(SCREEN_TYPE.GAME)
            }
        },
        [SCREEN_TYPE.LEADERBOARD]: {
            [SCREEN_TYPE.GAME]: () => {
                self.instantTransit(SCREEN_TYPE.GAME)
            }
        }
    }

    return self
}