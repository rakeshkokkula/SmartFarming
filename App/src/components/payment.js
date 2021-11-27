import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

const PaymentScreen = () => {
  return (
    <View>
      <Text>Payment</Text>
      <TouchableOpacity
        style={{backgroundColor: 'coral', padding: 10}}
        onPress={() => {
          var options = {
            description: 'Ride fare',
            image: 'https://i.imgur.com/3g7nmJC.png',
            currency: 'INR',
            key: 'rzp_test_JP95iq1QMQU6er', // Your api key
            amount: '5000',
            name: 'foo',
            prefill: {
              email: 'void@razorpay.com',
              contact: '9191919191',
              name: 'Razorpay Software',
            },
            theme: {color: '#F37254'},
          };
          RazorpayCheckout.open(options)
            .then((data) => {
              // handle success
              //   Alert.alert(`Success: ${data.razorpay_payment_id}`);
            })
            .catch((error) => {
              // handle failure
              console.log(error);
              //   Alert.alert(`Error: ${error.code} | ${error.description}`);
            });
        }}>
        <Text>Pay with Click</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({});
