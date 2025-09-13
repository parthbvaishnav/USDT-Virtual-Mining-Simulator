import React, {useState} from 'react';
import {Modal, StyleSheet, Text, Pressable, View, Image} from 'react-native';
import {verticalScale} from '../constants/helper';
import {Colors} from '../constants/colors';
import {Images} from '../assets/images';

const Popup = ({
  visible,
  onClose,
  btnText,
  image,
  text1,
  text2,
  text3,
  onPress,
}) => {
  return (
    // <View style={[styles.centeredView, {display: visible ? 'flex' : 'none'}]}>
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Image style={styles.popupImage} source={image} />
          {/* <Pressable onPress={onClose} style={styles.closeContainer}>
            <Image style={styles.closeImage} source={Images.closeIcon} />
          </Pressable> */}
          <Text style={[styles.modalText, styles.text1]}>{text1} 🎁</Text>
          <Text style={[styles.modalText, styles.text2]}>{text2}</Text>
          <Text style={[styles.modalText, styles.text3]}>{text3}</Text>
          <Pressable style={[styles.button]} onPress={onPress}>
            <Text style={styles.textStyle}>{btnText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    // </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: verticalScale(300),
    width: '80%',
  },
  button: {
    height: verticalScale(45),
    width: '100%',
    borderRadius: verticalScale(10),
    backgroundColor: Colors.secondaryColor,
    justifyContent: 'center',
    position: 'absolute',
    bottom: verticalScale(20),
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  popupImage: {
    zIndex: 1111,
    top: verticalScale(-90),
    height: verticalScale(150),
    width: verticalScale(150),
    resizeMode: 'contain',
    position: 'absolute',
  },
  closeContainer: {
    position: 'absolute',
    top: verticalScale(-10),
    right: verticalScale(-10),
    height: verticalScale(25),
    width: verticalScale(25),
    borderRadius: verticalScale(15),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grey_500,
  },
  closeImage: {
    height: verticalScale(12),
    width: verticalScale(12),
    resizeMode: 'contain',
  },
  text1: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: verticalScale(20),
    marginTop: verticalScale(20),
    textDecorationLine: 'underline',
  },
  text2: {
    color: Colors.grey_500,
    fontWeight: '500',
    fontSize: verticalScale(14),
    marginTop: verticalScale(5),
  },
  text3: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: verticalScale(18),
    marginTop: verticalScale(10),
    color: Colors.secondaryColor,
  },
});

export default Popup;
