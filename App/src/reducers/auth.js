import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LOGIN_USER,
  LOGIN_DRIVER,
  REGISTER_DRIVER,
  REGISTER_USER,
  CONFIRM_DRIVER,
  CONFIRM_USER,
  SET_USER,
  CONFIRMED,
} from '../actions/auth';
const initialState = {
  user: {},
  error: '',
  isRegistered: null,
  isConfirmed: null,
  isLoggedin: null,
};

const auth = (state = initialState, action) => {
  let {type, data, payload} = action;
  switch (type) {
    case `${LOGIN_USER}_SUCCESS`:
      //AsyncStorage.setItem('user', JSON.stringify(data));
      return {
        ...state,
        isLoggedin: true,
      };
    case `${LOGIN_USER}_FAILURE`:
      return {
        ...state,
        error: 'Error',
      };
    case `${LOGIN_DRIVER}_SUCCESS`:
      //AsyncStorage.setItem('user', JSON.stringify(data));
      return {
        ...state,
        isLoggedin: true,
      };
    case `${LOGIN_DRIVER}_FAILURE`:
      return {
        ...state,
        error: 'Error',
      };
    case `${REGISTER_USER}_SUCCESS`:
      // AsyncStorage.setItem('user', JSON.stringify(data));
      return {
        ...state,
        isRegistered: true,
      };
    case `${REGISTER_USER}_FAILURE`:
      return {
        ...state,
        error: 'Error',
      };
    case CONFIRMED:
      return {
        ...state,
        isConfirmed: null,
        isRegistered: null,
        isLoggedIn: null,
      };
    case `${REGISTER_DRIVER}_SUCCESS`:
      //AsyncStorage.setItem('user', JSON.stringify(data));
      return {
        ...state,
        isRegistered: true,
      };
    case `${REGISTER_DRIVER}_FAILURE`:
      return {
        ...state,
        error: 'Error',
      };
    case `${CONFIRM_DRIVER}_SUCCESS`:
      //AsyncStorage.setItem('user', JSON.stringify(data));
      return {
        ...state,
        isConfirmed: true,
        user: data,
      };
    case `${CONFIRM_DRIVER}_FAILURE`:
      return {
        ...state,
        error: 'Error',
      };
    case `${CONFIRM_USER}_SUCCESS`:
      //AsyncStorage.setItem('user', JSON.stringify(data));
      return {
        ...state,
        isConfirmed: true,
        user: data,
      };
    case `${CONFIRM_USER}_FAILURE`:
      return {
        ...state,
        error: 'Error',
      };
    case SET_USER:
      return {
        ...state,
        user: payload.user,
      };

    default:
      return {
        ...state,
      };
  }
};

export default auth;
