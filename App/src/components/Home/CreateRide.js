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
import {NavigationActions, StackActions} from 'react-navigation';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Geolocation from '@react-native-community/geolocation';
import {Card, ListItem, Icon} from 'react-native-elements';
import {getNearByAction} from '../../actions/rides';
import {getDirections} from '../../actions/directions';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import vehicle from '../../assets/vehicle.png';
import {bookRide, rideStatus, trackRide, getRides} from '../../actions/rides';

const styles = StyleSheet.create({
  cardBody: {
    width: '100%',
    height: '30%',
    backgroundColor: '#fff',
    padding: 30,
  },
});
class CreateRide extends Component {
  state = {
    weight: null,
    bookingDetails: {
      name: '',
      location: null,
      weight: null,
    },
  };
  componentDidMount() {
    //console.log('MY LOCATION', this.props.directions);
    // this.props.getDirections({
    //   coordinates: `${this.props.bookingDetails.location[0]},${this.props.bookingDetails.location[1]};${this.props.myLocation[0]},${this.props.myLocation[1]}`,
    // });
  }
  render() {
    const {bookingDetails, myLocation, user} = this.props;

    return (
      <View style={styles.cardBody}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 20}}>Capacity</Text>
          <TextInput
            style={{fontSize: 20, textAlign: 'right'}}
            placeholder="Weight"
            keyboardType="number-pad"
            onChangeText={(text) => this.setState({weight: text})}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 20, fontWeight: '900'}}>Kms</Text>
          <Text style={{fontSize: 20}}>
            {this.props.directions?.routes?.length > 0
              ? parseFloat(
                  this.props.directions?.routes[0]?.distance / 1000,
                ).toFixed(2)
              : 0}
          </Text>
        </View>

        <View style={{marginTop: 20, paddingLeft: 30, paddingRight: 30}}>
          <Button
            color="#333"
            title="Book"
            onPress={() => {
              this.props.getNearByAction({
                lat: this.props.myLocation[1],
                long: this.props.myLocation[0],
              });
              this.props?.cabs
                ? this.props.bookRide({
                    drop_lat: this.props.directions?.waypoints[0].location[1],
                    drop_lng: this.props.directions?.waypoints[0].location[0],
                    pickup_lat: this.props.myLocation[1],
                    pickup_lng: this.props.myLocation[0],
                    userId: this.props.user?._id,
                    category: 'share',
                    weight: this.state.weight,
                    kms: `${parseFloat(
                      this.props.directions?.routes[0]?.distance / 1000,
                    ).toFixed(2)}`,
                    payment_type: 'online',
                    driverLoc: this.props.driverLoc,
                  })
                : Alert.alert('Info', 'No Cabs');
            }}
          />
        </View>
        <Text style={{textAlign: 'center', margin: 25, fontWeight: 'bold'}}>
          JAI JAWAN JAI KISAAN
        </Text>
      </View>
    );
  }
}

const mapStateToProps = ({rides, directions}) => {
  return {
    directions: directions.directions,
    cabs: rides.cabs.nearestPoints,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, {
  bookRide,
  getDirections,
  getNearByAction,
})(CreateRide);
