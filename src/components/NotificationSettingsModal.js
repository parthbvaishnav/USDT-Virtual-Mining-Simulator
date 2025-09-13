import React, {useState, useEffect} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import {verticalScale, horizontalScale} from '../constants/helper';
import {Colors} from '../constants/colors';
import {Images} from '../assets/images';
import notificationService from '../services/notificationService';

const NotificationSettingsModal = ({visible, onClose}) => {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [miningRewards, setMiningRewards] = useState(true);
  const [dailyBonus, setDailyBonus] = useState(true);
  const [boostAvailable, setBoostAvailable] = useState(true);
  const [referralRewards, setReferralRewards] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState({
    hasPermission: false,
    isSubscribed: false,
    userId: null,
  });

  useEffect(() => {
    if (visible) {
      checkPermissionStatus();
    }
  }, [visible]);

  const checkPermissionStatus = async () => {
    const status = await notificationService.getPermissionStatus();
    setPermissionStatus(status);
    setNotificationEnabled(status.hasPermission && status.isSubscribed);
  };

  const handleNotificationToggle = async (value) => {
    if (value) {
      // Enable notifications
      await notificationService.enableNotifications();
      await notificationService.requestPermissions();
    } else {
      // Disable notifications
      notificationService.disableNotifications();
    }
    
    setNotificationEnabled(value);
    
    // Update user tags based on preferences
    updateNotificationTags();
    
    // Recheck status
    setTimeout(() => {
      checkPermissionStatus();
    }, 1000);
  };

  const updateNotificationTags = () => {
    const tags = {
      notifications_enabled: notificationEnabled,
      mining_rewards: miningRewards,
      daily_bonus: dailyBonus,
      boost_available: boostAvailable,
      referral_rewards: referralRewards,
    };
    
    notificationService.sendTags(tags);
  };

  const handleSettingChange = (setting, value) => {
    switch (setting) {
      case 'mining':
        setMiningRewards(value);
        break;
      case 'daily':
        setDailyBonus(value);
        break;
      case 'boost':
        setBoostAvailable(value);
        break;
      case 'referral':
        setReferralRewards(value);
        break;
    }
    
    // Update tags after state change
    setTimeout(() => {
      updateNotificationTags();
    }, 100);
  };

  const notificationTypes = [
    {
      id: 'mining',
      title: 'Mining Rewards',
      description: 'Get notified when you earn mining rewards',
      icon: Images.pickaxeIcon,
      value: miningRewards,
      onChange: (value) => handleSettingChange('mining', value),
    },
    {
      id: 'daily',
      title: 'Daily Bonus',
      description: 'Daily login bonuses and mystery boxes',
      icon: Images.presentIcon,
      value: dailyBonus,
      onChange: (value) => handleSettingChange('daily', value),
    },
    {
      id: 'boost',
      title: 'Boost Available',
      description: 'When speed boosts are ready to use',
      icon: Images.rocketImage,
      value: boostAvailable,
      onChange: (value) => handleSettingChange('boost', value),
    },
    {
      id: 'referral',
      title: 'Referral Rewards',
      description: 'When friends join using your referral code',
      icon: Images.raferIcon,
      value: referralRewards,
      onChange: (value) => handleSettingChange('referral', value),
    },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Image source={Images.Question} style={styles.headerIcon} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Notification Settings</Text>
          <Text style={styles.subtitle}>
            Manage your notification preferences
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Master Toggle */}
            <View style={styles.masterToggleContainer}>
              <View style={styles.masterToggleLeft}>
                <Text style={styles.masterToggleTitle}>Push Notifications</Text>
                <Text style={styles.masterToggleDesc}>
                  {permissionStatus.hasPermission 
                    ? 'Notifications are enabled' 
                    : 'Enable notifications to receive updates'}
                </Text>
              </View>
              <Switch
                value={notificationEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{false: Colors.grey_300, true: Colors.secondaryColor + '40'}}
                thumbColor={notificationEnabled ? Colors.secondaryColor : Colors.grey_500}
              />
            </View>

            {/* Permission Status */}
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Permission Status:</Text>
                <Text style={[
                  styles.statusValue,
                  {color: permissionStatus.hasPermission ? Colors.secondaryColor : Colors.red}
                ]}>
                  {permissionStatus.hasPermission ? 'Granted' : 'Not Granted'}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Subscription Status:</Text>
                <Text style={[
                  styles.statusValue,
                  {color: permissionStatus.isSubscribed ? Colors.secondaryColor : Colors.red}
                ]}>
                  {permissionStatus.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </Text>
              </View>
              {permissionStatus.userId && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>User ID:</Text>
                  <Text style={styles.statusValue}>
                    {permissionStatus.userId.substring(0, 8)}...
                  </Text>
                </View>
              )}
            </View>

            {/* Notification Types */}
            {notificationEnabled && (
              <View style={styles.typesContainer}>
                <Text style={styles.typesTitle}>Notification Types</Text>
                
                {notificationTypes.map((type) => (
                  <View key={type.id} style={styles.typeItem}>
                    <View style={styles.typeLeft}>
                      <View style={styles.typeIcon}>
                        <Image
                          source={type.icon}
                          style={styles.typeIconImage}
                        />
                      </View>
                      <View style={styles.typeContent}>
                        <Text style={styles.typeTitle}>{type.title}</Text>
                        <Text style={styles.typeDesc}>{type.description}</Text>
                      </View>
                    </View>
                    <Switch
                      value={type.value}
                      onValueChange={type.onChange}
                      trackColor={{false: Colors.grey_300, true: Colors.primaryColor + '40'}}
                      thumbColor={type.value ? Colors.primaryColor : Colors.grey_500}
                      disabled={!notificationEnabled}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>About Notifications</Text>
              <Text style={styles.infoText}>
                • Notifications help you stay updated with your mining progress{'\n'}
                • You can disable specific types while keeping others enabled{'\n'}
                • All notifications respect your device's Do Not Disturb settings{'\n'}
                • You can change these settings anytime
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: verticalScale(25),
    borderTopRightRadius: verticalScale(25),
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  iconContainer: {
    width: verticalScale(60),
    height: verticalScale(60),
    borderRadius: verticalScale(30),
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: verticalScale(30),
    height: verticalScale(30),
    tintColor: Colors.white,
    resizeMode: 'contain',
  },
  closeButton: {
    width: verticalScale(35),
    height: verticalScale(35),
    borderRadius: verticalScale(17.5),
    backgroundColor: Colors.grey_300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: Colors.grey_500,
    fontWeight: 'bold',
  },
  title: {
    fontSize: verticalScale(24),
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: verticalScale(14),
    color: Colors.grey_500,
    textAlign: 'center',
    marginBottom: verticalScale(25),
    lineHeight: verticalScale(20),
  },
  masterToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgColor,
    borderRadius: verticalScale(15),
    padding: verticalScale(15),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: Colors.grey_300,
  },
  masterToggleLeft: {
    flex: 1,
    marginRight: horizontalScale(15),
  },
  masterToggleTitle: {
    fontSize: verticalScale(16),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: verticalScale(4),
  },
  masterToggleDesc: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    lineHeight: verticalScale(16),
  },
  statusContainer: {
    backgroundColor: Colors.lightGrey,
    borderRadius: verticalScale(12),
    padding: verticalScale(15),
    marginBottom: verticalScale(20),
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  statusLabel: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
  },
  statusValue: {
    fontSize: verticalScale(12),
    fontWeight: '600',
  },
  typesContainer: {
    marginBottom: verticalScale(20),
  },
  typesTitle: {
    fontSize: verticalScale(16),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: verticalScale(15),
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: verticalScale(12),
    padding: verticalScale(15),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: Colors.grey_300,
  },
  typeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: verticalScale(20),
    backgroundColor: Colors.primaryColor + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(12),
  },
  typeIconImage: {
    width: verticalScale(20),
    height: verticalScale(20),
    tintColor: Colors.primaryColor,
    resizeMode: 'contain',
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontSize: verticalScale(14),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: verticalScale(2),
  },
  typeDesc: {
    fontSize: verticalScale(11),
    color: Colors.grey_500,
    lineHeight: verticalScale(14),
  },
  infoContainer: {
    backgroundColor: Colors.bgColor,
    borderRadius: verticalScale(12),
    padding: verticalScale(15),
  },
  infoTitle: {
    fontSize: verticalScale(14),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: verticalScale(10),
  },
  infoText: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    lineHeight: verticalScale(18),
  },
});

export default NotificationSettingsModal;
