import {takeLatest, put, fork, delay, cancel} from 'redux-saga/effects';
import {GET_PLACES} from '../actions/places';

import axios from 'axios';
const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
axios.defaults.baseURL = baseUrl;
function* getAllPlacesFlow() {
  yield takeLatest(GET_PLACES, getPlaces);
}

function* getPlaces({payload}) {
  try {
    yield delay(1000);
    const resp = yield axios.get(
      `${baseUrl}/${payload.query} hyderabad.json?proximity=78.4867,17.3850&access_token=pk.eyJ1IjoicmVoYW5tb2hpdWRkaW4iLCJhIjoiY2trZnB4cW5lMDZxNzJ2cDFnMW1zY3I3OCJ9.v2_CIYKDH18UeCNkRxui0A`,
    );

    if (resp && resp.status === 200) {
      yield put({
        type: GET_PLACES + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    yield put({
      type: GET_PLACES + '_FAILURE',
    });
  }
}

export default [fork(getAllPlacesFlow)];
