import React, {useState} from "react";
import {View, Button, StyleSheet, TouchableOpacity, Text, TextInput, Image} from "react-native";
import Config from '../config.json'
import * as SecureStore from 'expo-secure-store';
import {
    NavigationParams,
    NavigationScreenProp,
    NavigationState,
} from 'react-navigation';


// @ts-ignore
const LoginButton = ({onPress, title}) => (
    <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
);

class App extends React.Component<{ navigation: NavigationScreenProp<NavigationState, NavigationParams> }, { username: string, password: string }> {
    constructor (props: any) {
        super(props);
        this.state = {
            username: "",
            password: "",
        };
        //console.log(this.state.coords)
    }

    render() {
        return (
            <>
                <Image source={require('../icons/logo.png')} style={styles.img}/>
                <this.UsernameTextBox/>
                <this.PasswordTextBox/>
                <this.Login/>
                <this.CreateProfile/>
            </>
        );
    }

    componentDidMount() {
        SecureStore.getItemAsync('token').then(res => this.redirect(res)).catch()
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

    Login = () => {
        const [attemptLogin] = useState(false);
        return (
            <View style={styles.screenContainer}>
                {/*hier kan bij de onpress de actie worden neergezet die uitgevoerd moet worden na het klikken,
        aka de username en wachtwoord checken*/}
                <LoginButton onPress={() => {
                    fetch('http://' + Config.URL + ':' + Config.PORT + '/authentication/authenticate?username=' + this.state.username + "&password=" + this.state.password, {method: 'POST'})
                        .then(async result => {
                            if (result.status == 401) {
                                alert("Password or Username is incorrect")
                            }
                            if (result.status == 200) {
                                let token = result.headers.get('authorization')
                                if (token == null) {
                                    token = "";
                                }
                                await this.save("token", token)
                                this.redirect(token)

                            }
                        })
                        .catch(err => console.log(err))
                    // @ts-ignore
                    // attemptLogin(true);
                }}
                             title="Log in"/>
            </View>
        );
    };

    redirect(token: string | null) {
        if(token == null) {
            token = ""
        }
        fetch('http://' + Config.URL + ':' + Config.PORT + '/authentication/isAdmin', {
            method: 'GET',
            headers: {
                Authorization: token
            }
        }).then(async result => {
            if (result.status == 200) {
                this.props.navigation.navigate('Map')
            } else {
                alert("Other screen")
            }
        })
    }

    async save(key: string, value: string) {
        await SecureStore.setItemAsync(key, value);
    }

    CreateProfile = () => {
        const [attemptLogin] = useState(false);
        return (
            <View style={styles.screenContainer}>
                {/*hier kan bij de onpress de actie worden neergezet die uitgevoerd moet worden na het klikken,
        aka de username en wachtwoord checken*/}
                <LoginButton onPress={() => {
                    this.props.navigation.navigate('Register')
                }}
                             title="Register"/>
            </View>
        );
    };
}

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

export default App;