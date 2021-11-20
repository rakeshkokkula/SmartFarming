import {createStore, applyMiddleware, compose} from 'redux';
import createSagaMiddleware from 'redux-saga';
import setupSocket from './socket';
import reducers from './src/reducers';
import sagas from './src/sagas';

const storeConfig = () => {
  const sagaMiddleware = createSagaMiddleware();

  let middleware = applyMiddleware(sagaMiddleware);

  const store = createStore(reducers, middleware);
  console.log('STORE ==>', store);
  const socket = setupSocket(store);

  sagaMiddleware.run(sagas, socket);
  return store;
};

export default storeConfig;
