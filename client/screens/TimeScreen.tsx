import * as React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import * as Location from 'expo-location';
import {LocationAccuracy} from 'expo-location';
import {View} from '../components/Themed';
import * as SecureStore from 'expo-secure-store';
import {NavigationParams, NavigationScreenProp, NavigationState} from "react-navigation";
import Config from "../config.json";
import * as TaskManager from 'expo-task-manager';
import * as Permissions from 'expo-permissions';
import { locationService } from '../components/subscription'

// @ts-ignore
TaskManager.defineTask("locTrack", ({ data: { locations }, error }) => {
    if (error) {
        return;
    }
    const { latitude, longitude } = locations[0].coords
    locationService.setLocation({
        latitude,
        longitude
    })
});

// @ts-ignore
const LoginButton = ({onPress, title}) => (
    <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
);

class MapScreen extends React.Component<{navigation: NavigationScreenProp<NavigationState, NavigationParams>}, {token: string, time: number, interval: any, start: number, locObj: any, pauseTime: number, pauseAmount: number} > {
    constructor (props: any) {
        super(props);
        this.state = {
            token: '',
            time: 0,
            interval: null,
            start: 0,
            locObj: null,
            pauseTime: 0,
            pauseAmount: 0
        };
    }
    // @ts-ignore
    onLocationUpdate = ({ latitude, longitude }) => {
        fetch('http://' + Config.URL + ':' + Config.PORT +
            '/userlocation/add?lat=' + latitude +
            '&long=' + longitude +
            '&speed=' + '0' +
            '&dir=' + '0'
            , {
                method: 'POST',
                headers: {
                    Authorization: this.state.token
                }
            })
            .then((response) => {if(response.status == 401 || response.status == 403) {
                response.json().then(js => console.log(js))
                this.props.navigation.navigate('Root')
            }})
            .catch(err => console.log(err))
    }

    render () {
        let name = "pause"
        if(this.state.pauseTime != 0) {
            name = "resume"
        }
        return (
            <View style={{ flex: 1 }}>
                <LoginButton onPress={async () => {
                    this.setState({interval: this.startTime()})
                    await this.getValueFor('token')
                    await this.startTracking()
                }} title="Start"/>
                <LoginButton onPress={async () => {
                    if(name == "pause") {
                        await this.pausetime()
                    } else {
                        await this.resumeTime()
                    }
                }} title={name}/>
                <LoginButton onPress={() => {
                    this.stopTracking()
                    this.stopTime()
                }} title="Stop"/>
                <Text style={styles.appButtonText}>{
                    this.getTimeString(Math.floor((this.state.time-this.state.start-this.state.pauseAmount)/1000))
                }</Text>
            </View>
        );
    }

    async getValueFor(key: string) {
        let result = await SecureStore.getItemAsync(key);
        if (result) {
            this.setState({token: result})
        } else {
            alert('No key found');
        }
    }

    async componentDidMount() {
        locationService.subscribe(this.onLocationUpdate)
    }

    async startTracking() {
        let { permissions } = await Permissions.askAsync(Permissions.LOCATION);
        if (permissions.location.scope == 'none') {
            console.log('Permission to access location was denied');
            return;
        }
        await this.getValueFor("token")
        if(permissions.location.scope == "whenInUse") {
            let obj = Location.watchPositionAsync({
                    accuracy: LocationAccuracy.High,
                    timeInterval: 10,
                    distanceInterval: 10
                },
                loc => {
                    fetch('http://' + Config.URL + ':' + Config.PORT +
                        '/userlocation/add?lat=' + loc.coords.latitude +
                        '&long=' + loc.coords.longitude +
                        '&speed=' + '0' +
                        '&dir=' + '0'
                        , {
                            method: 'POST',
                            headers: {
                                Authorization: this.state.token
                            }
                        })
                        .then((response) => {if(response.status == 401 || response.status == 403) {
                            this.props.navigation.navigate('Root')
                        }})
                        .catch(err => console.log(err))
                }
            )
            await this.setState({locObj: obj})
        }
        else if(permissions.location.scope == "always"){
            Location.startLocationUpdatesAsync("locTrack", {
                accuracy: LocationAccuracy.High,
                timeInterval: 10,
                distanceInterval: 10,
                foregroundService: {
                    notificationBody: "Your timer is running!",
                    notificationTitle: "MatchApp",
                    notificationColor: ' #ff0000'
                }
            })
        }
    }

