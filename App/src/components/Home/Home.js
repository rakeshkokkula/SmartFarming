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
      // console.log(JSON.parse(user));
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
              location: [+info.coords.longitude, +info.coords.latitude],
            });
            // setState({
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
    //console.log('NAVIGATION -->', props.navigation);
    MapboxGL.setTelemetryEnabled(false);
    this.getUser();
    this.requestLocationPermission();
  }

  componentDidUpdate(prevProps, prevState) {
    ////console.log('UPDATE', user);
    ////console.log('RIDE', props.driverRides);
    // console.log(prevState, 'prev', prevProps, 'state', this.state);
    if (prevState.user?.user._id !== this.state.user?.user._id) {
      this.props.getNearByAction({
        lat: this.state.location[1],
        long: this.state.location[0],
      });
    }
    if (this.state.user?.role === 'user') {
      this.socket.on('track', (lat, long) => {
        console.log('SOCKET MESSAGE -->>', lat, long);
        // setState({driverLoc: [lat, long]});
      });
    }
    if (this.state.user?.role === 'driver') {
      this.socket.on('allot', (ride) => {
        console.log(this.state.alloted, 'alloted');
        if (!this.state.alloted) {
          this.setState({alloted: true});
          this.props.newRideNotif({
            ride: ride,
          });
          Alert.alert('NEW RIDE');
        }
      });
    }

    this.socket.on('accepted', (ride) => {
      console.log('acccccccccccccccccccccccccccccccccccccccccccccccccccccc');
    });

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

  componentWillUnmount() {
    this.setState({alloted: false, accepted: false});
  }

  render() {
    // console.log('cabs', props.cabs);
    //console.log('render', props.directions.uuid);
    if (this.props.cabs) {
      this.props.cabs[0] = parseFloat(this.props.cabs[0]);
      this.props.cabs[1] = parseFloat(this.props.cabs[1]);
    }
    this.socket.emit('join', this.state.user?.user?._id);
    // this.socket.emit('update', this.state.location[1], this.state.location[0]);

    this.socket.on('accepted', (ride) => {
      console.log(this.state.accepted, 'accepted');
      if (!this.state.accepted) {
        console.log('SOCKET MESSAGE RIDE ACCEPTED -->>', ride);
        this.props.newRideNotif({
          ride: ride,
        });
        this.props.trackRide({userId: this.state.user?.user?._id});
        Alert.alert('Wooh Ride Accepted');
        this.setState({accepted: true});
      }
    });
    this.socket.on('rejected', (msg) => {
      Alert.alert('Sorry :( No Driver');
    });

    // else if (user?.role === 'driver') {
    //   socket.on('allot', (ride) => {
    //     console.log('hello track 1');
    //     props.newRideNotif({
    //       ride: ride,
    //     });
    //     Alert.alert('NEW RIDE');
    //   });
    // }
    // console.log(this.props.myRide, 'myRide');
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
              ref={(ref) => (cameraRef = ref)}
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

// const HomeComp = (props) => {
//   const [location, setLocation] = useState([78.486671, 17.385044]);
//   const [query, setQuery] = useState('');
//   const [search, setSearch] = useState(null);
//   const [book, setBook] = useState(true);
//   const [bookingDetails, setBookingDetails] = useState({
//     name: '',
//     location: null,
//   });
//   const [route, setRoute] = useState(null);
//   const [weight, setWeight] = useState(null);
//   const [user, setUser] = useState(null);
//   const [showStatus, setShowStatus] = useState(null);
//   const [showModal, setShowModal] = useState(null);
//   const [places, setPlaces] = useState(null);
//   const [count, setCount] = useState(null);
//   const [routes, setRoutes] = useState(null);
//   const [driverLoc, setDriverLoc] = useState([]);
//   const [alloted, setAlloted] = useState(null);
//   const [accepted, setAccepted] = useState(null);

//   let cameraRef = null;
//   const socket = setupSocket();
//   const store = storeConfig();

//   useEffect(() => {
//     MapboxGL.setTelemetryEnabled(false);
//     getUser();
//     requestLocationPermission();
//     return () => {
//       setAccepted(false);
//       setAlloted(false);
//     };
//   }, []);

//   useEffect(() => {
//     props.getNearByAction({
//       lat: location[1],
//       long: location[0],
//     });
//   }, [user?.user?._id]);

//   useEffect(() => {
//     if (props?.directions?.routes) {
//       let arr = polyline.toGeoJSON(props?.directions?.routes[0].geometry, 5);
//       //console.log('ARR', arr);
//       setRoutes(arr);
//     }
//   }, [props?.directions?.uuid]);

//   useEffect(() => {
//     if (user?.role === 'user') {
//       socket.on('track', (lat, long) => {
//         console.log('SOCKET MESSAGE -->>', lat, long);
//         // setState({driverLoc: [lat, long]});
//       });
//     }
//     if (user?.role === 'driver') {
//       socket.on('allot', (ride) => {
//         if (!alloted) {
//           console.log('hello track 2', alloted);
//           setAlloted(true);
//           props.newRideNotif({
//             ride: ride,
//           });
//           Alert.alert('NEW RIDE');
//         }
//       });
//     }
//   }, []);

//   const getUser = async () => {
//     try {
//       const user = await AsyncStorage.getItem('user');
//       ////console.log(user);
//       if (user !== null) setUser(JSON.parse(user));
//     } catch (e) {}
//   };

//   const requestLocationPermission = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: 'Location Permission',
//           message: 'MyMapApp needs access to your location',
//         },
//       );

//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         //console.log('granted   ');
//         Geolocation.getCurrentPosition(
//           (info) => {
//             console.log('HJjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj', info);
//             setLocation([info.coords.longitude, info.coords.latitude]);
//             // setState({
//             //   location: [78.486671, 17.385044],
//             // });
//           },
//           (err) => {
//             //console.log(err, 'error');
//             Alert.alert(
//               'Info',
//               'Please Turn on your location and restart the app',
//             );
//           },
//           {enableHighAccuracy: true, timeout: 20000, maximumAge: 5000},
//         );
//         //console.log('Location permission granted');
//       } else {
//         //console.log('Location permission denied');
//       }
//     } catch (err) {
//       //console.warn(err, 'err');
//     }
//   };

//   const getCurrentUserLocation = () => {
//     ////console.log('aa');
//     if (!cameraRef) return;
//     moveCamera();
//   };

//   const moveCamera = (lat, long) => {
//     if (!cameraRef) return;
//     //console.log('moving camera', lat, long);
//     cameraRef.setCamera({centerCoordinate: location});
//   };

//   if (props.cabs) {
//     props.cabs[0] = parseFloat(props.cabs[0]);
//     props.cabs[1] = parseFloat(props.cabs[1]);
//   }
//   socket.emit('join', user?.user?._id);
//   socket.emit('update', location[1], location[0]);
//   if (user?.role === 'user') {
//     socket.on('accepted', (ride) => {
//       if (!accepted) {
//         console.log('SOCKET MESSAGE RIDE ACCEPTED -->>', ride);
//         setAccepted(true);
//         props.newRideNotif({
//           ride: ride,
//         });
//         props.trackRide({userId: user?.user?._id});
//         Alert.alert('Wooh Ride Accepted');
//       }
//     });
//     socket.on('rejected', (msg) => {
//       Alert.alert('Sorry :( No Driver');
//     });
//   }
//   return (
//     <View style={styles.page}>
//       <View style={styles.container}>
//         {!props.showRideDetails && (
//           <TouchableOpacity
//             style={{
//               zIndex: 1,
//               position: 'absolute',
//               margin: 15,
//             }}
//             onPress={() => {
//               props.navigation.openDrawer();
//             }}>
//             <Image
//               style={{
//                 width: 40,
//                 height: 40,
//               }}
//               source={menu}
//             />
//           </TouchableOpacity>
//         )}
//         {props.myRide?.routes?.length &&
//           !props.myRide.isCompleted &&
//           user?.role === 'driver' && (
//             <TouchableOpacity
//               style={{
//                 zIndex: 1,
//                 position: 'absolute',
//                 margin: 15,
//                 bottom: 10,
//                 right: 10,
//                 backgroundColor: '#000',
//                 width: 50,
//                 height: 30,
//                 borderRadius: 15,
//               }}
//               onPress={() => {
//                 props.navigation.navigate('Track', {
//                   user: user,
//                   myRide: props.myRide,
//                   location: location,
//                 });
//               }}>
//               <Text style={{color: '#fff', textAlign: 'center'}}>RIDE</Text>
//             </TouchableOpacity>
//           )}

//         {props.showRideDetails && (
//           <Icon
//             style={{
//               zIndex: 2,
//               margin: 14,
//               position: 'absolute',
//             }}
//             size={41}
//             name="arrow-back-circle"
//             onPress={() => {
//               props.hideRideDetails();
//               props.hidePlaces();
//             }}
//           />
//         )}

//         <MapboxGL.MapView
//           logoEnabled={false}
//           compassEnabled
//           zoomEnabled
//           pitchEnabled
//           style={styles.map}>
//           <MapboxGL.UserLocation visible />

//           {route !== null && (
//             <MapboxGL.ShapeSource id="line1" shape={route}>
//               <MapboxGL.LineLayer id="linelayer1" style={{lineColor: 'red'}} />
//             </MapboxGL.ShapeSource>
//           )}

//           {props.cabs?.length > 0 && user?.role === 'user' && (
//             <MapboxGL.ShapeSource
//               id="exampleShapeSource"
//               shape={{
//                 type: 'FeatureCollection',
//                 features: [
//                   {
//                     type: 'Feature',
//                     properties: {
//                       icon: 'cat',
//                     },
//                     geometry: {
//                       type: 'Point',
//                       coordinates: [props.cabs[1], props.cabs[0]],
//                     },
//                   },
//                 ],
//               }}>
//               <MapboxGL.SymbolLayer
//                 id="cab-loc"
//                 style={{iconImage: vehicle, iconSize: 0.05}}
//               />
//             </MapboxGL.ShapeSource>
//           )}
//           {routes !== null && props.showRideDetails && (
//             <MapboxGL.ShapeSource id="line1" shape={routes}>
//               <MapboxGL.LineLayer
//                 id="linelayer1"
//                 style={{lineColor: 'black'}}
//               />
//             </MapboxGL.ShapeSource>
//           )}

//           <MapboxGL.Camera
//             onPress={() => getCurrentUserLocation()}
//             ref={(ref) => (cameraRef = ref)}
//             followZoomLevel={15}
//             followUserMode="normal"
//             zoomLevel={15}
//             //followUserLocation
//             centerCoordinate={location}
//           />
//           <MapboxGL.PointAnnotation
//             coordinate={location}
//             key={'9090'}
//             id={'9090'}></MapboxGL.PointAnnotation>
//         </MapboxGL.MapView>
//         {!props.showRideDetails && user?.role === 'user' && <Search />}
//         <Places myLocation={location} user={user?.user} />
//         {props.showRideDetails && (
//           <CreateRide
//             myLocation={location}
//             user={user?.user}
//             driverLoc={driverLoc}
//           />
//         )}
//       </View>
//     </View>
//   );
// };
// const mapStateToProps = ({rides, directions}) => {
//   ////console.log(rides);
//   return {
//     cabs: rides.cabs.nearestPoints,
//     isRideCreated: rides.isRideCreated,
//     myRide: rides.myRide,
//     driverRides: rides.driverRides,
//     showRideDetails: directions.showRideDetails,
//     directions: directions.directions,
//   };
// };

// export default connect(mapStateToProps, {
//   getNearByAction,
//   getPlaces,
//   bookRide,
//   rideStatus,
//   trackRide,
//   getRides,
//   hideRideDetails,
//   hidePlaces,
//   newRideNotif,
// })(HomeComp);
