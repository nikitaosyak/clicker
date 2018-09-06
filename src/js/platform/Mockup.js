function makeid(len = 12) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export const Mockup = () => {

    let userId = null

    return {
        getUserId() { return userId },

        init: () => {
            console.log('%cPlatform:Mockup: initialize platform', 'color: #CC22CC')

            userId = window.localStorage.dragon_clicker_mockup_user_id || makeid(8)
            window.localStorage.dragon_clicker_mockup_user_id = userId

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