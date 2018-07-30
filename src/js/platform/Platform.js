import {Mockup} from './Mockup'
import {OK} from './OK'

export const Platform = () => {

    const platformConstructor = {
        'standalone': Mockup,
        'ok': OK,
    }    

    const self = {}

    Object.assign(self, platformConstructor[window.config.PLATFORM]())

    return self
}