import axios from 'axios';
import {Alert} from 'react-native';
import {
  RIDE_STATUS,
  GET_NEARBY_RIDES,
  TRACK_RIDE,
  GET_ROUTE,
  GET_RIDES,
  COMPLETE_RIDE,
  DECIDE_RIDE,
  CLOSE_RIDE,
  RIDE_ACCEPTED_NOTIF,
  NEW_RIDE_NOTIF,
  CREATE_RIDE,
  PAYMENT_RIDE,
} from '../actions/rides';

const initialState = {
  cabs: [],
  error: '',
  route: null,
  isRideCreated: null,
  myRide: null,
  onGoingRide: null,
  driverRides: null,
  getRoute: null,
};

const rides = (state = initialState, action) => {
  let {type, data, payload} = action;
  switch (type) {
    case `${GET_NEARBY_RIDES}_SUCCESS`:
      return {
        ...state,
        cabs: data,
      };
    case `${GET_NEARBY_RIDES}_FAILURE`:
      return {
        ...state,
        error: 'Error',
      };
    case CREATE_RIDE:
      //console.log('hmm');
      return {
        ...state,
      };

    case `${CREATE_RIDE}_SUCCESS`:
      //console.log('CREATE RIDE');
      Alert.alert('Booking Request Success');
      return {
        ...state,
        isRideCreated: true,
        bookingDetails: {
          name: '',
          location: '',
        },
      };
    case `${CREATE_RIDE}_FAILURE`:
      //console.log('CREATE RIDE FAIL');

      return {
        ...state,
        error: 'Error creating ride',
      };
    case `${RIDE_STATUS}_SUCCESS`:
      return {
        ...state,
        myRide: data,
      };
    case `${RIDE_STATUS}_FAILURE`:
      return {
        ...state,
        error: 'Error getting ride',
      };
    case `${TRACK_RIDE}_SUCCESS`:
      return {
        ...state,
        myRide: data,
      };
    case `${TRACK_RIDE}_FAILURE`:
      return {
        ...state,
        error: 'Error getting ride',
      };
    case `${GET_ROUTE}_SUCCESS`:
      return {
        ...state,
        route: data,
        getRoute: false,
      };
    case `${GET_ROUTE}_FAILURE`:
      return {
        ...state,
        error: 'Error getting route',
      };
    case `${GET_RIDES}_SUCCESS`:
      return {
        ...state,
        myRide: data,
      };
    case `${GET_RIDES}_FAILURE`:
      return {
        ...state,
        driverRides: null,
        error: 'Error getting rides',
      };
    case `${COMPLETE_RIDE}_SUCCESS`:
      return {
        ...state,
        myRide: null,
        //previously myRide: data
      };
    case `${COMPLETE_RIDE}_FAILURE`:
      return {
        ...state,
        error: 'Error getting rides',
      };
    case `${PAYMENT_RIDE}_SUCCESS`:
      return {
        ...state,
        myRide: data,
      };
    case `${PAYMENT_RIDE}_FAILURE`:
      return {
        ...state,
        error: 'Error payment for rides',
      };
    case `${DECIDE_RIDE}_SUCCESS`:
      //console.log('DRIVER RIDE', data);
      return {
        ...state,
        myRide: data,
        getRoute: true,
      };
    case `${DECIDE_RIDE}_FAILURE`:
      return {
        ...state,
        error: 'Error getting rides',
      };
    case `${CLOSE_RIDE}_SUCCESS`:
      return {
        ...state,
        myRide: null,
      };

    case RIDE_ACCEPTED_NOTIF:
      let ride = {...state.myRide, ...payload.ride};
      return {
        ...state,
        myRide: ride,
      };
    case NEW_RIDE_NOTIF:
      console.log('YAYYYYY----', payload);
      return {
        ...state,
        myRide: {...payload.ride},
      };
    case `${CLOSE_RIDE}_FAILURE`:
      return {
        ...state,
        error: 'Error closing ride',
      };

    default:
      return {
        ...state,
      };
  }
};

export default rides;
