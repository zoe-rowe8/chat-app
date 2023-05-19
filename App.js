import React, { Component } from 'react';
// import style sheet
import { StyleSheet, Text, View } from "react-native";

// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import "react-native-gesture-handler";

// Create the navigator
const Stack = createNativeStackNavigator();

// import the screens
import Start from './components/Start';
import Chat from './components/Chat';

export default class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Start"
          screenOptions={{ headerTitleAlign: "center" }}
        >
          <Stack.Screen
            name="Start"
            component={Start}
            options={{ headerShown: false }} // Hide header
          />
          <Stack.Screen
            name="Chat"
            component={Chat}
            //Title of header
            options={({ route }) => ({ title: route.params.name })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
