import React, {Component} from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Linking,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Geolocation from '@react-native-community/geolocation';
import {
  rideStatus,
  trackRide,
  getRoute,
  paymentRide,
} from '../../actions/rides';
import PropTypes from 'prop-types';
import polyline from '@mapbox/polyline';
import drop from '../../assets/drop.png';
import pickup from '../../assets/pickup.png';
import cab from '../../assets/cab.png';
import menu from '../../assets/menu.png';

import {connect} from 'react-redux';
import setupSocket from '../../../socket';
import {Card} from 'react-native-elements';
import RazorpayCheckout from 'react-native-razorpay';

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
    zIndex: 100,
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
    bottom: 0,
  },
  bookingCard: {
    zIndex: 2,
    height: 300,
    backgroundColor: 'transparent',
    borderRadius: 120,
  },
});

class BookRide extends Component {
  state = {
    location: [0, 0],
    route: null,
    user: null,
    rideDetails: null,
    locations: null,
    cabLoc: [],
    paymentSuccess: false,
    completed: false,
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
        console.log('Location permission denied');
      }
    } catch (err) {
      //console.warn(err, 'err');
    }
  }

  componentDidMount() {
    MapboxGL.setTelemetryEnabled(false);
    //console.log('PROPS', this.props.myRide);
    let loc = '';
    let locate = [];
    if (this.props.myRide) {
      this.props.myRide?.routes.forEach((route) => {
        let {lat, long} = route;
        loc = loc + `${long},${lat};`;
      });
      locate = [
        +this.props.myRide?.routes[0].long,
        +this.props.myRide?.routes[0].lat,
      ];
      loc = loc.slice(0, -1);
    }
    // console.log('CON', loc);
    this.setState({
      user: this.props.route.params?.user,
      locations: loc,
      location: locate,
    });

    console.log(this.props.route.params?.user?._id, 'locate');
    //this.props.trackRide({userId: this.props.route.params.user.user._id});
    this.requestLocationPermission();
    this.socket.emit('join', this.props.route.params?.user?._id);
    // Geolocation.getCurrentPosition(
    //   (info) => {
    //     console.log('HJ', info);
    //     this.setState({
    //       location: [info.coords.longitude, info.coords.latitude],
    //     });
    //   },
    //   (err) => {
    //     console.log(err, 'error');
    //   },
    //   {enableHighAccuracy: true, timeout: 20000, maximumAge: 5000},
    // );
  }
  componentDidUpdate(prevProps, prevState) {
    // console.log(this.props, 'state');
    // console.log(prevProps, 'prevState');
    // if (prevState !== this.state || prevProps !== this.props) {
    //   console.log(prevState !== this.state, prevProps !== this.props);
    // }
    // if (
    //   prevState?.cabLoc[0] !== this.state.cabLoc[0] ||
    //   prevState?.cabLoc[1] !== this.state.cabLoc[1]
    // ) {
    //   console.log('not equal');
    //   this.socket.emit('join', this.state?.user?._id);
    // }
    //console.log('LOCATIONS', prevState);
    // if (this.state.rideDetails === null) {
    //   this.setState({rideDetails: this.props.myRide});
    // }
    // if (this.props.myRide) {
    //   //console.log('CALL', this.props.myRide._id);
    //   BackgroundGeolocation;
    //   socket.emit('join', this.state.user.user._id);
    //   socket.emit('update', this.props.myRide._id, '17.3930', '78.4730');
    // }

    this.socket.on('completed', (ride) => {
      console.log('completed');
      if (!this.state.completed) {
        this.props.navigation.navigate('Home');
        this.props.trackRide({userId: this.props?.user?.user?._id});
        this.setState({completed: true});
      }
      Alert.alert('Info', 'Ride Completed');
    });
    this.socket.on('track', (lat, long) => {
      if (
        (this.state.cabLoc[0] !== undefined &&
          prevState?.cabLoc[0] !== this.state.cabLoc[0] &&
          prevState?.cabLoc[1] !== this.state.cabLoc[1]) ||
        this.state.cabLoc.length === 0
      ) {
        //console.log('TRACK', lat, long);
        this.setState({cabLoc: [+long, +lat]});
      }
    });
    if (
      this.state.locations !== null &&
      prevState?.locations?.toString() !== this.state?.locations?.toString()
    ) {
      this.props.getRoute({locations: this.state.locations});
      this.setState({locations: null});
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

  // componentWillUnmount() {
  //   this.socket.off('completed', this.onCompleted);
  //   this.socket.off('track', this.onTrack);
  // }
  render() {
    //console.log('ROUTES', this.props.myRide?.customers);
    const {myRide} = this.props;
    // console.log(myRide, 'myRide');

    return (
      <View style={styles.page}>
        <View style={styles.container}>
          <TouchableOpacity
            style={{
              zIndex: 1,
              margin: 15,
              position: 'absolute',
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
          {myRide?.customers?.filter((i) => i._id === this.state.user?._id)
            ?.length &&
          !myRide?.customers?.find((i) => i._id === this.state.user?._id)
            ?.paymentStatus &&
          !this.state.paymentSuccess ? (
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                position: 'absolute',
                bottom: 10,
                left: 10,
                zIndex: 5,
                height: 50,
                backgroundColor: '#333',
                borderRadius: 10,
              }}
              onPress={() => {
                const details = myRide?.customers.filter(
                  (i) => i._id === this.state.user?._id,
                );
                const data = details ? details[0] : {};
                var options = {
                  description: 'Ride fare',
                  image: 'https://i.imgur.com/3g7nmJC.png',
                  currency: 'INR',
                  key: 'rzp_test_JP95iq1QMQU6er', // Your api key
                  amount: data.total_price * 100,
                  name: this.state.user?.name,
                  prefill: {
                    // email: 'void@razorpay.com',
                    // contact: '9191919191',
                    name: this.state.user?.name,
                  },
                  theme: {color: '#F37254'},
                };
                RazorpayCheckout.open(options)
                  .then((data) => {
                    this.setState({paymentSuccess: true});
                    this.props.paymentRide({
                      userId: this.state.user?._id,
                      paymentId: data.razorpay_payment_id,
                      rideId: myRide._id,
                    });
                    Alert.alert('Success', 'Payment Success');
                    // handle success
                    //   Alert.alert(`Success: ${data.razorpay_payment_id}`);
                  })
                  .catch((error) => {
                    // handle failure
                    console.log(error);
                    //   Alert.alert(`Error: ${error.code} | ${error.description}`);
                  });
              }}>
              <Text style={{color: '#fff'}}>Pay</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              position: 'absolute',
              bottom: 10,
              right: 10,
              zIndex: 5,
              height: 50,
              backgroundColor: '#333',
              borderRadius: 10,
            }}
            onPress={() => {
              Linking.openURL(`tel:${myRide?.driver_id?.phoneNo}`);
            }}>
            <Text style={{color: '#fff'}}>call driver</Text>
          </TouchableOpacity>
          <MapboxGL.MapView
            logoEnabled={false}
            key="map"
            compassEnabled
            style={styles.map}>
            <MapboxGL.UserLocation visible />
            {this.state.route !== null && (
              <MapboxGL.ShapeSource id="line1" shape={this.state.route}>
                <MapboxGL.LineLayer
                  id="linelayer1"
                  style={{lineColor: 'black'}}
                />
              </MapboxGL.ShapeSource>
            )}
            <MapboxGL.MarkerView
              coordinate={
                this.state.cabLoc[0] === undefined
                  ? [+myRide?.driver_id?.long, +myRide?.driver_id?.lat]
                  : this.state.cabLoc
              }>
              <Image source={cab} />
            </MapboxGL.MarkerView>
            {myRide?.routes?.map((route, index) => {
              //console.log('lat long', route);
              if (route.state === 'pickup') {
                return (
                  <MapboxGL.MarkerView
                    key={index}
                    coordinate={[+route.long, +route.lat]}>
                    <Image source={pickup} />
                  </MapboxGL.MarkerView>
                );
              } else {
                // console.log(route, 'route');
                return (
                  <MapboxGL.MarkerView
                    key={route._id}
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
        </View>
        <View style={{position: 'absolute', top: 10, right: 5}}>
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
            <Card.Title
              style={{color: '#000', fontSize: 20, fontWeight: '800'}}>
              Ride Detail
            </Card.Title>
            <Card.Divider style={{backgroundColor: '#000'}} />
            {myRide?.customers?.map((customer) => {
              ////console.log('HNM', this.state.user);
              if (customer._id === this.state.user?._id) {
                return (
                  <View style={{justifyContent: 'center'}} key={customer._id}>
                    <View
                      style={{flexDirection: 'row', justifyContent: 'center'}}>
                      <Text>Name :</Text>
                      <Text>{this.state.user?.name}</Text>
                    </View>
                    <View
                      style={{flexDirection: 'row', justifyContent: 'center'}}>
                      <Text>Weight :</Text>
                      <Text>{customer.weight}</Text>
                    </View>
                    <View
                      style={{flexDirection: 'row', justifyContent: 'center'}}>
                      <Text>Price :</Text>
                      <Text>{customer.total_price}</Text>
                    </View>
                  </View>
                );
              }
            })}
          </Card>
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({auth, rides}) => {
  return {
    user: auth.user,
    myRide: rides.myRide,
    routes: rides.route,
  };
};

export default connect(mapStateToProps, {
  rideStatus,
  trackRide,
  getRoute,
  paymentRide,
})(BookRide);
