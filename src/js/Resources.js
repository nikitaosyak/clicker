
export const Resources = () => {

    const loader = PIXI.loader
    const res = loader.resources

    const self = {
        get raw() { return res },
        add: (alias, path) => {
            loader.add(alias, path)
            return self
        },
        load: (onComplete, onProgress) => {
            const binding = loader.onProgress.add(onProgress)
            loader.load((loader, resources) => {
                loader.onProgress.detach(binding)
                onComplete(loader, resources)
            })
        },
        hasResource: alias => alias in res,
        getTexture: (alias) => {
            if (alias in res) return res[alias].texture
            console.warn('texture', alias, 'was replaced with default texture')
            if (alias.indexOf('dragon') > -1) {
                return res.dragon_fallback.texture
            }
            return res.pixel.texture
        },
        getJSON: (alias) => {
            if (alias in res) return res[alias].data
            throw '   Cannot find JSON with alias ' + alias
        },
        getText: (alias) => {
            if (alias in res) return res[alias].data
            throw '   Cannot find TEXT with alias ' + alias
        },
        getAnimation: (alias) => {
            if (alias in res) return res[alias].data.frames
            throw '   Cannot find ANIMATION DESCRIPTOR with alias ' + alias
        }
    }
    return self
}