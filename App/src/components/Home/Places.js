import React, {Component} from 'react';
import {Text} from 'react-native';
import {View} from 'react-native';
import {connect} from 'react-redux';
import {bookingReview} from '../../actions/places';
import {getDirections} from '../../actions/directions';
import {getNearByAction} from '../../actions/rides';
import {TouchableWithoutFeedback} from 'react-native';
import {Keyboard} from 'react-native';

class Places extends Component {
  render() {
    return (
      <View>
        {this.props.places?.length > 0 && (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                height: '48%',
                backgroundColor: '#fff',
                marginTop: 0,
                margin: 25,
              }}>
              {this.props.places?.map((place) => {
                return (
                  <Text
                    key={place.id}
                    onPress={() => {
                      //console.log('CLICKED');
                      this.props.getNearByAction({
                        lat: this.props.myLocation[1],
                        long: this.props.myLocation[0],
                      });
                      this.props.getDirections({
                        coordinates: `${place.geometry.coordinates[0]},${place.geometry.coordinates[1]};${this.props.myLocation[0]},${this.props.myLocation[1]}`,
                      });
                      this.props.bookingReview({
                        name: place.place_name,
                        location: place.geometry.coordinates,
                      });
                    }}
                    style={{
                      padding: 10,
                      borderBottomColor: '#333',
                      borderBottomWidth: 0.5,
                      backgroundColor: '#fff',
                    }}>
                    {place.place_name}
                  </Text>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  }
}

const mapStateToProps = ({places}) => ({
  places: places.places,
});

export default connect(mapStateToProps, {
  bookingReview,
  getDirections,
  getNearByAction,
})(Places);
