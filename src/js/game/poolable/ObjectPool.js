
export const ObjectPool = (constructor, args, preallocate = 0) => {

    const instances = []
    const self = {}
    args.unshift(self)
    while(preallocate > 0) {
        instances.push(constructor.apply(null, args))
        preallocate--
    }

    self.getOne = () => {
            if (instances.length > 0) {
                return instances.splice(0, 1)[0]
            } else {
                return constructor.apply(null, args)
            }
        }
    self.putOne = v => {
            instances.push(v)
        }
    return self
}