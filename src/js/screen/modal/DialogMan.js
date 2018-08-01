import {DialogMenu} from "./DialogMenu";
import {DialogUnlockPremiumSlot} from "./DialogUnlockPremiumSlot";

const DIALOG_TYPE = {
    MENU : 'Menu',
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
        [DIALOG_TYPE.MENU]: new DialogMenu(self),
        [DIALOG_TYPE.UNLOCK_PREMIUM_SLOT]: new DialogUnlockPremiumSlot(self)
    }

    return self
}