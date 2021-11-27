import {Alert} from 'react-native';
import io from 'socket.io-client';
import {getRides, newRideNotif, rideAcceptNotif} from './src/actions/rides';
import {User} from './user';
import StoreConfig from './store';
import storeConfig from './store';
import endpoints from './src/constants/strings';
import AsyncStorage from '@react-native-async-storage/async-storage';
let user = null;

const setupSocket = (store) => {
  const socket = io.connect(endpoints.BASE_URL);
  //console.log('SOCKET', User);
  //socket.emit("join", user.rootUID, user.activeWorkspace);
  if (!window.location) {
    // App is running in simulator
    window.navigator.userAgent = 'ReactNative';
  }
  return socket;
};

export default setupSocket;
