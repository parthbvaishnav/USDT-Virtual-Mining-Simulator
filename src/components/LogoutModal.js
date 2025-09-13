import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import {verticalScale, horizontalScale} from '../constants/helper';
import {Colors} from '../constants/colors';
import {Images} from '../assets/images';

const LogoutModal = ({visible, onClose, onConfirm}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          {/* Logout Icon */}
          <View style={styles.iconContainer}>
            <Image source={Images.logout} style={styles.logoutIcon} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Logout</Text>

          {/* Description */}
          <Text style={styles.description}>
            Are you sure you want to logout from your account?
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={onConfirm}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeText: {
    fontSize: 20,
    color: Colors.grey_500,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: verticalScale(80),
    height: verticalScale(80),
    borderRadius: verticalScale(40),
    backgroundColor: '#FF9500' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  logoutIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    tintColor: '#FF9500',
    resizeMode: 'contain',
  },
  title: {
    fontSize: verticalScale(24),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(15),
  },
  description: {
    fontSize: verticalScale(14),
    color: Colors.grey_500,
    textAlign: 'center',
    marginBottom: verticalScale(25),
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: horizontalScale(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.grey_300,
    paddingVertical: verticalScale(15),
    borderRadius: verticalScale(10),
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: verticalScale(16),
    fontWeight: '600',
    color: Colors.grey_600,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#FF9500',
    paddingVertical: verticalScale(15),
    borderRadius: verticalScale(10),
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: verticalScale(16),
    fontWeight: 'bold',
    color: Colors.white,
  },
});

export default LogoutModal;
