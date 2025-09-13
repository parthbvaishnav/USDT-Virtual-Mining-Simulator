import React from 'react';
import {View, StatusBar, StyleSheet} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomStatusBar = ({backgroundColor, dark, ...props}) => {
  const insets = useSafeAreaInsets();
  const styles = makestyles(backgroundColor, insets);
  return (
    <>
      <View style={styles.container}>
        <StatusBar
          animated
          barStyle={dark ? 'dark-content' : 'light-content'}
          backgroundColor={backgroundColor}
          {...props}
        />
      </View>
    </>
  );
};
const makestyles = (backgroundColor, insets) =>
  StyleSheet.create({
    container: {backgroundColor: backgroundColor, paddingTop: insets.top},
  });

export default CustomStatusBar;