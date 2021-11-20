import {takeLatest, put, fork} from 'redux-saga/effects';
import {GET_DIRECTIONS} from '../actions/directions';

import axios from 'axios';
const baseUrl = 'https://api.mapbox.com';
axios.defaults.baseURL = baseUrl;

function* getDirectionsFlow() {
  yield takeLatest(GET_DIRECTIONS, getDirections);
}

function* getDirections({payload}) {
  try {
    console.log('DDD', payload);
    const resp = yield axios.get(
      `${baseUrl}/directions/v5/mapbox/driving/${payload.coordinates}?access_token=pk.eyJ1IjoicmVoYW5tb2hpdWRkaW4iLCJhIjoiY2trZnB4cW5lMDZxNzJ2cDFnMW1zY3I3OCJ9.v2_CIYKDH18UeCNkRxui0A`,
    );
    console.log('Resp DIRECTIONS', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: GET_DIRECTIONS + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    console.log('ERRORR', err);
    yield put({
      type: GET_DIRECTIONS + '_FAILURE',
    });
  }
}

export default [fork(getDirectionsFlow)];
