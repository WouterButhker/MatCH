import Geolocation from '@react-native-community/geolocation';
import * as React from 'react';
import {Button, StyleSheet} from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import Config from "../config.json";
import * as SecureStore from 'expo-secure-store';
import {NavigationParams, NavigationScreenProp, NavigationState} from "react-navigation";

export default class MapScreen extends React.Component<{navigation: NavigationScreenProp<NavigationState, NavigationParams>}, {} > {
    constructor (props: any) {
        super(props);
        this.state = {
        };
    }

    render () {
        return (
            <View style={{ flex: 1 }}>

            </View>
        );
    }

    componentDidMount() {
    }

    async getValueFor(key: string) {
        let result = await SecureStore.getItemAsync(key);
        if (result) {
            this.setState({token: result})
        } else {
            alert('No key found');
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});