
export const GA = () => {

    const statUrl = `${window.location.protocol}//${window.location.hostname}:8083`
    let anchorTime = Date.now()
    let userId = null

    return {
        startSession: (state) => {
            userId = state.userid
            fetch(`${statUrl}/api/start_session`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: state.userid,
                    stage: state.currentStage,
                    gold: state.currentGold,
                    dragons: state.currentDragons,
                    clickDamage: window.GD.getClickDamage(state.currentDragons),
                    clicks: 0
                })
            }).then(response => {
                // console.log(response)
            }).catch(console.error)
        },
        diff: (attribute, newValue) => {
            fetch(`${statUrl}/api/diff`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: userId, dt: Date.now() - anchorTime, [attribute]: newValue})
            }).then(response => {
                // console.log(response)
            }).catch(console.error)
            anchorTime = Date.now()
        },
        accumulate: (attribute, value) => {
            fetch(`${statUrl}/api/accumulate`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: userId, dt: Date.now() - anchorTime, [attribute]: value})
            }).then(response => {
                // console.log(response)
            }).catch(console.error)
            anchorTime = Date.now()
        }
    }
}