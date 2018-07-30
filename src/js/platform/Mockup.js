
export const Mockup = () => {

    return {
        init: () => {
            console.log('Initialize mockup platform')
            return new Promise(resolve => {
                console.log('--will resolve init')
                resolve()
            })
        },

        wallpost: () => {
            console.log('Shitpost mockup platform')
            return new Promise(resolve => {
                console.log('--will resolve shitpost')
                resolve()
            })  
        },

        invite: () => {
            console.log('Shitvite mockup platform')
            return new Promise(resolve => {
                console.log('--will resolve shitvite')
                resolve()
            })
        }
    }
}