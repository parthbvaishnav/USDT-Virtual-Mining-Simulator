import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {Colors} from '../../constants/colors';
import {horizontalScale, verticalScale} from '../../constants/helper';
import {Images} from '../../assets/images';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const RewardScreen = () => {
  const navigation = useNavigation();
  const [masterCoin, setMasterCoin] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

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

  const rewardCategories = [
    {
      id: 1,
      title: 'Daily Rewards',
      description: 'Claim your daily bonus',
      icon: Images.presentIcon,
      coins: '50-200',
      status: 'available',
      onPress: () => navigation.navigate('HomeScreen'),
    },
    {
      id: 2,
      title: 'Play Games',
      description: 'Play mini-games to earn rewards',
      icon: Images.giftIcon,
      coins: '10-500',
      status: 'available',
      onPress: () => navigation.navigate('HomeScreen'),
    },
    {
      id: 3,
      title: 'Mining Rewards',
      description: 'Earn from active mining',
      icon: Images.pickaxeIcon,
      coins: '0.0056/min',
      status: 'active',
      onPress: () => navigation.navigate('MiningScreen'),
    },
    {
      id: 4,
      title: 'Referral Bonus',
      description: 'Invite friends and earn',
      icon: Images.multipleUsersIcon,
      coins: '100',
      status: 'available',
      onPress: () => navigation.navigate('RaferScreen'),
    },
    {
      id: 5,
      title: 'Achievement Rewards',
      description: 'Complete tasks to earn',
      icon: Images.rewardsIcon,
      coins: '25-500',
      status: 'coming_soon',
      onPress: () => {},
    },
  ];

  const recentRewards = [
    {id: 1, type: 'Daily Box', amount: 150, date: 'Today'},
    {id: 2, type: 'Mining', amount: 85, date: 'Yesterday'},
    {id: 3, type: 'Referral', amount: 100, date: '2 days ago'},
    {id: 4, type: 'Daily Box', amount: 75, date: '3 days ago'},
  ];

  const renderRewardCategory = ({item}) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        {opacity: item.status === 'coming_soon' ? 0.6 : 1},
      ]}
      onPress={item.onPress}
      disabled={item.status === 'coming_soon'}>
      <View style={styles.categoryIcon}>
        <Image
          source={item.icon}
          style={[
            styles.iconImage,
            {
              tintColor:
                item.status === 'active'
                  ? Colors.secondaryColor
                  : Colors.grey_500,
            },
          ]}
        />
        {item.status === 'available' && <View style={styles.notificationDot} />}
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{item.title}</Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
        <View style={styles.coinsContainer}>
          <Image source={Images.starIcon} style={styles.starIcon} />
          <Text style={styles.coinsText}>{item.coins}</Text>
        </View>
      </View>
      {item.status === 'coming_soon' && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecentReward = ({item}) => (
    <View style={styles.recentRewardItem}>
      <View style={styles.recentRewardIcon}>
        <Image source={Images.starIcon} style={styles.recentStarIcon} />
      </View>
      <View style={styles.recentRewardContent}>
        <Text style={styles.recentRewardType}>{item.type}</Text>
        <Text style={styles.recentRewardDate}>{item.date}</Text>
      </View>
      <Text style={styles.recentRewardAmount}>+{item.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Rewards" ishelp={true} />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Balance Overview */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>SUPER COINS</Text>
              <Text style={styles.balanceValue}>{masterCoin}</Text>
              <Text style={styles.balanceSubtext}>
                ~ {(masterCoin * 0.17).toFixed(2)} USDT
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>TOTAL MINE</Text>
              <Text style={styles.balanceValue}>{totalEarned.toFixed(4)}</Text>
              <Text style={styles.balanceSubtext}>USDT</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[
              styles.quickActionButton,
              {backgroundColor: Colors.secondaryColor},
            ]}
            onPress={() => navigation.navigate('ConvertCoinScreen')}>
            <Image
              source={Images.convertCoinIcon}
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>Convert</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickActionButton,
              {backgroundColor: Colors.primaryColor},
            ]}
            onPress={() => navigation.navigate('HomeScreen')}>
            <Image source={Images.giftIcon} style={styles.quickActionIcon} />
            <Text style={styles.quickActionText}>Play Game</Text>
          </TouchableOpacity>
        </View>

        {/* Reward Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Reward Categories</Text>
          <FlatList
            data={rewardCategories}
            renderItem={renderRewardCategory}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Recent Rewards */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Rewards</Text>
          <View style={styles.recentRewardsContainer}>
            <FlatList
              data={recentRewards}
              renderItem={renderRecentReward}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        {/* Daily Streak */}
        <View
          style={[styles.sectionContainer, {marginBottom: verticalScale(150)}]}>
          <View style={styles.streakContainer}>
            <View style={styles.streakHeader}>
              <Text style={styles.sectionTitle}>Daily Streak</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakNumber}>5</Text>
                <Text style={styles.streakText}>days</Text>
              </View>
            </View>
            <Text style={styles.streakDescription}>
              Keep your streak alive! Come back tomorrow for bigger rewards.
            </Text>
            <View style={styles.streakDots}>
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <View
                  key={day}
                  style={[
                    styles.streakDot,
                    {
                      backgroundColor:
                        day <= 5 ? Colors.secondaryColor : Colors.grey_300,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.semiGray,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  balanceContainer: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(25),
  },
  balanceCard: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    fontWeight: '500',
    letterSpacing: 1,
  },
  balanceValue: {
    fontSize: verticalScale(24),
    color: Colors.black,
    fontWeight: 'bold',
    marginVertical: verticalScale(5),
  },
  balanceSubtext: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
  },
  balanceDivider: {
    width: 1,
    height: verticalScale(40),
    backgroundColor: Colors.grey_300,
    marginHorizontal: horizontalScale(20),
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(25),
    gap: horizontalScale(15),
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(15),
    borderRadius: verticalScale(12),
    gap: horizontalScale(8),
  },
  quickActionIcon: {
    width: verticalScale(20),
    height: verticalScale(20),
    tintColor: Colors.white,
    resizeMode: 'contain',
  },
  quickActionText: {
    color: Colors.white,
    fontSize: verticalScale(14),
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: verticalScale(25),
  },
  sectionTitle: {
    fontSize: verticalScale(18),
    color: Colors.black,
    fontWeight: 'bold',
    marginBottom: verticalScale(15),
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(15),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  categoryIcon: {
    width: verticalScale(50),
    height: verticalScale(50),
    borderRadius: verticalScale(25),
    backgroundColor: Colors.bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(15),
    position: 'relative',
  },
  iconImage: {
    width: verticalScale(25),
    height: verticalScale(25),
    resizeMode: 'contain',
  },
  notificationDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: verticalScale(16),
    color: Colors.black,
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  categoryDescription: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    marginBottom: verticalScale(8),
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: verticalScale(16),
    height: verticalScale(16),
    marginRight: horizontalScale(5),
    resizeMode: 'contain',
  },
  coinsText: {
    fontSize: verticalScale(14),
    color: Colors.secondaryColor,
    fontWeight: '600',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.grey_400,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: verticalScale(12),
  },
  comingSoonText: {
    fontSize: verticalScale(10),
    color: Colors.white,
    fontWeight: '600',
  },
  recentRewardsContainer: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(15),
  },
  recentRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightLine,
  },
  recentRewardIcon: {
    width: verticalScale(35),
    height: verticalScale(35),
    borderRadius: verticalScale(17.5),
    backgroundColor: Colors.bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(12),
  },
  recentStarIcon: {
    width: verticalScale(18),
    height: verticalScale(18),
    resizeMode: 'contain',
  },
  recentRewardContent: {
    flex: 1,
  },
  recentRewardType: {
    fontSize: verticalScale(14),
    color: Colors.black,
    fontWeight: '500',
  },
  recentRewardDate: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    marginTop: verticalScale(2),
  },
  recentRewardAmount: {
    fontSize: verticalScale(16),
    color: Colors.secondaryColor,
    fontWeight: 'bold',
  },
  streakContainer: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(20),
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  streakBadge: {
    backgroundColor: Colors.secondaryColor,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: verticalScale(15),
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: verticalScale(16),
    color: Colors.white,
    fontWeight: 'bold',
  },
  streakText: {
    fontSize: verticalScale(10),
    color: Colors.white,
    fontWeight: '500',
  },
  streakDescription: {
    fontSize: verticalScale(14),
    color: Colors.grey_500,
    marginBottom: verticalScale(15),
  },
  streakDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(10),
  },
  streakDot: {
    width: verticalScale(12),
    height: verticalScale(12),
    borderRadius: verticalScale(6),
  },
});

export default RewardScreen;
