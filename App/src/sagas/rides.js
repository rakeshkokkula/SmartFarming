import {
  takeLatest,
  put,
  fork,
  takeEvery,
  takeLeading,
} from 'redux-saga/effects';
import {
  GET_NEARBY_RIDES,
  TRACK_RIDE,
  RIDE_STATUS,
  GET_ROUTE,
  GET_RIDES,
  COMPLETE_RIDE,
  DECIDE_RIDE,
  CLOSE_RIDE,
  CREATE_RIDE,
  PAYMENT_RIDE,
} from '../actions/rides';
import endpoints from '../constants/strings';
import {ToastAndroid, Alert} from 'react-native';

import axios from 'axios';
// const baseUrl = 'https://calm-chamber-53903.herokuapp.com';
const baseUrl = endpoints.BASE_URL;
axios.defaults.baseURL = baseUrl;
//axios.defaults.timeout = 1000;
function* getAllNearByFlow() {
  yield takeLatest(GET_NEARBY_RIDES, getNearByRides);
}

function* postCreateRideFLow() {
  yield takeLeading(CREATE_RIDE, bookRide);
}

function* trackRideFlowFLOW() {
  yield takeLatest(TRACK_RIDE, trackRide);
}

function* rideStatusFlow() {
  yield takeLatest(RIDE_STATUS, rideStatus);
}
function* getRoutesFlow() {
  yield takeLatest(GET_ROUTE, getRoute);
}
function* getRidesFlow() {
  yield takeLatest(GET_RIDES, getRides);
}

function* completeRideFlow() {
  yield takeLatest(COMPLETE_RIDE, completeRide);
}

function* decideRideFlow() {
  yield takeLatest(DECIDE_RIDE, decideRide);
}

function* closeRideFLow() {
  yield takeLatest(CLOSE_RIDE, closeRide);
}

function* paymentRideFLow() {
  yield takeLatest(PAYMENT_RIDE, paymentRide);
}

function* getNearByRides({payload}) {
  try {
    const resp = yield axios.get(
      `${baseUrl}/ride/getNearby?lat=${payload.lat}&long=${payload.long}`,
    );
    console.log('Resp', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: GET_NEARBY_RIDES + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    console.log('err', payload, err);
    yield put({
      type: GET_NEARBY_RIDES + '_FAILURE',
    });
  }
}

function* bookRide({payload}) {
  try {
    console.log('Resp-->', payload);

    const resp = yield axios.post(`${baseUrl}/ride/book`, payload);
    //resp = yield axios.post(`${baseUrl}/ride/create`, payload);

    console.log('Respppppp', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: CREATE_RIDE + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    console.log('error', err);
    ToastAndroid.show('Pickup is out of Hyderabad', ToastAndroid.SHORT);
    yield put({
      type: CREATE_RIDE + '_FAILURE',
    });
  }
}

function* trackRide({payload}) {
  try {
    console.log('TRACK', payload);
    const resp = yield axios.get(
      `${baseUrl}/ride/track?userId=${payload.userId}`,
    );
    //Alert.alert('success');
    console.log('Resp TRACK', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: TRACK_RIDE + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    //console.log('RIDE TRACK ERROR', err);
    yield put({
      type: TRACK_RIDE + '_FAILURE',
    });
  }
}

function* getRoute({payload}) {
  try {
    //console.log(payload.locations, 'location');
    const resp = yield axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${payload.locations}?geometries=polyline6&access_token=pk.eyJ1IjoicmVoYW5tb2hpdWRkaW4iLCJhIjoiY2trZnB4cW5lMDZxNzJ2cDFnMW1zY3I3OCJ9.v2_CIYKDH18UeCNkRxui0A`,
    );
    ////console.log('Resp MY RIde', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: GET_ROUTE + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    yield put({
      type: GET_ROUTE + '_FAILURE',
    });
  }
}

function* rideStatus({payload}) {
  try {
    const resp = yield axios.get(
      `${baseUrl}/ride/status?userId=${payload.userId}`,
    );
    ////console.log('Resp MY RIde', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: RIDE_STATUS + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    yield put({
      type: RIDE_STATUS + '_FAILURE',
    });
  }
}

function* getRides({payload}) {
  try {
    console.log('PAYLOAD', payload);
    const resp = yield axios.get(
      `${baseUrl}/ride/rides/driver?driverId=${payload.driverId}`,
    );
    console.log('Resp MY RIde Driver', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: GET_RIDES + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    ToastAndroid.show('No Rides', ToastAndroid.SHORT);
    console.log('ERRO DRIVER', err, payload);
    yield put({
      type: GET_RIDES + '_FAILURE',
    });
  }
}

function* completeRide({payload}) {
  try {
    const resp = yield axios.patch(`${baseUrl}/ride/completeRide`, payload);
    //console.log('Resp MY RIde Complete', resp.data);
    Alert.alert('Success');
    if (resp && resp.status === 200) {
      yield put({
        type: COMPLETE_RIDE + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    //console.log('ERRO DRIVER COmplete', err, payload);
    Alert.alert(err);
    yield put({
      type: COMPLETE_RIDE + '_FAILURE',
    });
  }
}

function* decideRide({payload}) {
  try {
    const resp = yield axios.patch(`${baseUrl}/ride/decideRide`, payload);
    //console.log('Resp decide -->', resp.data.customers);
    //Alert.alert('J');
    if (resp && resp.status === 200) {
      yield put({
        type: DECIDE_RIDE + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    //console.log('ERRO DRIVER', err, payload);
    yield put({
      type: DECIDE_RIDE + '_FAILURE',
    });
  }
}

function* closeRide({payload}) {
  try {
    console.log(payload);
    const resp = yield axios.patch(
      `${baseUrl}/ride/closeRide?driverId=${payload.driverId}`,
    );
    console.log('Resp decide -->', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: CLOSE_RIDE + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    //console.log('ERRO DRIVER', err, payload);
    yield put({
      type: CLOSE_RIDE + '_FAILURE',
    });
  }
}

function* paymentRide({payload}) {
  try {
    console.log(payload);
    const resp = yield axios.patch(
      `${baseUrl}/ride/paymentRide?userId=${payload.userId}&rideId=${payload.rideId}&paymentId=${payload.paymentId}`,
    );
    console.log('Resp payment -->', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: PAYMENT_RIDE + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    //console.log('ERRO DRIVER', err, payload);
    yield put({
      type: PAYMENT_RIDE + '_FAILURE',
    });
  }
}

export default [
  fork(getAllNearByFlow),
  fork(postCreateRideFLow),
  fork(trackRideFlowFLOW),
  fork(rideStatusFlow),
  fork(getRoutesFlow),
  fork(getRidesFlow),
  fork(completeRideFlow),
  fork(decideRideFlow),
  fork(closeRideFLow),
  fork(paymentRideFLow),
];
