import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
  Modal,
  Button,
} from 'react-native';
import {hideRideDetails} from '../../actions/directions';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Geolocation from '@react-native-community/geolocation';
import {Card, ListItem} from 'react-native-elements';
import {getNearByAction} from '../../actions/rides';
import {getPlaces, hidePlaces} from '../../actions/places';
import Icon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import vehicle from '../../assets/vehicle.png';
import {
  bookRide,
  rideStatus,
  trackRide,
  getRides,
  newRideNotif,
} from '../../actions/rides';
import polyline from '@mapbox/polyline';
import {User} from '../../../user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import setupSocket from '../../../socket';
import auth from '../../reducers/auth';
import login from '../login';
import {CommonActions} from '@react-navigation/native';
import storeConfig from '../../../store';
import menu from '../../assets/menu.png';
import Search from './Search';
import CreateRide from './CreateRide';
import Places from './Places';
import {PermissionsAndroid} from 'react-native';

MapboxGL.setAccessToken(
  'pk.eyJ1IjoicmVoYW5tb2hpdWRkaW4iLCJhIjoiY2trdmNjZmQ4MXo0cjJ2czFkczUyZGJ2OCJ9.9xqSVO79n-16_Qd9yBxKGw',
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 52,
    backgroundColor: '#fff',
  },
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
    zIndex: 100,
  },
  map: {
    flex: 1,
  },
  bookingCard: {
    zIndex: 2,
    height: 300,
    backgroundColor: 'transparent',
    borderRadius: 120,
    width: 300,
  },
});
class Home extends Component {
  state = {
    location: [78.486671, 17.385044],
    query: '',
    search: null,
    book: true,
    bookingDetails: {
      name: '',
      location: null,
    },
    route: null,
    weight: null,
    user: null,
    showStatus: null,
    showModal: null,
    places: null,
    count: 1,
    routes: null,
    driverLoc: [],
    alloted: false,
    accepted: false,
  };
  cameraRef = null;
  socket = setupSocket();
  store = storeConfig();
  getUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      ////console.log(user);
      if (user !== null) this.setState({user: JSON.parse(user)});
    } catch (e) {}
  };
  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'MyMapApp needs access to your location',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //console.log('granted   ');
        Geolocation.getCurrentPosition(
          (info) => {
            console.log('HJjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj', info);
            this.setState({
              location: [info.coords.longitude, info.coords.latitude],
            });
            // this.setState({
            //   location: [78.486671, 17.385044],
            // });
          },
          (err) => {
            //console.log(err, 'error');
            Alert.alert(
              'Info',
              'Please Turn on your location and restart the app',
            );
          },
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 5000},
        );
        //console.log('Location permission granted');
      } else {
        //console.log('Location permission denied');
      }
    } catch (err) {
      //console.warn(err, 'err');
    }
  }
  componentDidMount() {
    //console.log('NAVIGATION -->', this.props.navigation);
    MapboxGL.setTelemetryEnabled(false);
    this.getUser();
    this.requestLocationPermission();
  }

  componentDidUpdate(prevProps, prevState) {
    ////console.log('UPDATE', this.state.user);
    ////console.log('RIDE', this.props.driverRides);
    if (prevState.user?.user._id !== this.state.user?.user._id) {
      this.props.getNearByAction({
        lat: this.state.location[1],
        long: this.state.location[0],
      });
    }
    if (this.state.user?.role === 'user') {
      this.socket.on('track', (lat, long) => {
        console.log('SOCKET MESSAGE -->>', lat, long);
        // this.setState({driverLoc: [lat, long]});
      });
    }
    if (this.state.user?.role === 'driver' && !this.state.alloted) {
      this.socket.on('allot', (ride) => {
        console.log('hello track 2', this.state.alloted);
        this.setState({alloted: true});
        this.props.newRideNotif({
          ride: ride,
        });
        Alert.alert('NEW RIDE');
      });
    }

    if (prevProps.directions?.uuid !== this.props.directions?.uuid) {
      let arr = polyline.toGeoJSON(this.props.directions.routes[0].geometry, 5);
      //console.log('ARR', arr);
      this.setState({routes: arr});
    }
  }
  getCurrentUserLocation = () => {
    ////console.log('aa');
    if (!this?.cameraRef) return;
    this.moveCamera();
  };

  moveCamera = (lat, long) => {
    if (!this?.cameraRef) return;
    //console.log('moving camera', lat, long);
    this.cameraRef.setCamera({centerCoordinate: this.state.location});
  };

  render() {
    // console.log('cabs', this.props.cabs);
    //console.log('render', this.props.directions.uuid);
    if (this.props.cabs) {
      this.props.cabs[0] = parseFloat(this.props.cabs[0]);
      this.props.cabs[1] = parseFloat(this.props.cabs[1]);
    }
    this.socket.emit('join', this.state.user?.user?._id);
    this.socket.emit('update', this.state.location[1], this.state.location[0]);
    if (this.state.user?.role === 'user' && !this.state.accepted) {
      this.socket.on('accepted', (ride) => {
        //console.log('SOCKET MESSAGE RIDE ACCEPTED -->>', ride);
        this.setState({accepted: true});
        this.props.newRideNotif({
          ride: ride,
        });
        this.props.trackRide({userId: this.state.user?.user?._id});
        Alert.alert('Wooh Ride Accepted');
      });
      this.socket.on('rejected', (msg) => {
        Alert.alert('Sorry :( No Driver');
      });
    }
    // else if (this.state.user?.role === 'driver') {
    //   this.socket.on('allot', (ride) => {
    //     console.log('hello track 1');
    //     this.props.newRideNotif({
    //       ride: ride,
    //     });
    //     Alert.alert('NEW RIDE');
    //   });
    // }
    console.log(this.props.myRide, 'myRide');
    return (
      <View style={styles.page}>
        <View style={styles.container}>
          {!this.props.showRideDetails && (
            <TouchableOpacity
              style={{
                zIndex: 1,
                position: 'absolute',
                margin: 15,
              }}
              onPress={() => {
                this.props.navigation.openDrawer();
              }}>
              <Image
                style={{
                  width: 40,
                  height: 40,
                }}
                source={menu}
              />
            </TouchableOpacity>
          )}
          {this.props.myRide?.routes?.length &&
            !this.props.myRide.isCompleted &&
            this.state.user?.role === 'driver' && (
              <TouchableOpacity
                style={{
                  zIndex: 1,
                  position: 'absolute',
                  margin: 15,
                  bottom: 10,
                  right: 10,
                  backgroundColor: '#000',
                  width: 50,
                  height: 30,
                  borderRadius: 15,
                }}
                onPress={() => {
                  this.props.navigation.navigate('Track', {
                    user: this.state.user,
                    myRide: this.props.myRide,
                    location: this.state.location,
                  });
                }}>
                <Text style={{color: '#fff', textAlign: 'center'}}>RIDE</Text>
              </TouchableOpacity>
            )}

          {this.props.showRideDetails && (
            <Icon
              style={{
                zIndex: 2,
                margin: 14,
                position: 'absolute',
              }}
              size={41}
              name="arrow-back-circle"
              onPress={() => {
                this.props.hideRideDetails();
                this.props.hidePlaces();
              }}
            />
          )}

          <MapboxGL.MapView
            logoEnabled={false}
            compassEnabled
            zoomEnabled
            pitchEnabled
            style={styles.map}>
            <MapboxGL.UserLocation visible />

            {this.state.route !== null && (
              <MapboxGL.ShapeSource id="line1" shape={this.state.route}>
                <MapboxGL.LineLayer
                  id="linelayer1"
                  style={{lineColor: 'red'}}
                />
              </MapboxGL.ShapeSource>
            )}

            {this.props.cabs?.length > 0 && this.state.user?.role === 'user' && (
              <MapboxGL.ShapeSource
                id="exampleShapeSource"
                shape={{
                  type: 'FeatureCollection',
                  features: [
                    {
                      type: 'Feature',
                      properties: {
                        icon: 'cat',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [this.props.cabs[1], this.props.cabs[0]],
                      },
                    },
                  ],
                }}>
                <MapboxGL.SymbolLayer
                  id="cab-loc"
                  style={{iconImage: vehicle, iconSize: 0.05}}
                />
              </MapboxGL.ShapeSource>
            )}
            {this.state.routes !== null && this.props.showRideDetails && (
              <MapboxGL.ShapeSource id="line1" shape={this.state.routes}>
                <MapboxGL.LineLayer
                  id="linelayer1"
                  style={{lineColor: 'black'}}
                />
              </MapboxGL.ShapeSource>
            )}

            <MapboxGL.Camera
              onPress={() => this.getCurrentUserLocation()}
              ref={(ref) => (this.cameraRef = ref)}
              followZoomLevel={15}
              followUserMode="normal"
              zoomLevel={15}
              //followUserLocation
              centerCoordinate={this.state.location}
            />
            <MapboxGL.PointAnnotation
              coordinate={this.state.location}
              key={'9090'}
              id={'9090'}></MapboxGL.PointAnnotation>
          </MapboxGL.MapView>
          {!this.props.showRideDetails && this.state.user?.role === 'user' && (
            <Search />
          )}
          <Places
            myLocation={this.state.location}
            user={this.state.user?.user}
          />
          {this.props.showRideDetails && (
            <CreateRide
              myLocation={this.state.location}
              user={this.state.user?.user}
              driverLoc={this.state.driverLoc}
            />
          )}
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({rides, directions}) => {
  ////console.log(rides);
  return {
    cabs: rides.cabs.nearestPoints,
    isRideCreated: rides.isRideCreated,
    myRide: rides.myRide,
    driverRides: rides.driverRides,
    showRideDetails: directions.showRideDetails,
    directions: directions.directions,
  };
};

export default connect(mapStateToProps, {
  getNearByAction,
  getPlaces,
  bookRide,
  rideStatus,
  trackRide,
  getRides,
  hideRideDetails,
  hidePlaces,
  newRideNotif,
})(Home);
