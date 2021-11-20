import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ImageBackground,
  Button,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import logo from '../assets/truck.png';
import {
  driverLogin,
  userLogin,
  confirmDriver,
  confirmUser,
} from '../actions/auth';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import background from '../assets/background.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {Linking} from 'react-native';
import {ScrollView} from 'react-native';
import {NavigationActions, StackActions} from 'react-navigation';

class login extends Component {
  state = {
    phone: null,
    name: '',
    otpSent: null,
    role: 'user',
    isEnabled: null,
    otp: null,
  };
  setUserObject = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('user', jsonValue);
      console.log(jsonValue);
    } catch (e) {
      // save error
    }
    this.props.navigation.navigate('App');
    console.log('Done.');
  };
  componentDidUpdate() {
    console.log('up', this.props);
    if (this.props.isLoggedin && !this.state.otpSent) {
      this.setState({otpSent: true});
    }
    if (this.props.isConfirmed) {
      console.log('USER', this.props.user);
      this.setUserObject(this.props.user);
      this.props.navigation.navigate('App');
      this.props.navigation.reset({
        index: 0,
        routes: [{name: 'App'}],
      });
    }
  }
  componentWillUnmount() {
    this.setState({
      phone: null,
      name: '',
      otpSent: null,
      role: 'user',
      isEnabled: null,
      otp: null,
    });
  }
  handleotp = () => {
    const {name, phone, role} = this.state;
    console.log(this.state.role);
    if (role === 'driver') {
      console.log('state', this.state);
      this.props.driverLogin({phone: phone});
    }
    if (role === 'user') this.props.userLogin({phone: phone});
  };
  confirm = () => {
    const {role} = this.state;
    if (role === 'driver') {
      this.props.confirmDriver({code: this.state.otp});
    }
    if (role === 'user') this.props.confirmUser({code: this.state.otp});
  };
  render() {
    console.log('ROLE', this.props.screenProps);
    return (
      <ScrollView style={{height: '100%'}}>
        <View style={styles.container}>
          {/* <Text style={styles.header}>LOGIN</Text> */}
          <Image
            source={logo}
            style={{width: 200, height: 200, marginTop: 80}}
          />
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              margin: 40,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#758283',
              }}>
              <Icon
                style={{marginLeft: 10}}
                name="phone"
                size={35}
                color="#000"
              />

              <TextInput
                keyboardType="number-pad"
                maxLength={10}
                placeholder="Phone No"
                leftIcon={{type: 'font-awesome', name: 'phone'}}
                style={styles.phone}
                onChangeText={(value) => this.setState({phone: value})}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{marginRight: 100}}>
              <Icon
                size={50}
                name="taxi"
                onPress={() => this.setState({role: 'driver'})}
                color={this.state.role === 'driver' ? '#800000' : '#000'}
              />
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 17,
                  fontWeight: 'bold',
                  marginLeft: -8,
                }}>
                DRIVER
              </Text>
            </View>
            <View>
              <Icon
                color={this.state.role === 'user' ? '#800000' : '#000'}
                size={50}
                name="user"
                onPress={() => this.setState({role: 'user'})}
              />
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 17,
                  fontWeight: 'bold',
                  marginLeft: -5,
                }}>
                USER
              </Text>
            </View>
          </View>

          {this.state.otpSent && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#758283',
                margin: 32,
              }}>
              <Icon
                style={{marginLeft: 10}}
                name="key"
                size={35}
                color="#000"
              />

              <TextInput
                keyboardType="number-pad"
                maxLength={4}
                placeholder="OTP"
                leftIcon={{type: 'font-awesome', name: 'phone'}}
                style={styles.phone}
                onChangeText={(value) => this.setState({otp: value})}
              />
            </View>
          )}
          {!this.state.otpSent ? (
            <View
              style={{
                backgroundColor: '#000',
                width: '100%',
                height: 55,
                marginTop: 20,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
              <Button
                onPress={() => this.handleotp()}
                color="#000"
                title="Get OTP"
              />
            </View>
          ) : (
            <View
              style={{
                backgroundColor: '#000',
                width: '100%',
                height: 55,
                marginTop: 20,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
              <Button
                onPress={() => this.confirm()}
                color="#000"
                title="Login"
              />
              <Icon color="#fff" name="arrow-right" />
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = ({auth}) => {
  //console.log('mapstp', auth);
  return {
    isConfirmed: auth.isConfirmed,
    isLoggedin: auth.isLoggedin,
    user: auth.user,
  };
};

export default connect(mapStateToProps, {
  userLogin,
  driverLogin,
  confirmUser,
  confirmDriver,
})(login);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    marginTop: 0,
    borderColor: '#fff',
    padding: 0,
  },

  child: {
    flex: 1,
  },
  header: {
    textAlign: 'center',
    fontSize: 25,
    marginTop: 50,
    fontFamily: 'Roboto',
    color: '#f1f1f1',
    fontWeight: 'bold',
  },
  phone: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: '#fff',
    color: '#758283',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});
