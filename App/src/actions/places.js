export const GET_PLACES = 'GET_PLACES';
export const BOOKING_DETAILS = 'BOOKING_DETAILS';
export const SET_PLACE_EMPTY = 'SET_PLACE_EMPTY';
export const HIDE_PLACES = 'HIDE_PLACES';

export const getPlaces = (payload) => ({
  type: GET_PLACES,
  payload,
});

export const hidePlaces = () => ({
  type: HIDE_PLACES,
});

export const bookingReview = (payload) => ({
  type: BOOKING_DETAILS,
  payload,
});

export const setPlacesEmpty = () => ({
  type: SET_PLACE_EMPTY,
});
