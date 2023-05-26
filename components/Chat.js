import React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo"; 

import { initializeApp } from 'firebase/app';

const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends React.Component {
  
  constructor() {
    super();
    this.state = {
      messages: [],
      user: {},
      isConnected: false,
    };

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfF0_PzEOxIRMWqVR_AuVPozK5-GABvok",
  authDomain: "chatapp-17ef3.firebaseapp.com",
  projectId: "chatapp-17ef3",
  storageBucket: "chatapp-17ef3.appspot.com",
  messagingSenderId: "244893236842",
  appId: "1:244893236842:web:ca01b36403b9d7a0db1413"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// set firestore reference messages
this.referenceChatMessages = firebase.firestore().collection("messages");
}
async saveMessages() {
try {
  await AsyncStorage.setItem(
    "messages",
    JSON.stringify(this.state.messages)
  );
} catch (error) {
  console.log(error.message);
}
}
async saveUser() {
try {
  await AsyncStorage.setItem("user", JSON.stringify(this.state.user));
} catch (error) {
  console.log(error.message);
}
}

async getMessages() {
let messages = "";
try {
  messages = (await AsyncStorage.getItem("messages")) || [];
  this.setState({
    messages: JSON.parse(messages),
  });
} catch (error) {
  console.log(error.message);
}
}

async getUser() {
let user = "";
try {
  user = (await AsyncStorage.getItem("user")) || [];
  this.setState({
    user: JSON.parse(user),
  });
} catch (error) {
  console.log(error.message);
}
}

async deleteMessages() {
try {
  await AsyncStorage.removeItem("messages");
  this.setState({
    messages: [],
  });
} catch (error) {
  console.log(error.message);
}
}

fetchMessagesOnline() {
this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    try {
      await firebase.auth().signInAnonymously();
      // Make sure to get the updated user object after signing in anonymously
      user = firebase.auth().currentUser;
    } catch (error) {
      console.log(error.message);
    }
  }
  if (user) {
    this.setState({
      messages: [],
      user: {
        _id: user.uid,
        name: this.props.route.params.name,
      },
      isConnected: true,
    });
    this.saveMessages();
    this.saveUser();
    this.unsubscribe = this.referenceChatMessages
      .orderBy("createdAt", "desc")
      .onSnapshot(this.onCollectionUpdate);
  } else {
    console.log("Unable to fetch user");
  }
});
}


async fetchMessagesOffline() {
await this.getMessages();
await this.getUser();
this.setState({ isConnected: false });
}

componentDidMount() {
let name = this.props.route.params.name;
this.props.navigation.setOptions({ title: name });
this.referenceChatMessages = firebase.firestore().collection("messages");

this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    this.fetchMessagesOnline();
  } else {
    this.fetchMessagesOffline();
  }
});
}


// unsuscribe
componentWillUnmount() {
if (this.state.isConnected) {
  this.unsubscribe();
  this.authUnsubscribe();
}
}

// change when different from snapshot
onCollectionUpdate = (querySnapshot) => {
if (!this.state.isConnected) return;
const messages = [];
// go through each document
querySnapshot.forEach((doc) => {
  // get the QueryDocumentSnapshot's data
  let data = doc.data();
  messages.push({
    _id: data._id,
    text: data.text,
    createdAt: data.createdAt.toDate(),
    user: {
      _id: data.user._id,
      name: data.user.name,
    },
  });
});
this.setState({ messages });
this.saveMessages();
this.saveUser();
};

// add message to firestore
addMessage = (message) => {
this.referenceChatMessages.add({
  _id: message[0]._id,
  createdAt: message[0].createdAt,
  text: message[0].text || "",
  user: {
    _id: this.state.user._id,
    name: this.props.route.params.name,
  },
});
};

// send message => append to messages array
onSend(messages = []) {
this.setState(
  (previousState) => ({
    messages: GiftedChat.append(previousState.messages, messages),
  }),
  () => {
    this.addMessage(messages);

    this.saveMessages();
    this.saveUser();
  }
);
}

renderInputToolbar(props) {
if (this.state.isConnected) {
  return <InputToolbar {...props} />;
} else {
  return null;
}
}

renderBubble(props) {
return (
  <Bubble
    {...props}
    textStyle={{
      right: {
        color: "black",
      },
    }}
    wrapperStyle={{
      left: {
        backgroundColor: "#e3e3e3",
      },
      right: {
        backgroundColor: "#fff",
      },
    }}
  />
);
}

render() {
return (
  <View
    style={[
      styles.container,
      { backgroundColor: this.props.route.params.color },
    ]}
  >
    <GiftedChat
      renderBubble={this.renderBubble.bind(this)}
      renderInputToolbar={this.renderInputToolbar.bind(this)}
      messages={this.state.messages}
      onSend={(messages) => this.onSend(messages)}
      user={{
        _id: this.state.user._id,
      }}
    />
    {Platform.OS === "android" && (
      <KeyboardAvoidingView behavior="height" />
    )}
  </View>
);
}
}

const styles = StyleSheet.create({
container: {
flex: 1,
flexDirection: "column",
},
});