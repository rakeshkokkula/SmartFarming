import {GET_DIRECTIONS, HIDE_RIDE_DETAILS} from '../actions/directions';

const initialState = {
  directions: {},
  error: '',
  showRideDetails: false,
};

const directions = (state = initialState, action) => {
  let {type, data, payload} = action;
  switch (type) {
    case `${GET_DIRECTIONS}_SUCCESS`:
      return {
        ...state,
        directions: data,
        showRideDetails: true,
      };
    case `${GET_DIRECTIONS}_FAILURE`:
      return {
        ...state,
        error: 'Error',
      };

    case HIDE_RIDE_DETAILS:
      return {
        ...state,
        showRideDetails: false,
      };

    default:
      return {
        ...state,
      };
  }
};

export default directions;
