import {URLParam} from '../utils/URLParam'

export const OK = () => {

    let userId = null

    return {
        getUserId() { return userId },

        init: () => {
            console.log('will initialize OK platform')
            return new Promise((resolve, reject) => {
                OKSDK.init({
                    app_id: window.config.APP_ID,
                    app_key: window.config.APP_KEY,
                },
                () => { // on success
                    console.log('SUCCESS!')
                    console.log('vars:')
                    console.log({
                        api_server: URLParam.GET('api_server'),
                        apiconnection: URLParam.GET('apiconnection'),
                        application_key: URLParam.GET('application_key'),
                        auth_sig: URLParam.GET('auth_sig'),
                        authorized: URLParam.GET('authorized'),
                        container: URLParam.GET('container'),
                        mob: URLParam.GET('mob'),
                        custom_args: URLParam.GET('custom_args'),
                        first_start: URLParam.GET('first_start'),
                        header_widget: URLParam.GET('header_widget'),
                        logged_user_id: URLParam.GET('logged_user_id'),
                        referer: URLParam.GET('referer'),
                        refplace: URLParam.GET('refplace'),
                        session_key: URLParam.GET('session_key'),
                        session_secret_key: URLParam.GET('session_secret_key'),
                        sig: URLParam.GET('sig'),
                        web_server: URLParam.GET('web_server'),
                        payment_promo_active: URLParam.GET('payment_promo_active'),
                        new_sig: URLParam.GET('new_sig'),
                        ip_geo_location: URLParam.GET('ip_geo_location')
                    })
                    resolve()
                },
                error => { // on fail
                    console.log('--FAILED!')
                    console.error(error)
                    reject(error)
                })
            })
        },

        wallpost: () => {
            console.log('Shitpost mockup OK method')
            return new Promise(resolve => {
                console.log('--will resolve shitpost')
                resolve()
            })  
        },

        invite: () => {
            console.log('Shitvite mockup OK method')
            return new Promise(resolve => {
                console.log('--will resolve shitvite')
                resolve()
            })
        }
    }
}