    async pausetime() {
        if(this.state.start == 0) {
            alert("You have not started yet")
            return
        }
        if(this.state.pauseTime != 0) {
            alert("You have already paused once")
            return
        }
        this.setState({pauseTime: Date.now()})
        clearInterval(await this.state.interval)
        await this.getValueFor('token')
        fetch('http://' + Config.URL + ':' + Config.PORT + '/time/pause'
            , {
                method: 'POST',
                headers: {
                    Authorization: this.state.token
                }
            })
    }

    async resumeTime() {
        this.setState({pauseAmount: Date.now() - this.state.pauseTime})
        let interval = setInterval(() => {
            this.setState({time: Date.now()})
        }, 1000)
        this.setState({interval: interval})
        await this.getValueFor('token')
        fetch('http://' + Config.URL + ':' + Config.PORT + '/time/resume'
            , {
                method: 'POST',
                headers: {
                    Authorization: this.state.token
                }
            })
    }

    async stopTime() {
        clearInterval(await this.state.interval)
        await this.getValueFor('token')
        fetch('http://' + Config.URL + ':' + Config.PORT + '/time/finish'
            , {
                method: 'POST',
                headers: {
                    Authorization: this.state.token
                }
            })
    }

    async stopTracking() {
        let { permissions } = await Permissions.getAsync(Permissions.LOCATION);
        if(permissions.location.scope == "always") {
            await Location.stopLocationUpdatesAsync("locTrack")
        }
        else {
            let obj = await this.state.locObj
            obj.remove()
        }
    }

    async startTime() {
        await this.getValueFor('token')
        this.setState({start: Date.now()})
        fetch('http://' + Config.URL + ':' + Config.PORT + '/time/start'
            , {
                method: 'POST',
                headers: {
                    Authorization: this.state.token
                }
            })

        return setInterval(() => {
            this.setState({time: Date.now()})
        }, 1000)
    }

    getTimeString(sec: number) {
        let hours = Math.floor(sec/3600);
        (hours >= 1) ? sec = sec - (hours*3600) : hours = '00';
        let min = Math.floor(sec/60);
        (min >= 1) ? sec = sec - (min*60) : min = '00';
        (sec < 1) ? sec='00' : void 0;

        (min.toString().length == 1) ? min = '0'+min : void 0;
        (sec.toString().length == 1) ? sec = '0'+sec : void 0;

        return hours+':'+min+':'+sec;
    }

}

export default MapScreen


const styles = StyleSheet.create({
    img: {
        margin: 70,
        justifyContent: 'center',
        alignSelf: "center",
        width: 130,
        height: 130
    },
    separator: {
        marginVertical: 20,
        height: 1,
        width: '80%',
    },
    screenContainer: {
        justifyContent: 'center',
        padding: 16
    },
    appButtonContainer: {
        justifyContent: 'center',
        elevation: 8,
        padding: 16,
        backgroundColor: "#ad0c00",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignSelf: "center",
        width: 250,
        marginTop: 20
    },
    appButtonText: {
        justifyContent: 'center',
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    },
    textContainer: {
        justifyContent: 'center',
        fontSize: 18,
        padding: 16,
        backgroundColor: "#d4d4d4",
        borderRadius: 10,
        fontWeight: "bold",
        alignSelf: "center",
        width: 300,
        margin: 10,
        marginTop: 30
    }
});