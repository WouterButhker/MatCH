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

class MapScreen extends React.Component<{navigation: NavigationScreenProp<NavigationState, NavigationParams>}, {token: string, time: number, interval: any, start: any} > {
    constructor (props: any) {
        super(props);
        this.state = {
            token: '',
            time: 0,
            interval: null,
            start: null
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
                this.props.navigation.navigate('Root')
            }})
            .catch(err => console.log(err))
    }

    render () {
        return (
            <View style={{ flex: 1 }}>
                <LoginButton onPress={async () => {
                    // this.setState({interval: this.startTime()})
                    await this.startTracking()
                }} title="Start"/>
                <LoginButton onPress={() => {
                    // BackgroundTimer.clearInterval(this.state.interval);
                    this.stopTracking()
                }} title="Stop"/>
                <Text style={styles.appButtonText}>{
                    Math.floor(this.state.time-this.state.start)/1000
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
        let { status } = await Permissions.askAsync(Permissions.LOCATION);;
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }
        await this.getValueFor("token")
        Location.startLocationUpdatesAsync("locTrack",{
            accuracy: LocationAccuracy.High,
            timeInterval: 10,
            distanceInterval: 10,
            foregroundService:{
                notificationBody: "Your timer is running!",
                notificationTitle: "MatchApp",
                notificationColor: ' #ff0000'
            }
        })
    //     , location => {
    //         fetch('http://' + Config.URL + ':' + Config.PORT +
    //             '/userlocation/add?lat=' + location.coords.latitude +
    //             '&long=' + location.coords.longitude +
    //             '&speed=' + location.coords.speed +
    //             '&dir=' + location.coords.heading
    //             , {
    //                 method: 'POST',
    //                 headers: {
    //                     Authorization: this.state.token
    //                 }
    //             })
    //             .then((response) => {if(response.status == 401 || response.status == 403) {
    //                 this.props.navigation.navigate('Root')
    //             }})
    //             .catch(err => console.log(err))
    //     })
    }

    async stopTracking() {
        await Location.stopLocationUpdatesAsync("locTrack")
    }

    startTime() {
        this.setState({start: Date.now()})
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