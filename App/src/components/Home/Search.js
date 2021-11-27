import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
  Modal,
  Button,
} from 'react-native';
import {DrawerItems, SafeAreaView} from 'react-navigation';

import {connect} from 'react-redux';
import {bookingReview} from '../../actions/rides';
import {getPlaces, setPlacesEmpty} from '../../actions/places';
import directions from '../../sagas/directions';
const styles = StyleSheet.create({
  searchBar: {
    height: 50,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#cdcdcd',
    opacity: 0.8,
    borderColor: '#fff',
    textAlign: 'left',
    padding: 15,
    color: '#000',
    borderRadius: 8,
    marginTop: 20,
    fontWeight: 'bold',
    zIndex: 1,
  },
  bookingCard: {
    zIndex: 2,
    height: 300,
    backgroundColor: 'transparent',
    borderRadius: 120,
    width: 300,
  },
});
class Search extends Component {
  state = {
    location: [17.385044, 78.486671],
    query: '',
    search: null,
    book: true,
    bookingDetails: {
      name: '',
      location: null,
    },
    route: null,
    weight: null,
    user: null,
    showStatus: null,
    showModal: null,
    places: null,
    count: 1,
  };
  handleText = (text) => {
    //console.log(text.length);
    if (text.length === 0) {
      this.props.setPlacesEmpty();
    } else {
      this.props.getPlaces({
        query: text,
      });
    }
  };
  render() {
    return (
      <View
        style={{
          bottom: 0,
          top:
            this.props.showPlaces || this.props.bookingDetails.name?.length > 0
              ? 0
              : null,
          width: '100%',
          alignItems: 'center',
          borderRadius: 0,
          backgroundColor: '#fff',
          zIndex: 10000,
          padding: 0,
          margin: 0,
          height: '14%',
        }}>
        <TextInput
          onFocus={() => this.setState({search: true})}
          style={[styles.searchBar, {top: this.state.search && 0}]}
          onChangeText={(text) => this.handleText(text)}
          placeholderTextColor="#000"
          placeholder="Where to ?"
          onSubmitEditing={Keyboard.dismiss}
          defaultValue={this.state.query}
        />
      </View>
    );
  }
}

const mapStateToProps = ({places}) => {
  return {
    bookingDetails: places.bookingDetails,
    showPlaces: places.showPlaces,
    showRideDetails: directions.showRideDetails,
  };
};

export default connect(mapStateToProps, {
  getPlaces,
  setPlacesEmpty,
})(Search);
