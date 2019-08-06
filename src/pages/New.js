import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import api from '../services/api';

export default class New extends Component {
    static navigationOptions = {
        headerTitle: 'Nova publicação',
    };
}