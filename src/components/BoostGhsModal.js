import React, {useState, useEffect} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import {verticalScale, horizontalScale} from '../constants/helper';
import {Colors} from '../constants/colors';
import {Images} from '../assets/images';
import {showToast} from '../utils/toastUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import multiAdManager from '../utils/multiAdManager';

const BoostGhsModal = ({
  visible,
  onClose,
  currentGhs = 30,
  maxGhs = 100,
  hasReachedLimit = false,
  onBoost,
  isMining = false,
}) => {
  const isMaxReached = currentGhs >= maxGhs || hasReachedLimit;
  const [adCooldownEnd, setAdCooldownEnd] = useState(null);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [isAdDisabled, setIsAdDisabled] = useState(false);

  // Load cooldown state on mount
  useEffect(() => {
    loadCooldownState();
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let interval;
    if (isAdDisabled && cooldownTimeLeft > 0) {
      interval = setInterval(() => {
        setCooldownTimeLeft(prev => {
          if (prev <= 1000) {
            setIsAdDisabled(false);
            AsyncStorage.removeItem('boostGhsAdCooldown');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAdDisabled, cooldownTimeLeft]);

  const loadCooldownState = async () => {
    try {
      const cooldownEnd = await AsyncStorage.getItem('boostGhsAdCooldown');
      if (cooldownEnd) {
        const endTime = parseInt(cooldownEnd, 10);
        const currentTime = new Date().getTime();
        const timeLeft = endTime - currentTime;
        
        if (timeLeft > 0) {
          setAdCooldownEnd(endTime);
          setCooldownTimeLeft(timeLeft);
          setIsAdDisabled(true);
        } else {
          await AsyncStorage.removeItem('boostGhsAdCooldown');
        }
      }
    } catch (error) {
      console.error('Error loading cooldown state:', error);
    }
  };

  const formatCooldownTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBoost = async () => {
    if (!isMining) {
      showToast.show('Please first start mining', 'error');
      return;
    }
    
    if (isMaxReached || isAdDisabled) return;

    try {
      const result = await multiAdManager.showRewardedAd();
      if (result.success) {
        showToast.success(
          'Boost Activated!',
          'Your mining speed has been increased',
        );
        
        // Set 5-minute cooldown
        const cooldownDuration = 2 * 60 * 1000; // 5 minutes in milliseconds
        const cooldownEndTime = new Date().getTime() + cooldownDuration;
        await AsyncStorage.setItem('boostGhsAdCooldown', cooldownEndTime.toString());
        
        setAdCooldownEnd(cooldownEndTime);
        setCooldownTimeLeft(cooldownDuration);
        setIsAdDisabled(true);
        
        onBoost();
      } else {
        showToast.info(
          'Ad Cancelled',
          'Watch the complete ad to boost your GH/s',
        );
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      showToast.error('Ad Error', 'Unable to load ad. Please try again.');
    }
  };

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

          {/* 3D Rocket Image */}
          <Image
            source={Images.rocketImage}
            style={{
              resizeMode: 'center',
              height: 150,
              width: 150,
              marginTop: verticalScale(-100),
            }}
          />

          {/* Title */}
          <Text style={styles.title}>Boost Gh/s</Text>

          {/* Description */}
          <Text style={styles.description}>
            You can collect more by boosting the mining Gh/s up to{' '}
            <Text style={styles.maxValue}>{maxGhs} Gh/s</Text>
          </Text>

          {/* Current Status */}
          <View style={styles.statusContainer}>
            {isMaxReached ? (
              <Text style={styles.maxText}>Max</Text>
            ) : (
              <Text style={styles.currentText}>
                {currentGhs}/{maxGhs} Gh/s
              </Text>
            )}
          </View>

          {/* Let's Do It Button */}
          <View style={styles.buttonContainer}>
            {/* Watch AD Button */}
            {!isAdDisabled && (
            <TouchableOpacity style={styles.watchAdButton} onPress={handleBoost}>
              <Text style={styles.watchAdText}>Watch AD</Text>
            </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.boostButton,
                {
                  backgroundColor: (isMaxReached || isAdDisabled)
                    ? Colors.grey_400
                    : Colors.secondaryColor,
                },
              ]}
              onPress={handleBoost}
              disabled={isMaxReached || isAdDisabled}>
              <Text
                style={[
                  styles.boostButtonText,
                  {
                    color: (isMaxReached || isAdDisabled) ? Colors.grey_500 : Colors.white,
                  },
                ]}>
                {isAdDisabled ? `Available in ${formatCooldownTime(cooldownTimeLeft)}` : 'Let\'s Do It'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          {isMaxReached && (
            <Text style={styles.footerNote}>* You have reached the limit.</Text>
          )}
          {isAdDisabled && !isMaxReached && (
            <Text style={styles.footerNote}>* Cooldown active. Try again later.</Text>
          )}
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
  rocketContainer: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
    alignItems: 'center',
    height: 100,
  },
  rocket: {
    width: 60,
    height: 80,
    position: 'relative',
    alignItems: 'center',
  },
  rocketBody: {
    width: 25,
    height: 45,
    borderRadius: 12,
    position: 'relative',
    zIndex: 2,
  },
  rocketNose: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: -15,
    zIndex: 3,
  },
  rocketFin: {
    position: 'absolute',
    width: 15,
    height: 25,
    borderRadius: 8,
    bottom: 0,
    zIndex: 1,
  },
  leftFin: {
    left: -5,
    transform: [{skewX: '-15deg'}],
  },
  rightFin: {
    right: -5,
    transform: [{skewX: '15deg'}],
  },
  fireContainer: {
    position: 'absolute',
    bottom: -25,
    alignItems: 'center',
    zIndex: 0,
  },
  fire: {
    width: 12,
    height: 20,
    borderRadius: 6,
    position: 'absolute',
  },
  fire2: {
    width: 8,
    height: 15,
    left: -10,
  },
  fire3: {
    width: 8,
    height: 15,
    left: 10,
  },
  sparkle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD93D',
    position: 'absolute',
  },
  sparkle1: {
    top: -30,
    left: -15,
  },
  sparkle2: {
    top: -25,
    right: -10,
  },
  sparkle3: {
    top: -35,
    right: 5,
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
    paddingHorizontal: 10,
  },
  maxValue: {
    color: Colors.secondaryColor,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginBottom: verticalScale(25),
  },
  maxText: {
    fontSize: verticalScale(32),
    fontWeight: 'bold',
    color: Colors.secondaryColor,
    textAlign: 'center',
  },
  currentText: {
    fontSize: verticalScale(18),
    color: Colors.black,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    // marginBottom: verticalScale(15),
  },
  watchAdButton: {
    backgroundColor: Colors.black,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(10),
    borderRadius: verticalScale(25),
    marginBottom: verticalScale(-13),
    alignSelf: 'flex-end',
    marginRight: 10,
    zIndex: 1,
  },
  watchAdText: {
    color: Colors.white,
    fontSize: verticalScale(8),
    fontWeight: '600',
  },
  boostButton: {
    paddingVertical: verticalScale(15),
    borderRadius: verticalScale(10),
    width: '100%',
    marginBottom: verticalScale(10),
  },
  boostButtonText: {
    fontSize: verticalScale(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerNote: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
});

export default BoostGhsModal;
