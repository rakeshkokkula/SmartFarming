import React, {Component} from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import {Avatar, Card, ListItem, Icon} from 'react-native-elements';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Geolocation from '@react-native-community/geolocation';
import getDirections from 'react-native-google-maps-directions';

import {
  rideStatus,
  trackRide,
  getRoute,
  completeRide,
  decideRide,
  getRides,
  closeRide,
} from '../../actions/rides';
import PropTypes from 'prop-types';
import polyline from '@mapbox/polyline';
import drop from '../../assets/drop.png';
import pickup from '../../assets/pickup.png';
import cab from '../../assets/cab.png';

import {connect} from 'react-redux';
import setupSocket from '../../../socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 52,
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
  searchBar: {
    height: '9%',
    width: '100%',
    padding: 5,
    paddingLeft: 15,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#fff',
    position: 'absolute',
    zIndex: 2,
    bottom: -40,
  },
  bookingCard: {
    zIndex: 2,
    backgroundColor: 'transparent',
    borderRadius: 120,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '50%',
  },
});

class BookRide extends Component {
  state = {
    location: this.props?.route?.params?.location || [78.486671, 17.385044],
    route: null,
    user: null,
    rideDetails: null,
    locations: null,
    cabLoc: null,
    showRides: null,
  };
  socket = setupSocket();

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
        Geolocation.getCurrentPosition(
          (info) => {
            console.log('HJjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj', info);
            this.setState({
              location: [+info.coords.longitude, +info.coords.latitude],
            });
            // this.setState({
            //   location: [78.486671, 17.385044],
            // });
          },
          (err) => {
            console.log(err, 'error');
            Alert.alert(
              'Info',
              'Please Turn on your location and restart the app',
            );
          },
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 5000},
        );
        console.log('Location permission granted');
      } else {
        Alert.alert('Info', 'Please Turn on your location and restart the app');
        console.log('Location permission denied');
      }
    } catch (err) {
      Alert.alert('Info', 'Please Turn on your location and restart the app');
      //console.warn(err, 'err');
    }
  }

  componentDidMount() {
    MapboxGL.setTelemetryEnabled(false);
    //console.log('PROPS', this.props.route.params);
    let loc = '';
    loc =
      loc +
      `${this.props.route.params.location[0]},${this.props.route.params.location[1]};`;
    if (this.props.myRide) {
      this.props.myRide?.routes.forEach((route) => {
        let {lat, long} = route;
        loc = loc + `${long},${lat};`;
      });
      loc = loc.slice(0, -1);
      // console.log('CON', loc);
    }

    this.socket.emit('join', this.props.route.params?.user._id);
    this.socket.emit('ride', this.props.route.params.rideId);
    this.setState({user: this.props.route.params.user, locations: loc});
    //this.props.get({driverId: this.props.route.params?.user._id});
    //this.getUser();
    this.props.getRoute({locations: loc});
    this.requestLocationPermission();

    // Geolocation.getCurrentPosition(
    //   (info) => {
    //     //console.log('HJ', info);
    //     this.setState({
    //       location: [info.coords.longitude, info.coords.latitude],
    //     });
    //   },
    //   (err) => {
    //     //console.log(err, 'error');
    //   },
    //   {enableHighAccuracy: true, timeout: 20000, maximumAge: 5000},
    // );
  }
  componentDidUpdate(prevProps, prevState) {
    ////console.log('LOCATIONS', this.props.routes);
    let loc = '';
    if (prevProps.myRide?.routes?.length < this.props.myRide?.routes?.length) {
      this.props.myRide?.routes?.forEach((route) => {
        let {lat, long} = route;
        loc = loc + `${long},${lat};`;
      });
      loc = loc.slice(0, -1);
      this.setState({locations: loc});
      //console.log('CON--> 2', loc);
    }
    this.socket.on('track', (lat, long) => {
      console.log('AA RAHA', lat, long);
    });
    if (this.state.locations !== null) {
      this.props.getRoute({locations: this.state.locations});
      this.setState({locations: null});
    }
    if (this.props.fetchRoute === true) {
      let loc = '';
      //loc = this.props.route.params.loc;
      this.props.myRide?.routes?.forEach((route) => {
        let {lat, long} = route;
        loc = loc + `${long},${lat};`;
      });
      loc = loc.slice(0, -1);
      //console.log('ROU', loc);

      this.props.getRoute({locations: loc});
      //this.setState({locations: null});
    }
    if (
      this.state.route === null &&
      this.props.routes?.routes[0] !== undefined
    ) {
      let arr = polyline.toGeoJSON(this.props.routes.routes[0].geometry, 6);
      //console.log('ARR', arr);
      this.setState({route: arr});
    }
  }

  handleGetDirections = () => {
    let wayPoints = [];
    this.props.route.params.myRide?.routes.forEach((route) => {
      wayPoints.push({
        latitude: parseFloat(route.lat),
        longitude: parseFloat(route.long),
      });
    });
    const data = {
      source: {
        latitude: this.props.route.params.location[1],
        longitude: this.props.route.params.location[0],
      },
      destination: {
        latitude: parseFloat(
          this.props.route.params.myRide?.routes[
            this.props.route.params.myRide?.routes.length - 1
          ].lat,
        ),
        longitude: parseFloat(
          this.props.route.params.myRide?.routes[
            this.props.route.params.myRide?.routes.length - 1
          ].long,
        ),
      },
      params: [
        {
          key: 'travelmode',
          value: 'driving', // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: 'dir_action',
          value: 'navigate', // this instantly initializes navigation using the given travel mode
        },
      ],
      waypoints: wayPoints,
    };
    //console.log('MAPS DATA ---->', data);
    getDirections(data);
  };

  renderRideCard = () => {
    const {myRide} = this.props;
    //console.log('RIDE --H', myRide);
    // console.log(
    //   this.props.route?.params?.user.uid,
    //   'driver_id',
    //   this.props?.user,
    //   this.props.route?.params?.user?.user,
    // );
    return (
      <Card
        containerStyle={{
          backgroundColor: '#ffffff',
          borderRadius: 25,
          shadowColor: '#000',
          shadowOffset: {width: 1, height: 1},
          shadowRadius: 2,
          elevation: 5,
          marginBottom: 15,
        }}>
        <TouchableOpacity onPress={() => this.setState({showRides: true})}>
          <Card.Title style={{color: '#000', fontSize: 20, fontWeight: '800'}}>
            Ride Details
          </Card.Title>
        </TouchableOpacity>
        <Card.Divider style={{backgroundColor: '#000'}} />
        <ScrollView
          style={{maxHeight: '90%'}}
          onTouchStart={() => this.setState({showRides: true})}>
          {myRide !== null &&
            myRide?.customers?.map((customer, index) => {
              if (!customer.isRejected && !customer.isCompleted) {
                console.log('RIDE CUS', customer);
                return (
                  <View key={index}>
                    <View
                      key={index}
                      style={{
                        overflow: 'scroll',
                        backgroundColor: '#000',
                        borderRadius: 8,
                        padding: 8,
                        borderColor: '#f1f1f1',
                        marginBottom: 15,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          alignContent: 'center',
                          margin: 8,
                          backgroundColor: '#fff',
                          borderRadius: 55,
                          padding: 10,
                        }}>
                        <Avatar
                          size={50}
                          overlayContainerStyle={{
                            backgroundColor: '#000',
                            padding: 15,
                          }}
                          rounded
                          icon={{name: 'person', color: '#fff'}}
                        />
                        <Text
                          style={{
                            color: '#000',
                            marginLeft: 15,
                            fontSize: 25,
                            fontWeight: 'bold',
                          }}>
                          {customer._id.name?.length > 0
                            ? customer._id.name
                            : 'USER'}
                        </Text>
                      </View>

                      <View style={{padding: 5, alignItems: 'center'}}>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <View
                            style={{
                              alignItems: 'center',
                              flexDirection: 'row',
                            }}>
                            <Avatar
                              size={80}
                              overlayContainerStyle={{
                                backgroundColor: '#000',
                                padding: 0,
                              }}
                              rounded
                              icon={{name: 'money', color: '#fff'}}
                            />
                            <Text
                              style={{
                                textAlign: 'center',
                                color: '#fff',
                                marginRight: 15,
                                fontWeight: 'bold',
                                fontSize: 22,
                              }}>
                              {customer.total_price}
                            </Text>
                          </View>
                          <View
                            style={{
                              alignItems: 'center',
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="weight"
                              type="font-awesome-5"
                              color="#fff"
                              size={35}
                            />
                            <Text
                              style={{
                                textAlign: 'center',
                                color: '#fff',
                                marginRight: 15,
                                fontWeight: 'bold',
                                fontSize: 22,
                                marginLeft: 13,
                              }}>
                              {customer.weight}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{
                            marginBottom: 10,
                            textAlign: 'center',
                            color: '#fff',
                            marginRight: 15,
                            fontWeight: 'bold',
                            fontSize: 22,
                          }}>
                          Kms : {customer.kms}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                        }}>
                        <View style={{marginRight: 14}}>
                          <Button
                            color="#000"
                            onPress={() => {
                              if (customer.isAccepted == true) {
                                this.props.completeRide({
                                  userId: customer._id,
                                  rideId: this.props.myRide?._id,
                                });
                              } else {
                                this.props.decideRide({
                                  userId: customer._id,
                                  rideId: this.props.myRide?._id,
                                  accept: true,
                                  driverId: this.props.route.params?.user._id,
                                });
                              }
                            }}
                            title={customer.isAccepted ? 'Complete' : 'Accept'}
                          />
                        </View>
                        {!customer.isAccepted && (
                          <Button
                            color="#000"
                            onPress={() => {
                              this.props.decideRide({
                                userId: customer._id,
                                rideId: this.props.myRide?._id,
                                accept: false,
                                driverId: this.props.route.params.user?._id,
                              });
                            }}
                            title="Reject"
                          />
                        )}
                      </View>
                    </View>
                  </View>
                );
              }
            })}
        </ScrollView>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <View style={{width: 100}}>
            <Button
              color="#000"
              buttonStyle={{
                borderRadius: 0,
                marginLeft: 0,
                marginRight: 0,
                marginBottom: 0,
                width: 40,
              }}
              onPress={() =>
                this.props.getRides({
                  driverId: this.props.route.params?.user.uid,
                })
              }
              title="GET RIDES"
            />
          </View>
          <View style={{width: 100}}>
            <Button
              color="#000"
              buttonStyle={{
                borderRadius: 0,
                marginLeft: 0,
                marginRight: 0,
                marginBottom: 0,
                width: 40,
              }}
              onPress={() => {
                console.log(this.props.route.params?.user.uid, 'driver_id');
                this.props.closeRide({
                  driverId: this.props.route?.params?.user?.uid,
                });
                this.props.getRides({
                  driverId: this.props.route.params?.user.uid,
                });
                this.props.navigation.navigate('Home');
              }}
              title="Close Ride"
            />
          </View>
        </View>
      </Card>
    );
  };
  render() {
    //console.log('ROUTES', this.props.myRide?.customers);
    const {myRide} = this.props;
    return (
      <View style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView
            onPress={() => this.setState({showRides: null})}
            logoEnabled={false}
            compassEnabled
            style={styles.map}>
            <MapboxGL.UserLocation
              onUpdate={(loc) => {
                if (this.props.myRide?.routes) {
                  ////console.log('CALL', loc.coords);
                  // this.setState({
                  //   cabLoc: [loc.coords.longitude, loc.coords.latitude],
                  // });
                  this.socket.emit(
                    'update',
                    loc.coords.latitude,
                    loc.coords.longitude,
                  );
                }
              }}
              visible
            />
            {this.state.route !== null && (
              <MapboxGL.ShapeSource id="line1" shape={this.state.route}>
                <MapboxGL.LineLayer
                  id="linelayer1"
                  style={{lineColor: 'black'}}
                />
              </MapboxGL.ShapeSource>
            )}
            {/* <MapboxGL.MarkerView
              coordinate={
                this.state.cabLoc === null
                  ? [myRide?.driver_id.long, myRide?.driver_id.lat]
                  : this.state.cabLoc
              }>
              <Image source={cab} />
            </MapboxGL.MarkerView> */}
            {this.props.myRide?.routes?.map((route, index) => {
              //console.log('lat long', route);
              if (route.state === 'pickup') {
                console.log(route, this.state.location);
                return (
                  <MapboxGL.MarkerView
                    key={index}
                    coordinate={[+route.long, +route.lat]}>
                    <Image source={pickup} />
                  </MapboxGL.MarkerView>
                );
              } else {
                return (
                  <MapboxGL.MarkerView
                    key={index}
                    coordinate={[+route.long, +route.lat]}>
                    <Image source={drop} />
                  </MapboxGL.MarkerView>
                );
              }
            })}
            <MapboxGL.Camera
              onPress={() => this.getCurrentUserLocation()}
              ref={(ref) => (this.cameraRef = ref)}
              followZoomLevel={15}
              followUserMode="normal"
              zoomLevel={15}
              //followUserLocation
              centerCoordinate={this.state.location}
            />
          </MapboxGL.MapView>
          <View style={[styles.bookingCard, {bottom: 0}]}>
            {this.renderRideCard()}
          </View>
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 15,
              backgroundColor: '#000',
              borderRadius: 25,
            }}>
            <Button
              color="#000"
              title="USE GOOGLE"
              onPress={() => this.handleGetDirections()}
            />
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({auth, rides}) => {
  //console.log('DD', rides.getRoute);
  return {
    user: auth.user,
    myRide: rides.myRide,
    routes: rides.route,
    fetchRoute: rides.getRoute,
  };
};

export default connect(mapStateToProps, {
  rideStatus,
  trackRide,
  getRoute,
  completeRide,
  decideRide,
  getRides,
  closeRide,
})(BookRide);
