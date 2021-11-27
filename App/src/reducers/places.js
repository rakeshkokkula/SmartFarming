import {
  GET_PLACES,
  BOOKING_DETAILS,
  SET_PLACE_EMPTY,
  HIDE_PLACES,
} from '../actions/places';

const initialState = {
  places: [],
  error: '',
  bookingDetails: {
    name: null,
    location: null,
  },
  showPlaces: false,
};

const places = (state = initialState, action) => {
  let {type, data, payload} = action;
  switch (type) {
    case `${GET_PLACES}_SUCCESS`:
      //console.log('YAYYYY', data);
      return {
        ...state,
        places: data.features,
        showPlaces: true,
      };
    case `${GET_PLACES}_FAILURE`:
      return {
        ...state,
        error: 'Error',
      };
    case BOOKING_DETAILS:
      return {
        ...state,
        bookingDetails: {
          name: payload.name,
          location: payload.location,
        },
        places: [],
        showPlaces: false,
      };
    case SET_PLACE_EMPTY:
      //console.log('Empty');
      return {
        ...state,
        places: [],
      };
    case HIDE_PLACES:
      return {
        ...state,
        bookingDetails: {
          name: null,
          location: [],
        },
      };
    default:
      return {
        ...state,
      };
  }
};

export default places;
