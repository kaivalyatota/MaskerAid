import 'react-native-gesture-handler';
import React, {Component} from 'react';
import MaskerAid from './src/MaskerAid.js';
import {AuthProvider} from './src/navigation/AuthProvider';

export default class App extends Component {
  render() {
    return (
        <AuthProvider>
            <MaskerAid />
        </AuthProvider>
    );
  }
}
