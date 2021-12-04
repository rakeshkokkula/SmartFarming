import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {Text} from 'react-native';
import {Avatar} from 'react-native-elements';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView, Swipeable} from 'react-native-gesture-handler';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import {
  trackRide,
  getRides,
  rideStatus,
  newRideNotif,
} from '../../actions/rides';
import Geolocation from '@react-native-community/geolocation';
import {isConfirmed} from '../../actions/auth';
import setupSocket from '../../../socket';

class NavigationMenu extends Component {
  constructor(props) {
    super(props);
    this.socket = setupSocket();
  }
  state = {
    user: null,
    location: null,
  };
  getUserLocation = () => {
    Geolocation.getCurrentPosition(
      (info) => {
        this.setState({
          location: [info.coords.longitude, info.coords.latitude],
        });
      },
      (err) => {
        //console.log(err, 'error');
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };
  getMyObject = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      this.setState({user: JSON.parse(jsonValue).user});
      //console.log('HNM', jsonValue);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // read error
    }

    //console.log('Done.');
  };
  componentDidMount() {
    //console.log('HELLO --->', this.props.role);

    this.getMyObject();
    this.getUserLocation();
    if (this.props?.role === 'driver') {
      //Alert.alert('GET');
      console.log('driver details');
      this.props.getRides({driverId: this.props?.user.user?._id});
    }
    if (this.props?.role === 'user') {
      console.log('KMM --->', this.props?.user.user._id);
      this.props.trackRide({userId: this.props?.user.user._id});
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.myRide?._id !== prevProps.myRide?._id &&
      this.props?.role === 'driver'
    ) {
      console.log('GET --->', this.state.user);
      this.props.getRides({driverId: this.state?.user?._id});
    }
    if (
      this.props.myRide?._id !== prevProps.myRide?._id &&
      this.props?.role === 'user'
    ) {
      console.log('KMM --->', this.state.user);
      this.props.trackRide({userId: this.state.user._id});
    }
    if (this.state.user === null) {
      this.getMyObject();
    }
  }
  componentWillUnmount() {
    // this.getMyObject();
    this.setState({user: null});
  }

  refresh = () => {
    if (this.props?.role === 'driver') {
      //Alert.alert('GET');
      console.log('driver details', this.props?.user.user?._id);
      this.props.getRides({driverId: this.props?.user.user?._id});
    }
    if (this.props?.role === 'user') {
      console.log('KMM --->', this.props?.user.user._id, this.props.myRide);
      this.props.trackRide({userId: this.props?.user.user._id});
    }
  };
  // componentWillReceiveProps = (props) => {
  //console.log('NAV', props.navigation);
  // if (!props.navigation.state.isDrawerOpen) {
  //   this.getMyObject();
  //   if (this.props?.role === 'driver') {
  //     this.props.getRides({driverId: this.state?.user?._id});
  //   }
  //   if (this.props?.role === 'user') {
  //     //console.log('KMM --->', this.state.user);
  //     this.props.trackRide({userId: this.state.user._id});
  //   }
  // }
  // };
  render() {
    //console.log('SER', this.props.myRide);
    // console.log(
    //   this.props?.role,
    //   this.props.myRide?.routes,
    //   'check',
    //   this.props?.role === 'driver' && this.props.myRide?.routes?.length > 0,
    //   this.props?.role === 'user' && this.props.myRide?.routes?.length > 0,
    //   this.props?.myRide?.isCompleted,
    // );
    return (
      <View
        onPress={() => this.props.navigation.closeDrawer()}
        style={{flex: 1}}>
        <View style={{height: '30%', backgroundColor: '#000'}}>
          <View
            style={{
              marginLeft: 25,
              marginTop: 25,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
            <Avatar
              size={70}
              overlayContainerStyle={{backgroundColor: '#fff'}}
              rounded
              icon={{name: 'person', color: '#333'}}
            />
            <View>
              <Text style={{color: '#fff', marginLeft: 15, fontWeight: '900'}}>
                {this.state.user?.name}
              </Text>
              <Text style={{color: '#fff', marginLeft: 15, marginTop: 10}}>
                {this.state.user?.phoneNo}
              </Text>
            </View>
          </View>
          <View style={{margin: 25}}>
            <Text style={{color: 'gray'}}>Do More With your account</Text>
            <Text style={{color: '#fff', marginTop: 20}}>
              Make money driving
            </Text>
          </View>
        </View>
        <View
          style={{
            margin: 25,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}>
          <Text
            onPress={() => this.props.navigation.navigate('Home')}
            style={{fontSize: 20}}>
            Home
          </Text>
          {/* <Text style={{fontSize: 20, marginTop: 15}}>Your Trips</Text> */}

          {!this.props?.myRide?.isCompleted &&
            (this.props?.role === 'driver' &&
            this.props.myRide?.routes?.length > 0 ? (
              <Text
                onPress={() =>
                  this.props.navigation.navigate('Track', {
                    user: this.state.user,
                    myRide: this.props.myRide,
                    location: this.state.location,
                  })
                }
                style={{fontSize: 20, marginTop: 15}}>
                Current Ride
              </Text>
            ) : (
              this.props?.role === 'user' &&
              this.props.myRide?.routes?.length > 0 && (
                <Text
                  onPress={() =>
                    this.props.navigation.navigate('Book', {
                      user: this.state.user,
                      myRide: this.props.myRide,
                      location: this.state.location,
                    })
                  }
                  style={{fontSize: 20, marginTop: 15}}>
                  My Ride
                </Text>
              )
            ))}
          <Text style={{fontSize: 20, marginTop: 15}}>Help</Text>
          <Text style={{fontSize: 20, marginTop: 15}} onPress={this.refresh}>
            Refresh
          </Text>
          <Text
            onPress={async () => {
              try {
                let user = await AsyncStorage.removeItem('user');
                if (user === null) {
                  this.props.isConfirmed();
                  this.props.navigation.navigate('Auth');
                  this.props.navigation.reset({
                    index: 0,
                    routes: [{name: 'Auth'}],
                  });
                }
              } catch (e) {
                // remove error
              }

              //console.log('Done.');
            }}
            style={{fontSize: 20, marginTop: 15}}>
            Sign out
          </Text>
        </View>
        <View
          style={{
            alignItems: 'center',
            position: 'absolute',
            bottom: 0,
            left: 105,
          }}>
          <Icon
            style={{
              margin: 25,
              alignItems: 'center',
            }}
            onPress={() => this.props.navigation.closeDrawer()}
            size={40}
            name="close"
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({auth, rides}) => {
  //console.log('CHNAGE', rides);
  return {
    myRide: rides.myRide,
  };
};

export default connect(mapStateToProps, {
  rideStatus,
  trackRide,
  getRides,
  isConfirmed,
  newRideNotif,
})(NavigationMenu);
