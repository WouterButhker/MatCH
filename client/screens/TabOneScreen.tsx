import React, {useState} from "react";
import {View, Button, StyleSheet, TouchableOpacity, Text, TextInput} from "react-native";
import Config from '../config.json'


// @ts-ignore
const LoginButton = ({ onPress, title }) => (
    <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
      <Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
);

class App extends React.Component<{}, {username: string, password: string}> {

    render() {
        return (
            <>
                <this.UsernameTextBox/>
                <this.PasswordTextBox/>
                <this.Login/>
                <this.CreateProfile/>
            </>
        );
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
                    console.log(Config.URL, Config.PORT)
                    fetch('http://' + Config.URL + ':' + Config.PORT + '/authentication/authenticate?username='+this.state.username+"&password="+this.state.password, {method: 'POST'})
                        .then(result => {
                            if(result.status == 401) {
                                console.log("wrong")
                            }
                            if(result.status == 200) {
                                console.log(result.headers.get('authorization'))
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

    CreateProfile = () => {
        const [attemptLogin] = useState(false);
        return (
            <View style={styles.screenContainer}>
                {/*hier kan bij de onpress de actie worden neergezet die uitgevoerd moet worden na het klikken,
        aka de username en wachtwoord checken*/}
                <LoginButton onPress={() => {
                    // @ts-ignore
                    attemptLogin(true);
                }}
                             title="Create new profile"/>
            </View>
        );
    };
}

const styles = StyleSheet.create({
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