export const LOGIN_USER = 'LOGIN_USER';
export const REGISTER_USER = 'REGISTER_USER';
export const LOGIN_DRIVER = 'LOGIN_DRIVER';
export const REGISTER_DRIVER = 'REGISTER_DRIVER';
export const CONFIRM_USER = 'CONFIRM_USER';
export const CONFIRM_DRIVER = 'CONFIRM_DRIVER';
export const SET_USER = 'SET_USER';
export const CONFIRMED = 'CONFIRMED';

export const userLogin = (payload) => ({
  type: LOGIN_USER,
  payload,
});

export const userRegister = (payload) => ({
  type: REGISTER_USER,
  payload,
});

export const driverLogin = (payload) => ({
  type: LOGIN_DRIVER,
  payload,
});

export const driverRegister = (payload) => ({
  type: REGISTER_DRIVER,
  payload,
});

export const confirmUser = (payload) => ({
  type: CONFIRM_USER,
  payload,
});

export const confirmDriver = (payload) => ({
  type: CONFIRM_DRIVER,
  payload,
});

export const setUser = (payload) => ({
  type: SET_USER,
  payload,
});

export const isConfirmed = () => ({
  type: CONFIRMED,
});
