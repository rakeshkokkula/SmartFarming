import {takeLatest, put, fork} from 'redux-saga/effects';
import {
  LOGIN_USER,
  LOGIN_DRIVER,
  REGISTER_DRIVER,
  REGISTER_USER,
  CONFIRM_DRIVER,
  CONFIRM_USER,
} from '../actions/auth';

import axios from 'axios';
const baseUrl = 'https://calm-chamber-53903.herokuapp.com';
axios.defaults.baseURL = baseUrl;
function* LoginUserFlow() {
  yield takeLatest(LOGIN_USER, userLogin);
}
function* LoginDriverFlow() {
  yield takeLatest(LOGIN_DRIVER, driverLogin);
}
function* RegisterUserFlow() {
  yield takeLatest(REGISTER_USER, registerUser);
}
function* RegisterDriverFlow() {
  yield takeLatest(REGISTER_DRIVER, registerDriver);
}

function* confirmDriverFlow() {
  yield takeLatest(CONFIRM_DRIVER, confirmDriver);
}
function* confirmUserFlow() {
  yield takeLatest(CONFIRM_USER, confirmUser);
}

function* userLogin({payload}) {
  try {
    const resp = yield axios.post(`${baseUrl}/user/login`, payload);
    console.log('Resp', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: LOGIN_USER + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    console.log('Error', err);

    yield put({
      type: LOGIN_USER + '_FAILURE',
    });
  }
}

function* driverLogin({payload}) {
  try {
    const resp = yield axios.post(`${baseUrl}/driver/login`, payload);
    console.log('Resp', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: LOGIN_DRIVER + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    console.log('ERR', err);
    yield put({
      type: LOGIN_DRIVER + '_FAILURE',
    });
  }
}

function* registerUser({payload}) {
  try {
    const resp = yield axios.post(`${baseUrl}/user/register`, payload);
    // console.log('Resp', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: REGISTER_USER + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    yield put({
      type: REGISTER_USER + '_FAILURE',
    });
  }
}

function* registerDriver({payload}) {
  try {
    const resp = yield axios.post(`${baseUrl}/driver/register`, payload);
    console.log('Resp', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: REGISTER_DRIVER + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    console.log('Error', err);
    yield put({
      type: REGISTER_DRIVER + '_FAILURE',
    });
  }
}
function* confirmDriver({payload}) {
  try {
    const resp = yield axios.get(
      `${baseUrl}/driver/confirmation?code=${payload.code}`,
    );
    // console.log('Resp', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: CONFIRM_DRIVER + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    yield put({
      type: CONFIRM_DRIVER + '_FAILURE',
    });
  }
}

function* confirmUser({payload}) {
  try {
    const resp = yield axios.get(
      `${baseUrl}/user/confirmation?code=${payload.code}`,
    );
    // console.log('Resp', resp.data);
    if (resp && resp.status === 200) {
      yield put({
        type: CONFIRM_USER + '_SUCCESS',
        data: resp.data,
      });
    }
  } catch (err) {
    yield put({
      type: CONFIRM_USER + '_FAILURE',
    });
  }
}

export default [
  fork(LoginDriverFlow),
  fork(LoginUserFlow),
  fork(RegisterDriverFlow),
  fork(RegisterUserFlow),
  fork(confirmDriverFlow),
  fork(confirmUserFlow),
];
