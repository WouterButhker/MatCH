import React, {useState} from "react";
import {View, Button, StyleSheet, TouchableOpacity, Text, TextInput, Image} from "react-native";
import Config from '../config.json'
import * as SecureStore from 'expo-secure-store';
import {
    NavigationParams,
    NavigationScreenProp,
    NavigationState,
} from 'react-navigation';
import DropDownPicker from 'react-native-dropdown-picker';


// @ts-ignore
const LoginButton = ({onPress, title}) => (
    <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
<Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
);

class RegistrationScreen extends React.Component<{ navigation: NavigationScreenProp<NavigationState, NavigationParams> }, { username: string, password: string, password2: string, team: number, token: string, teams: any[] }> {
    constructor (props: any) {
        super(props);
        this.state = {
            token: "",
            username: "",
            password: "",
            password2: "",
            team: -1,
            teams: []
        };
        //console.log(this.state.coords)
    }

    render() {
        return (
            <View>
                <Image source={require('../icons/logo.png')} style={styles.img} />
                <this.UsernameTextBox/>
                <this.PasswordTextBox/>
                <this.PasswordTextBox2/>
                <this.TeamPicker/>
                <this.CreateProfile/>
            </View>
    );
    }

    async componentDidMount() {
        await this.getTeams()
    }


    UsernameTextBox = () => {
        const [text, setText] = useState('');

        return (
            <TextInput
                style={styles.textContainer}
        placeholder="Username"
        onChangeText={text => this.setState({username: text})}
        />
    );
    }

    PasswordTextBox = () => {
        const [text, setText] = useState('');

        return (
            <TextInput
                style={styles.textContainer}
        secureTextEntry={true}
        placeholder="Password"
        onChangeText={text => this.setState({password: text})}
        />
    );
    };

    PasswordTextBox2 = () => {
        const [text, setText] = useState('');

        return (
            <TextInput
                style={styles.textContainer}
                secureTextEntry={true}
                placeholder="Confirm Password"
                onChangeText={text => this.setState({password2: text})}
            />
        );
    };

    // Login = () => {
    //     return (
    //         <View style={styles.screenContainer}>
    //             {/*hier kan bij de onpress de actie worden neergezet die uitgevoerd moet worden na het klikken,
    //     aka de username en wachtwoord checken*/}
    //             <LoginButton onPress={() => {
    //         fetch('http://' + Config.URL + ':' + Config.PORT + '/authentication/authenticate?username=' + this.state.username + "&password=" + this.state.password, {method: 'POST'})
    //             .then(async result => {
    //                 if (result.status == 401) {
    //                     alert("Password or Username is incorrect")
    //                 }
    //                 if (result.status == 200) {
    //                     let token = result.headers.get('authorization')
    //                     if (token == null) {
    //                         token = "";
    //                     }
    //                     await this.save("token", token)
    //                     console.log(result.headers.get('authorization'))
    //                     this.props.navigation.navigate('Map')
    //                 }
    //             })
    //             .catch(err => console.log(err))
    //         // @ts-ignore
    //         // attemptLogin(true);
    //     }}
    //     title="Log in"/>
    //         </View>
    // );
    // };

    async getValueFor(key: string) {
        let result = await SecureStore.getItemAsync(key);
        if (result) {
            this.setState({token: result})
        } else {
            alert('No key found');
        }
    }

    async getTeams()  {
        fetch('http://' + Config.URL + ':' + Config.PORT + '/teams/get')
            .then((response) => response.json())
            .then(json => {
                let res = []
                // console.log(json)
                for(let j in json) {
                    res.push({
                        label: json[j].teamName,
                        value: json[j].id
                    })
                }
                this.setState({teams: res})
            })
            .catch(err => console.log(err))
    }

    CreateProfile = () => {
        return (
            <View style={styles.screenContainer}>
                <LoginButton onPress={() => {
                    if(this.state.password == "" || this.state.password2 == "" || this.state.username == "" || this.state.team == -1) {
                        alert("Please fill in all fields")
                    }
                    if(this.state.password2 != this.state.password) {
                        alert("Passwords don't match")
                    }
                    fetch('http://' + Config.URL + ':' + Config.PORT + '/authentication/register?username=' + this.state.username + "&password=" + this.state.password, {method: 'POST'})
                        .then(async result => {
                            if (result.status == 409) {
                                alert("Username already exists")
                            }
                            if (result.status == 200) {
                                let token = result.headers.get('authorization')
                                if (token == null) {
                                    token = "";
                                }
                                await this.save("token", token)
                                console.log(result.headers.get('authorization'))
                                this.props.navigation.navigate('Map')
                            }
                        })
                        .catch(err => console.log(err))
        }}
        title="Create profile"/>
            </View>
    );
    };

    async save(key: string, value: string) {
        await SecureStore.setItemAsync(key, value);
    }

    TeamPicker = () => {
        return (
            <DropDownPicker items={this.state.teams}
                            onChangeItem={item => {console.log(item); this.setState({team: item.value})}}
                            containerStyle={styles.pickerContainer}
                            placeholder="Select a Team"
            />
        )
    }
}

const styles = StyleSheet.create({
    img: {
        top: 70,
        justifyContent: 'center',
        alignSelf: "center",
        width: 130,
        height: 130,
        marginBottom: 40
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
        padding: 16,
        backgroundColor: "#ad0c00",
        borderRadius: 10,
        // paddingVertical: 10,
        // paddingHorizontal: 12,
        alignSelf: "center",
        width: 250,
    },
    appButtonText: {
        justifyContent: 'center',
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase",
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
    },
    pickerContainer: {
        justifyContent: 'center',
        borderRadius: 10,
        alignSelf: "center",
        width: 300,
        height: 60,
        margin: 10,
        marginTop: 30,
        marginBottom: 20,
        //elevation: 3
    }
});

export default RegistrationScreen;