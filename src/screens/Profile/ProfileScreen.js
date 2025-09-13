import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Header from '../../components/Header';
import {Images} from '../../assets/images';
import {horizontalScale, SUPER_COIN_TO_USDT, verticalScale} from '../../constants/helper';
import {Colors} from '../../constants/colors';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../../context/AuthContext';
import CustomStatusBar from '../../components/CustomStatusBar';
import LogoutModal from '../../components/LogoutModal';
import DeleteAccountModal from '../../components/DeleteAccountModal';
import axios from 'axios';

export default function ProfileScreen(props) {
  const navigation = useNavigation();
  const {user, apiResponse, logout} = useAuth();
  const [userData, setUserData] = useState({
    username: 'Guest User',
    refer_code: 'N/A',
  });
  const [masterCoin, setMasterCoin] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Load user data from auth context
    if (user && apiResponse) {
      setUserData({
        username: user.name || 'Guest User',
        refer_code: user.refer_code || 'N/A',
        email: user.email || 'N/A',
        id: user.id || 'N/A',
        isActive: user.is_active || 0,
        isVerified: user.is_verified || 0,
        socialType: user.social_type || 'email',
        createdAt: user.created_at || 'N/A',
        mine: user.mine || 0,
      });
    }
  }, [user, apiResponse]);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', async () => {
      const totalMasterCoin = await AsyncStorage.getItem('masterCoin');
      const totalEarnedValue = await AsyncStorage.getItem('totalEarned');
      if (totalMasterCoin) {
        setMasterCoin(parseFloat(totalMasterCoin) || 0);
      }
      if (totalEarnedValue) {
        setTotalEarned(parseFloat(totalEarnedValue) || 0);
      }
    });

    return () => {
      focusListener();
    };
  }, [navigation]);
  const convertToUSDT = (superCoins) => {
    return (superCoins * SUPER_COIN_TO_USDT).toFixed(8); // 8 decimal places for precision
  };

  const profileStats = [
    {
      id: 1,
      title: 'Total Balance',
      value: `${convertToUSDT(totalEarned)} USDT`,
      icon: Images.TLogo,
      backgroundColor: Colors.secondaryColor,
      iconTint: Colors.white,
    },
    {
      id: 2,
      title: 'Super Coins',
      value: masterCoin.toLocaleString(),
      icon: Images.starIcon,
      backgroundColor: Colors.lightLine,
      // iconTint: Colors.white,
    },
    // {
    //   id: 3,
    //   title: 'Mining Level',
    //   value: 'Level 1',
    //   icon: Images.pickaxeIcon,
    //   backgroundColor: Colors.lightGreen,
    //   iconTint: Colors.darkGreen,
    // },
    // {
    //   id: 4,
    //   title: 'Referrals',
    //   value: '0 Friends',
    //   icon: Images.multipleUsersIcon,
    //   backgroundColor: '#FF6B6B20',
    //   iconTint: '#FF6B6B',
    // },
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      await logout();
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await axios.delete(
        `https://peradox.in/api/mtc/deleteUser/${user.id}`,
      );

      if (response.data?.status === 'success') {
        setShowDeleteModal(false);
        setIsDeleting(false);
        Alert.alert(
          'Account Deleted',
          'Your account has been successfully deleted.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await AsyncStorage.removeItem('userSession');
                navigation.reset({
                  index: 0,
                  routes: [{name: 'LoginScreen'}],
                });
              },
            },
          ],
        );
      } else {
        setIsDeleting(false);
        Alert.alert('Error', response.data?.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setIsDeleting(false);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to delete account. Please try again.',
      );
    }
  };

  const menuItems = [
    {
      id: 1,
      title: 'Convert Super Coins',
      description: 'Convert your super coins into USDT',
      icon: Images.rePostIcon,
      iconBg: Colors.secondaryColor + '20',
      iconTint: Colors.secondaryColor,
      onPress: () => props.navigation.navigate('ConvertCoinScreen'),
    },
    {
      id: 2,
      title: 'Refer Friends',
      description: 'Invite your friends and get rewards!',
      icon: Images.raferIcon,
      iconBg: Colors.primaryColor + '20',
      iconTint: Colors.primaryColor,
      onPress: () => props.navigation.navigate('Rafers'),
    },
    {
      id: 3,
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: Images.Question,
      iconBg: Colors.grey_300,
      iconTint: Colors.primaryColor,
      onPress: () => props.navigation.navigate('HelpScreen'),
    },
    {
      id: 4,
      title: 'Logout',
      description: 'Sign out of your account',
      icon: Images.logout,
      iconBg: '#FF9500' + '20',
      iconTint: '#FF9500',
      onPress: handleLogout,
    },
    {
      id: 5,
      title: 'Delete Account',
      description: 'Permanently delete your account',
      icon: Images.trash,
      iconBg: '#FF3B30' + '20',
      // iconTint: '#FF3B30',
      onPress: handleDeleteAccount,
    },
  ];

  const renderStatCard = item => (
    <View key={item.id} style={styles.statCard}>
      <View style={[styles.statIcon, {backgroundColor: item.backgroundColor}]}>
        <Image
          source={item.icon}
          style={[styles.statIconImage, {tintColor: item.iconTint}]}
        />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </View>
  );

  const renderMenuItem = item => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, {backgroundColor: item.iconBg}]}>
          <Image
            source={item.icon}
            style={[
              styles.menuIconImage,
              {
                tintColor: item.iconTint,
                transform:
                  item.icon === Images.rePostIcon ? [{rotate: '90deg'}] : [],
              },
            ]}
          />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuDescription}>{item.description}</Text>
        </View>
      </View>
      <Image source={Images.lessThanIcon} style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar dark backgroundColor={Colors.semiGray} />
      <Header ishelp={true} />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image style={styles.profileImage} source={Images.girlFaceIcon} />
            {/* <TouchableOpacity style={styles.editButton} onPress={() => {}}>
              <Image style={styles.editIcon} source={Images.editIcon} />
            </TouchableOpacity> */}
          </View>

          <Text style={styles.nameText}>{userData.username}</Text>
          <View style={styles.referralContainer}>
            <Text style={styles.referralLabel}>Referral ID:</Text>
            <Text style={styles.referralCode}>#{userData.refer_code}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {profileStats.map(renderStatCard)}
          </View>
        </View>

        {/* Quick Actions */}
        {/* <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[
              styles.quickAction,
              {backgroundColor: Colors.secondaryColor},
            ]}
            onPress={() => props.navigation.navigate('ConvertCoinScreen')}>
            <Image
              source={Images.convertCoinIcon}
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>Convert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, {backgroundColor: Colors.primaryColor}]}
            onPress={() => props.navigation.navigate('Rafers')}>
            <Image
              source={Images.multipleUsersIcon}
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>Refer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, {backgroundColor: '#FF6B6B'}]}
            onPress={() => props.navigation.navigate('MiningScreen')}>
            <Image source={Images.pickaxeIcon} style={styles.quickActionIcon} />
            <Text style={styles.quickActionText}>Mine</Text>
          </TouchableOpacity>
        </View> */}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuList}>{menuItems.map(renderMenuItem)}</View>
        </View>

        {/* Account Info Card */}
        <View style={styles.accountInfoCard}>
          <View style={styles.accountInfoHeader}>
            <Text style={styles.accountInfoTitle}>Account Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{userData.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Referral Code</Text>
            <Text style={styles.infoValue}>{userData.refer_code}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{userData.id || 'N/A'}</Text>
          </View>
          {/* <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration Type</Text>
            <Text style={styles.infoValue}>
              {userData.socialType === 'email' ? 'Email' : userData.socialType || 'N/A'}
            </Text>
          </View> */}
          {/* <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mining Points</Text>
            <Text style={styles.infoValue}>{userData.mine || 0}</Text>
          </View> */}
          {/* <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Join Date</Text>
            <Text style={styles.infoValue}>
              {userData.createdAt !== 'N/A'
                ? new Date(userData.createdAt).toLocaleDateString()
                : 'N/A'}
            </Text>
          </View> */}
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MTC Mining Simulation v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
        isLoading={isDeleting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.semiGray,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  profileImageContainer: {
    width: verticalScale(120),
    height: verticalScale(120),
    borderRadius: verticalScale(60),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  profileImage: {
    width: verticalScale(100),
    height: verticalScale(100),
    resizeMode: 'contain',
  },
  editButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.secondaryColor,
    width: verticalScale(35),
    height: verticalScale(35),
    borderRadius: verticalScale(17.5),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.secondaryColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  editIcon: {
    width: verticalScale(18),
    height: verticalScale(18),
    tintColor: Colors.white,
    resizeMode: 'contain',
  },
  nameText: {
    fontSize: verticalScale(24),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(8),
  },
  referralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgColor,
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(8),
    borderRadius: verticalScale(20),
  },
  referralLabel: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    marginRight: horizontalScale(5),
  },
  referralCode: {
    fontSize: verticalScale(12),
    fontWeight: '600',
    color: Colors.secondaryColor,
  },
  sectionTitle: {
    fontSize: verticalScale(18),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(15),
  },
  statsContainer: {
    marginBottom: verticalScale(25),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(15),
    alignItems: 'center',
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: verticalScale(50),
    height: verticalScale(50),
    borderRadius: verticalScale(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(10),
  },
  statIconImage: {
    width: verticalScale(25),
    height: verticalScale(25),
    resizeMode: 'contain',
  },
  statValue: {
    fontSize: verticalScale(16),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  statTitle: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(25),
    gap: horizontalScale(10),
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    borderRadius: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: verticalScale(25),
    height: verticalScale(25),
    tintColor: Colors.white,
    marginBottom: verticalScale(8),
    resizeMode: 'contain',
  },
  quickActionText: {
    fontSize: verticalScale(12),
    fontWeight: '600',
    color: Colors.white,
  },
  menuContainer: {
    marginBottom: verticalScale(25),
  },
  menuList: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightLine,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: verticalScale(45),
    height: verticalScale(45),
    borderRadius: verticalScale(22.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(15),
  },
  menuIconImage: {
    width: verticalScale(22),
    height: verticalScale(22),
    resizeMode: 'contain',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: verticalScale(16),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: verticalScale(2),
  },
  menuDescription: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    lineHeight: verticalScale(16),
  },
  arrowIcon: {
    width: verticalScale(18),
    height: verticalScale(18),
    tintColor: Colors.grey_400,
    resizeMode: 'contain',
    transform: [{rotate: '180deg'}],
  },
  accountInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(20),
    marginBottom: verticalScale(25),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountInfoHeader: {
    marginBottom: verticalScale(15),
  },
  accountInfoTitle: {
    fontSize: verticalScale(16),
    fontWeight: '600',
    color: Colors.black,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightLine,
  },
  infoLabel: {
    fontSize: verticalScale(14),
    color: Colors.grey_500,
  },
  infoValue: {
    fontSize: verticalScale(14),
    fontWeight: '500',
    color: Colors.black,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(100),
  },
  versionText: {
    fontSize: verticalScale(12),
    color: Colors.grey_400,
  },
});
