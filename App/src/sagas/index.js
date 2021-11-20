import {all} from 'redux-saga/effects';
import auth from './auth';
import directions from './directions';
import places from './places';
import rides from './rides';

function* saga() {
  yield all([...rides, ...places, ...auth, , ...directions]);
}

export default saga;
