export const GET_NEARBY_RIDES = 'GET_NEARBY_RIDES';
export const CREATE_RIDE = 'CREATE_RIDE';
export const TRACK_RIDE = 'TRACK_RIDE';
export const RIDE_STATUS = 'RIDE_STATUS';
export const GET_ROUTE = 'GET_ROUTE';
export const GET_RIDES = 'GET_RIDES';
export const COMPLETE_RIDE = 'COMPLETE_RIDE';
export const DECIDE_RIDE = 'DECIDE_RIDE';
export const CLOSE_RIDE = 'CLOSE_RIDE';
export const NEW_RIDE_NOTIF = 'NEW_RIDE_NOTIF';
export const RIDE_ACCEPTED_NOTIF = 'RIDE_ACCEPTED_NOTIF';

export const getNearByAction = (payload) => ({
  type: GET_NEARBY_RIDES,
  payload,
});

export const bookRide = (payload) => ({
  type: CREATE_RIDE,
  payload,
});

export const trackRide = (payload) => ({
  type: TRACK_RIDE,
  payload,
});

export const rideStatus = (payload) => ({
  type: RIDE_STATUS,
  payload,
});

export const getRoute = (payload) => ({
  type: GET_ROUTE,
  payload,
});

export const getRides = (payload) => ({
  type: GET_RIDES,
  payload,
});

export const completeRide = (payload) => ({
  type: COMPLETE_RIDE,
  payload,
});

export const decideRide = (payload) => ({
  type: DECIDE_RIDE,
  payload,
});

export const closeRide = (payload) => ({
  type: CLOSE_RIDE,
  payload,
});

export const newRideNotif = (payload) => ({
  type: NEW_RIDE_NOTIF,
  payload,
});

export const rideAcceptNotif = (payload) => ({
  type: RIDE_ACCEPTED_NOTIF,
  payload,
});
