export const GET_DIRECTIONS = 'GET_DIRECTIONS';
export const HIDE_RIDE_DETAILS = 'HIDE_RIDE_DETAILS';

export const getDirections = (payload) => ({
  type: GET_DIRECTIONS,
  payload,
});
export const hideRideDetails = () => ({
  type: HIDE_RIDE_DETAILS,
});
