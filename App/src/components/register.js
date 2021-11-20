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
import logo from '../assets/truck.png';

import {
  driverRegister,
  userRegister,
  confirmDriver,
  confirmUser,
} from '../actions/auth';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import background from '../assets/background.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView} from 'react-native';

class register extends Component {
  state = {
    phone: null,
    name: '',
    otpSent: null,
    role: 'driver',
    isEnabled: null,
    otp: null,
  };
  componentDidUpdate() {
    console.log('up', this.props);
    if (this.props.isRegistered && !this.state.otpSent) {
      this.setState({otpSent: true});
    }
    if (this.props.isConfirmed) {
      AsyncStorage.setItem('user', JSON.stringify(this.props.user));
      this.props.navigation.navigate('Home');
    }
  }
  handleotp = () => {
    const {name, phone, role} = this.state;
    if (role === 'driver') {
      console.log(this.state);

      this.props.driverRegister({name: name, phone: phone});
    }
    if (role === 'user') this.props.userRegister({name: name, phone: phone});
  };
  confirm = () => {
    const {role} = this.state;
    if (role === 'driver') {
      this.props.confirmDriver({code: this.state.otp});
    }
    if (role === 'user') this.props.confirmUser({code: this.state.otp});
  };
  render() {
    return (
      <ScrollView style={{height: '100%', backgroundColor: '#fff'}}>
        <View style={styles.container}>
          <Image
            source={logo}
            style={{width: 200, height: 200, marginTop: 80}}
          />
          {/* <Text style={styles.header}>SAFAR</Text> */}
          <View
            style={{
              alignItems: 'center',
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
                name="user"
                size={35}
                color="#000"
              />

              <TextInput
                keyboardType="visible-password"
                maxLength={10}
                placeholder="Name"
                leftIcon={{type: 'font-awesome', name: 'name'}}
                style={styles.phone}
                onChangeText={(value) => this.setState({name: value})}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#758283',
                marginTop: 35,
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
                color={this.state.role === 'driver' ? '#22CB5C' : '#000'}
              />
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 17,
                  fontWeight: 'bold',
                  color: this.state.role === 'driver' ? '#22CB5C' : '#000',
                  marginLeft: -8,
                }}>
                DRIVER
              </Text>
            </View>
            <View>
              <Icon
                color={this.state.role === 'user' ? '#22CB5C' : '#000'}
                size={50}
                name="user"
                onPress={() => this.setState({role: 'user'})}
              />
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 17,
                  fontWeight: 'bold',
                  color: this.state.role === 'user' ? '#22CB5C' : '#000',
                  marginLeft: -8,
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
                title="Confirm"
              />
              <Icon color="#fff" name="arrow-right" />
            </View>
          )}
          <View
            style={{
              backgroundColor: '#000',
              width: '100%',
              height: 55,
              marginTop: 80,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              bottom: 30,
            }}>
            <Button
              onPress={() => this.props.navigation.navigate('login')}
              color="#000"
              title="Login"
            />
            <Icon color="#fff" name="arrow-right" />
          </View>
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = ({auth}) => {
  console.log('mapstp', auth);
  return {
    isConfirmed: auth.isConfirmed,
    isRegistered: auth.isRegistered,
    user: auth.user,
  };
};

export default connect(mapStateToProps, {
  userRegister,
  driverRegister,
  confirmUser,
  confirmDriver,
})(register);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    marginTop: 0,
    borderColor: '#fff',
    padding: 0,
    height: '100%',
  },

  child: {
    flex: 1,
  },
  header: {
    textAlign: 'center',
    fontSize: 55,
    marginTop: 10,
    fontFamily: 'Roboto',
    color: '#000',
    fontWeight: 'bold',
    shadowColor: '#fff',
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
