import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {verticalScale, horizontalScale} from '../constants/helper';
import {Colors} from '../constants/colors';
import {Images} from '../assets/images';

const DeleteAccountModal = ({visible, onClose, onConfirm, isLoading = false}) => {
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

          {/* Delete Icon */}
          <View style={styles.iconContainer}>
            <Image source={Images.trash} style={styles.deleteIcon} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Delete Account</Text>

          {/* Description */}
          <Text style={styles.description}>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
          </Text>

          {/* Warning Box */}
          <View style={styles.warningBox}>
            <View style={styles.warningIconContainer}>
              <Text style={styles.warningIcon}>⚠️</Text>
            </View>
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>This action is permanent</Text>
              <Text style={styles.warningText}>
                • All your mining progress will be lost{'\n'}
                • Your balance and rewards will be deleted{'\n'}
                • Your referral data will be removed
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={isLoading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.deleteButton, isLoading && styles.disabledButton]} 
              onPress={onConfirm}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              )}
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
    width: '90%',
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
    backgroundColor: '#FF3B30' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  deleteIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    tintColor: '#FF3B30',
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
    marginBottom: verticalScale(20),
    lineHeight: 20,
    paddingHorizontal: 5,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: verticalScale(12),
    padding: verticalScale(15),
    marginBottom: verticalScale(25),
    width: '100%',
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  warningIconContainer: {
    marginRight: horizontalScale(12),
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: verticalScale(2),
  },
  warningIcon: {
    fontSize: verticalScale(20),
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: verticalScale(14),
    fontWeight: '600',
    color: '#856404',
    marginBottom: verticalScale(5),
  },
  warningText: {
    fontSize: verticalScale(12),
    color: '#856404',
    lineHeight: verticalScale(16),
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
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: verticalScale(15),
    borderRadius: verticalScale(10),
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: verticalScale(16),
    fontWeight: 'bold',
    color: Colors.white,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default DeleteAccountModal;
