
export const GameModel = () => {

    let connected = false
    let currentStage = 0

    const self = {
        connect: () => { // TODO: init connection here
            return new Promise((resolve, reject) => {
                if (connected) {
                    reject("already connected")
                }
                connected = true
                currentStage = 0//window.localStorage.clickerSavedStage || 0
                resolve()
            })
        },
        synchronize: () => {
            return new Promise((resolve, reject) => {
                if (!connected) {
                    reject("not connected")
                }
                window.localStorage.clickerSavedStage = currentStage
                resolve()
            })
        },

        get stage() { return currentStage },
        increaseStage: () => {
            currentStage++
            console.log('current stage: ', currentStage)
            self.synchronize()
        }
    }

    return self
}