import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  FlatList
} from "react-native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";
// import Firestore
import { initializeApp } from "firebase/app";

// Google firebase / firestore
const firebase = require('firebase');
require('firebase/firestore');

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
if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: undefined,
      user: {
        _id: '',
        avatar: '',
        name: '',
      },
      loggedInText: 'Please standby...',
      image: null,
      location: null,
      isConnected: false,
    };
  }

  componentDidMount() {
    this.referenceChatMessages = firebase.firestore().collection("messages");
    this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate);

    this.authUnsubscribe = firebase.auth().onAuthStateChanged(
      user => {
        if (!user) { firebase.auth().signInAnonymously(); }
        this.setState({
          uid: user.uid,
          messages: [],
          user: {
            _id: user.uid,
            avatar: user.avatar,
            name: this.props.route.params.name,
          },
          loggedInText: '',
        });

        this.unsubscribe = this.referenceChatMessages
          .orderBy('createdAt', 'desc')
          .onSnapshot(this.onCollectionUpdate);
      }
    );
  }

  // "unsubscribe" is to stop listening for changes from Firestore
  componentWillUnmount() {
    if(this.referenceChatMessages) {
      this.unsubscribe();
      this.authUnsubscribe();
    }
  }

  onCollectionUpdate = (querySnapshot) => {
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
          avatar: data.user.avatar || '',
          name: data.user.name,
        }
      });
    });

    this.setState({ messages });
  };

  // add one message to firestore
  addMessage = () => {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      createdAt: message.createdAt,
      image: message.image || null,
      location: message.location || null,
      text: message.text || '',
      uid: this.state.uid,
      user: message.user,
    });
  };

  onSend(messages = []) {
    // this.state.messages[] is previousState.messages PLUS the message passed to onSend()
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        // callback: after saving state, add message
        this.addMessage(messages);
      }
    );
  }

  renderBubble(props) {
    // set the chat bubble colors
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: '#000' }
        }}
      />
    )
  }

  render() {
    // chat screen background color and top title is set to the bgColor and name passed from Start.js
    let bgColor = this.props.route.params.bgColor;
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: this.state.user._id,
            avatar: 'https://placeimg.com/140/140/any',
            name: name
          }}
        />
        { Platform.OS === 'android' ?
          // IF Platform OS is android, fixes buggy keyboard viewing
          <KeyboardAvoidingView behavior="height" /> :
          null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  p20: { padding: 20 }
});