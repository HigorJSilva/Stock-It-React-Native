import React from 'react';
import {createAppContainer, createStackNavigator} from 'react-navigation';
import {  Text } from 'react-native';

import Feed from './pages/Feed';

export default createAppContainer(
    createStackNavigator({
        Feed, 
    },{
        defaultNavigationOptions:{
            headerTintColor: '#000',
            headerTitle: 'Stock-It',
            headerBackTitle: null,
        },
        mode: 'modal'
    })
);