const LocationService = () => {
    // @ts-ignore
    let subscribers: any[] = []
    let location = {
        latitude: 0,
        longitude: 0
    }

    // @ts-ignore
    return {
        subscribe: (sub: any) => subscribers.push(sub),
        setLocation: (coords: { latitude: number; longitude: number; }) => {
            location = coords
            subscribers.forEach((sub) => sub(location))
        },
        unsubscribe: (sub: any) => {
            subscribers = subscribers.filter((_sub) => _sub !== sub)
        }
    }
}

export const locationService = LocationService()