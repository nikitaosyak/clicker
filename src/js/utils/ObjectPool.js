
export const ObjectPool = (constructor, args, preallocate = 0) => {

    const instances = []

    while(preallocate > 0) {
        instances.push(constructor.apply(null, args))
        preallocate--
    }

    return {
        getOne: () => {
            if (instances.length > 0) {
                return instances.splice(0, 1)[0]
            } else {
                return constructor.apply(null, args)
            }
        },
        putOne: v => {
            instances.push(v)
        }
    }
}