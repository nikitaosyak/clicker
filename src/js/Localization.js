
export const Localization = locale => {

    const dictionary = window.resources.getJSON('localization')

    return {
        get: strId => {
            return dictionary[strId][locale]
        }
    }
}