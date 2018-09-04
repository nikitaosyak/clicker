
export const Mockup = () => {

    return {
        init: () => {
            console.log('%cPlatform:Mockup: initialize platform', 'color: #CC22CC')
            return new Promise(resolve => {
                console.log('%c    initialize successfull', 'color: #CC22CC')
                resolve()
            })
        },

        wallpost: () => {
            console.log('%cPlaftorm:Mockup: will wallpost', 'color: #CC22CC')
            return new Promise(resolve => {
                console.log('%c    wallpost successfull', 'color: #CC22CC')
                resolve()
            })  
        },

        invite: () => {
            console.log('%cPlatfrom:Mockup: will invite', 'color: #CC22CC')
            return new Promise(resolve => {
                console.log('%c    invite successfull', 'color: #CC22CC')
                resolve()
            })
        }
    }
}