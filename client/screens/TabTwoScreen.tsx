import * as React from 'react';
import {PermissionsAndroid, StyleSheet} from 'react-native';
import Geolocation from 'react-native-geolocation-service'
import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import {useState} from "react";



export default function TabTwoScreen() {
  let [lat, setLat] = useState(0);
  let [long, setLong] = useState(0);
  getLocation(setLat, setLong);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Locatie</Text>
      <Text> Latitude: {lat}</Text>
      <Text> Longitude: {long}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="/screens/TabTwoScreen.tsx" />
    </View>
  );
}

const getLocation = async (setLat: (arg0: number) => void, setLong: (arg0: number) => void) => {
  await requestCameraPermission();
  return Geolocation.getCurrentPosition((pos) => {
    console.log(pos);
    setLat(pos.coords.latitude);
    setLong(pos.coords.longitude);

  }, () => {
  }, {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, showLocationDialog: true});
}

const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Cool Photo App Camera Permission",
          message:
              "Cool Photo App needs access to your camera " +
              "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the camera");
    } else {
      console.log("Camera permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};

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
