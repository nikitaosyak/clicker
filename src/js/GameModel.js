
export const GameModel = () => {

    let connected = false
    let currentStage = 0
    let currentGold = 0

    const self = {
        connect: () => { // TODO: init connection here
            return new Promise((resolve, reject) => {
                if (connected) {
                    reject("already connected")
                }
                connected = true
                currentStage = 0//window.localStorage.clickerSavedStage || 0
                currentGold = 0//window.localStorage.clickerGold || 0
                resolve()
            })
        },
        synchronize: () => {
            return new Promise((resolve, reject) => {
                if (!connected) {
                    reject("not connected")
                }
                window.localStorage.clickerSavedStage = currentStage
                window.localStorage.clickerGold = currentGold
                resolve()
            })
        },

        get stage() { return currentStage },
        get gold() { return currentGold },
        addGold: (v) => {
            currentGold += v
            self.synchronize()
        },
        subtractGold: (v) => {
            currentGold -= v
            self.synchronize()
        },
        increaseStage: () => {
            currentStage++
            console.log('current stage: ', currentStage)
            self.synchronize()
        }
    }

    return self
}