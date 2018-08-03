import {DialogSettings} from "./DialogSettings";
import {DialogUnlockPremiumSlot} from "./DialogUnlockPremiumSlot";
import {DialogRestartGame} from "./DialogRestartGame";

const DIALOG_TYPE = {
    SETTINGS : 'Settings',
    UNLOCK_PREMIUM_SLOT: 'PremiumUnlock',
    RESTART_GAME: 'RestartGame'
}

export const DialogMan = (renderer) => {

    const self = {
        get renderer() { return renderer },
        show: (dialogType, ...args) => {
            const current = dialogs[dialogType]
            return current.show.apply(current, args)
        }
    }

    Object.values(DIALOG_TYPE).forEach(dialogName => {
        self[`show${dialogName}`] = (...args) => self.show.apply(self, [dialogName].concat(args))
    })

    const dialogs = {
        [DIALOG_TYPE.SETTINGS]: new DialogSettings(self),
        [DIALOG_TYPE.UNLOCK_PREMIUM_SLOT]: new DialogUnlockPremiumSlot(self),
        [DIALOG_TYPE.RESTART_GAME]: new DialogRestartGame(self)
    }

    return self
}