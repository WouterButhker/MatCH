import * as React from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity} from 'react-native';
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
const LoginButton = ({onPress, title, disabled}) => (
    <TouchableOpacity onPress={onPress} style={styles.appButtonContainer} disabled={disabled}>
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
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                <View style={styles.separator}></View>
                <View style={styles.separator}></View>
                <LoginButton onPress={async () => {
                    this.setState({interval: this.startTime()})
                    await this.getValueFor('token')
                    await this.startTracking()
                }} title="Start" disabled={false}/>
                <LoginButton onPress={() => {
                    this.stopTracking()
                    this.stopTime()
                }} title="Stop" disabled={!this.state.start}/>
                <View style={styles.separator}></View>
                <Text style={styles.timeText}>{
                    this.getTimeString(Math.floor((this.state.time-this.state.start-this.state.pauseAmount)/1000))
                } </Text>
                <Text style={styles.warningText}> When the start button is pressed your location will be tracked even when the app is closed.
                    Your location will only be accessible by the MatCH Committee members to more easily help you during the Rally in case something goes wrong.
                    When the stop button is pressed, the app will not track your location anymore.
                </Text>
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
        await this.getValueFor('token')
        locationService.subscribe(this.onLocationUpdate)
        await this.updateTme()
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

    async updateTme() {
        fetch('http://' + Config.URL + ':' + Config.PORT + '/time/get', {
                method: 'GET',
                headers: {
                    Authorization: this.state.token
                }
        }).then((response) => {
            if(response.status == 403) {this.props.navigation.navigate('Root')}
            if(response.status == 401) {this.props.navigation.navigate('Root')}
            else {return response.json()}})
            .then(json => {
                console.log(json)
                for(let j in json) {
                    switch(json[j].type){
                        case "START":
                            this.setState({start: Date.parse(json[j].timestamp)})
                            break
                        case "PAUSE":
                            this.setState({pauseTime: Date.parse(json[j].timestamp)})
                            break
                        case "RESUME":
                            this.setState({pauseAmount: this.state.pauseTime - Date.parse(json[j].timestamp)})
                            break
                        case "FINISH":
                            this.setState({time: Date.parse(json[j].timestamp)-this.state.start-this.state.pauseAmount})
                            break
                    }
                }
            })
            .catch(err => console.log(err))
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
        backgroundColor: '#000'
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
    timeText: {
        justifyContent: 'center',
        fontSize: 30,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    },
    warningText: {
        justifyContent: 'center',
        fontSize: 14,
        color: "#fff",
        // fontWeight: "bold",
        alignSelf: "center",
        position: 'absolute',
        marginHorizontal: 20,
        bottom: 50
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
