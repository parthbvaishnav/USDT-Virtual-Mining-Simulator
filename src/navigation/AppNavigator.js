import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnBordingScreen from '../screens/OnBoarding/OnBordingScreen';
import SplashScreen from '../screens/Splash/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import BottomTab from './BottomTab';
import HelpScreen from '../screens/Help/HelpScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ConvertCoinScreen from '../screens/ConvertCoin/ConvertCoinScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import RaferScreen from '../screens/RaferScreen/RaferScreen';
import {useAuth} from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{headerShown: false}}
        initialRouteName="SplashScreen"
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="OnBoardingScreen" component={OnBordingScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="BottomTab" component={BottomTab} />
        <Stack.Screen name="HelpScreen" component={HelpScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="ConvertCoinScreen" component={ConvertCoinScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="RaferScreen" component={RaferScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
