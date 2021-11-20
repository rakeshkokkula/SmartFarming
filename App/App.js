/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';
import {Provider} from 'react-redux';
import storeConfig from './store';
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './src/components/Home/Home';
import BookRide from './src/components/Home/BookRide';
import register from './src/components/register';
import login from './src/components/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackRide from './src/components/Home/TrackRide';
import setupSocket from './socket';
import CreateRide from './src/components/Home/CreateRide';
import {createDrawerNavigator} from '@react-navigation/drawer';
import NavigationMenu from './src/components/Home/NavigationMenu';

const store = storeConfig();
const Stack = createStackNavigator();
const RootStack = createStackNavigator();
const Drawer = createDrawerNavigator();

const App = (props) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const isLoggedIn = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      console.log('userr', user);
      if (user !== null) {
        setUser(JSON.parse(user));
      }
    } catch (e) {
      setUser(null);
    }
    setLoading(false);
  };
  const socket = setupSocket();
  useEffect(() => {
    console.log('HMM', props);
    isLoggedIn();
  }, []);
  console.log('token', user.token);
  socket.emit('join', user?.user?._id);
  const DrawerStack = () => {
    return (
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => {
          //console.log('LLK', props);
          return (
            <NavigationMenu
              role={user.role}
              navigation={props.navigation}
              user={user}
            />
          );
        }}
        drawerContentOptions={{
          activeTintColor: '#333',
          itemStyle: {marginVertical: 5, marginTop: 15},
        }}>
        <Drawer.Screen
          name="Home"
          options={{drawerLabel: 'Home', swipeEnabled: true}}
          component={Home}
        />
        <Drawer.Screen
          name="Book"
          options={{drawerLabel: 'My Ride'}}
          component={BookRide}
        />
        <Drawer.Screen
          name="Track"
          options={{drawerLabel: 'Rides'}}
          component={TrackRide}
        />
      </Drawer.Navigator>
    );
  };
  const AuthStack = () => {
    return (
      <Stack.Navigator
        initialRouteName="register"
        screenOptions={{
          animationEnabled: false,
        }}
        headerMode="none">
        <Stack.Screen name="login" component={login} />
        <Stack.Screen name="register" component={register} />
      </Stack.Navigator>
    );
  };
  const LoadingScreen = () => {
    return (
      <View>
        <Text>Loading....</Text>
      </View>
    );
  };
  return (
    <Provider store={store}>
      <StatusBar barStyle="light-content" />

      {loading ? (
        LoadingScreen()
      ) : (
        <NavigationContainer>
          <RootStack.Navigator
            initialRouteName={user.token === undefined ? 'Auth' : 'App'}>
            <RootStack.Screen name="Auth" component={AuthStack} />
            <RootStack.Screen
              options={{headerShown: false}}
              name="App"
              component={DrawerStack}
            />
          </RootStack.Navigator>
        </NavigationContainer>
      )}
    </Provider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
