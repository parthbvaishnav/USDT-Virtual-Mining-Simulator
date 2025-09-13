import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import MiningScreen from '../screens/MiningScreen/MiningScreen';
import RaferScreen from '../screens/RaferScreen/RaferScreen';
import RewardScreen from '../screens/Reward/RewardScreen';
import {horizontalScale, verticalScale} from '../constants/helper';
import {Images} from '../assets/images';
import {Colors} from '../constants/colors';

const Tab = createBottomTabNavigator();

const Bottom = ({state, descriptors, navigation}) => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.innerContainer}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <View
              key={index}
              style={[
                styles.mainItemContainer,
                // 👇 Rewards → Top Left Radius
                label === 'Rewards' && {
                  borderTopLeftRadius: verticalScale(25),
                },
                // 👇 Rafers → Top Right Radius
                label === 'Rafers' && {
                  borderTopRightRadius: verticalScale(25),
                },
                // 👇 MiningScreen → Full Circle
                label === 'MiningScreen' && {
                  marginTop: verticalScale(-50),
                  borderRadius: verticalScale(50),
                  width: verticalScale(100),
                  height: verticalScale(100),
                  backgroundColor: Colors.semiGray,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 0,
                },
              ]}>
              <Pressable
                onPress={onPress}
                style={[
                  styles.tabButton,
                  label === 'MiningScreen' && styles.centerTabButton,
                  isFocused &&
                    label !== 'MiningScreen' &&
                    styles.focusedTabButton,
                ]}>
                <View style={styles.tabContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      label === 'MiningScreen' && styles.centerIconContainer,
                      isFocused &&
                        label !== 'MiningScreen' &&
                        styles.focusedIconContainer,
                    ]}>
                    <Image
                      style={[
                        styles.tabIcon,
                        label === 'MiningScreen' && styles.centerTabIcon,
                        {
                          tintColor:
                            label === 'MiningScreen'
                              ? Colors.white
                              : isFocused
                              ? Colors.primaryColor
                              : Colors.grey_500,
                        },
                      ]}
                      source={
                        label === 'Rewards'
                          ? isFocused
                            ? Images.filledrewardsIcon
                            : Images.filledrewardsIcon
                          : label === 'Rafers'
                          ? Images.raferIcon
                          : Images.pickaxeIcon
                      }
                    />
                  </View>
                  {label !== 'MiningScreen' && (
                    <Text
                      style={[
                        styles.tabLabel,
                        isFocused && styles.focusedTabLabel,
                      ]}>
                      {label}
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function BottomTab() {
  return (
    <Tab.Navigator
      initialRouteName={'MiningScreen'}
      screenOptions={{headerShown: false}}
      tabBar={props => <Bottom {...props} />}>
      <Tab.Screen name="Rewards" component={HomeScreen} />
      <Tab.Screen name="MiningScreen" component={MiningScreen} />
      <Tab.Screen name="Rafers" component={RaferScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -10,
    backgroundColor: Colors.semiGray,
    borderTopRightRadius: verticalScale(25),
    borderTopLeftRadius: verticalScale(25),
    height: verticalScale(100),
    width: '100%',
    paddingHorizontal: horizontalScale(10),
    paddingBottom: verticalScale(5),
  },
  innerContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopRightRadius: verticalScale(25),
    borderTopLeftRadius: verticalScale(25),
    height: verticalScale(85),
    alignSelf: 'flex-end',
  },
  mainItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(12),
    borderRadius: verticalScale(15),
    minWidth: horizontalScale(50),
  },
  centerTabButton: {
    backgroundColor: Colors.primaryColor,
    borderRadius: verticalScale(50),
    height: verticalScale(85),
    width: verticalScale(85),
    elevation: 10,
    shadowColor: Colors.primaryColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  focusedTabButton: {},
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(2),
  },
  centerIconContainer: {
    marginBottom: 0,
  },
  focusedIconContainer: {
    transform: [{scale: 1.1}],
  },
  tabIcon: {
    height: verticalScale(22),
    width: verticalScale(22),
    resizeMode: 'contain',
  },
  centerTabIcon: {
    height: verticalScale(35),
    width: verticalScale(35),
  },
  tabLabel: {
    fontSize: verticalScale(11),
    fontWeight: '500',
    color: Colors.grey_500,
    marginTop: verticalScale(2),
    textAlign: 'center',
  },
  focusedTabLabel: {
    color: Colors.primaryColor,
    fontWeight: '600',
  },
});
