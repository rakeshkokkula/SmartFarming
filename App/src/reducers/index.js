import {combineReducers} from 'redux';
import directions from './directions';
import auth from './auth';
import places from './places';
import rides from './rides';

export default combineReducers({
  rides: rides,
  places: places,
  auth: auth,
  directions: directions,
});
