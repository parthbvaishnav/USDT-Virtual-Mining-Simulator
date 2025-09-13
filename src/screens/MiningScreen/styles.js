import {StyleSheet} from 'react-native';
import {Colors} from '../../constants/colors';
import {verticalScale} from '../../constants/helper';

export const styles = StyleSheet.create({
  mainBox: {
    flex: 1,
    backgroundColor: Colors.semiGray,
    marginBottom: verticalScale(30),
  },
});
