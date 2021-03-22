import * as React from 'react';
import {Button, StyleSheet} from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import MapView, {Marker} from 'react-native-maps';

export default class MapScreen extends React.Component<{}, { coords: any[], token: string }> {
    constructor (props: any) {
        super(props);
        this.state = {
            coords: [],
            token: ""
        };
        //console.log(this.state.coords)
    }
    async getPoints()  {
        await this.getToken()
        fetch('http://192.168.2.19:8080/userlocation/getlatest', {
            method: 'GET',
            headers: {
                Authorization: this.state.token
            }
        }).then((response) => response.json())
            .then(json => {
                let res = []
                // console.log(json)
                for(let j in json) {
                    res.push({
                        coordinates: {
                            latitude: parseFloat(json[j].latitude),
                            longitude: parseFloat(json[j].longitude)
                        },
                        title: json[j].team.teamName
                    })
                }
                this.setState({coords: res})
            })
            .catch(err => console.log(err))
    }

    getToken() {
        return fetch('http://192.168.2.19:8080/authentication/authenticate?username=kasper3&password=12345678',{
            method: 'POST'})
            .then(response => {
                let res = response.headers.get('Authorization')
                if(res == null) {
                    res = "";
                }
                this.setState({token: res})
            })
            .catch(err => {console.log(err)});
    }

    componentDidMount() {
        this.getPoints()
    }

    render () {
        console.log(this.state.coords)
        return (
            <View style={{ flex: 1 }}>
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: 52.0116,
                        longitude: 4.3571,
                        latitudeDelta: 0.3,
                        longitudeDelta: 0.3,
                    }}
                >
                    {this.state.coords.map((marker, index) => (
                        <Marker
                            coordinate={marker.coordinates}
                            title={marker.title}
                            key={index}
                            image={require('../icons/car.png')}
                        />
                    ))}
                </MapView>
                <Button title={'refresh'} onPress={() => this.getPoints()}/>
                <EditScreenInfo path="/screens/MapScreen.tsx" />
            </View>
        );
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