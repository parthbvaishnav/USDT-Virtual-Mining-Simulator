import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../../constants/colors';
import {horizontalScale, verticalScale} from '../../constants/helper';
import {Images} from '../../assets/images';
import {useNavigation} from '@react-navigation/native';
import Popup from '../../components/Popup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomStatusBar from '../../components/CustomStatusBar';
import {showToast} from '../../utils/toastUtils';
import multiAdManager from '../../utils/multiAdManager';
import analyticsService from '../../services/analyticsService';

export default function HomeScreen(props) {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

  const [list, setList] = useState(
    Array(4)
      .fill()
      .map(() => ({value: 0, opened: false})),
  );
  const [isVisible, setIsVisible] = useState(false);
  const [giftAmt, setGiftAmt] = useState(0);
  const [masterCoin, setMasterCoin] = useState(0);
  const [isGiftMining, setIsGiftMining] = useState(false);
  const [giftTimeRemaining, setGiftTimeRemaining] = useState(0);
  const [giftIntervalId, setGiftIntervalId] = useState(null);
  const [flippedCount, setFlippedCount] = useState(0);
  const MAX_FLIPS = 4;
  const GIFT_DURATION_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Daily bonus state
  const [dailyDayIndex, setDailyDayIndex] = useState(0);
  const [lastDailyClaim, setLastDailyClaim] = useState(null);
  const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const dailyRewards = [100, 200, 300, 400, 500, 600, 700];

  // Game modes
  const [selectedGameMode, setSelectedGameMode] = useState('flip');
  const gameModes = [
    {
      id: 'flip',
      title: 'Flip & Win',
      description: 'Flip cards to win coins',
      icon: Images.giftIcon,
      color: Colors.primaryColor,
      minReward: 10,
      maxReward: 200,
    },
    {
      id: 'daily',
      title: 'Daily Bonus',
      description: 'Claim your daily reward',
      icon: Images.giftIcon,
      color: Colors.primaryColor,
      minReward: 50,
      maxReward: 500,
    },
  ];

  useEffect(() => {
    const focusListener = navigation.addListener('focus', async () => {
      // Log screen view analytics
      await analyticsService.logScreenView('HomeScreen');
      
      const totalMasterCoin = await AsyncStorage.getItem('masterCoin');
      if (totalMasterCoin) {
        setMasterCoin(parseFloat(totalMasterCoin) || 0);
      }
      const getBoxList = await AsyncStorage.getItem('boxList');
      if (getBoxList != null) {
        const list = JSON.parse(getBoxList);
        setList(list);
        setFlippedCount(list.filter(item => item.opened).length);
      } else {
        setList(
          Array(4)
            .fill()
            .map(() => ({value: 0, opened: false})),
        );
        setFlippedCount(0);
      }
      // Load daily bonus progress
      const storedDay = await AsyncStorage.getItem('dailyDayIndex');
      const storedLast = await AsyncStorage.getItem('lastDailyClaim');
      if (storedDay !== null) setDailyDayIndex(parseInt(storedDay, 10) || 0);
      if (storedLast !== null) setLastDailyClaim(parseInt(storedLast, 10));

      setIsVisible(false);
    });

    return () => {
      focusListener();
    };
  }, [navigation]);

  useEffect(() => {
    const loadGift = async () => {
      try {
        const giftStoredSession = await AsyncStorage.getItem('giftOpenStart');
        if (giftStoredSession) {
          const sessionStart = new Date(parseInt(giftStoredSession));
          const now = new Date();
          const elapsedTime = now - sessionStart;
          if (elapsedTime < GIFT_DURATION_MS) {
            setIsGiftMining(true);
            setGiftTimeRemaining(GIFT_DURATION_MS - elapsedTime);
          } else {
            await AsyncStorage.removeItem('giftOpenStart');
            await AsyncStorage.removeItem('boxList');
            setIsGiftMining(false);
            setGiftTimeRemaining(0);
            setList(
              Array(4)
                .fill()
                .map(() => ({value: 0, opened: false})),
            );
            setFlippedCount(0);
          }
        } else {
          await AsyncStorage.removeItem('boxList');
          setIsGiftMining(false);
          setGiftTimeRemaining(0);
          setList(
            Array(4)
              .fill()
              .map(() => ({value: 0, opened: false})),
          );
          setFlippedCount(0);
        }
      } catch (error) {
        console.error('Failed to load state from AsyncStorage:', error);
      }
    };

    loadGift();

    return () => {
      if (giftIntervalId) {
        clearInterval(giftIntervalId);
      }
    };
  }, []);

  useEffect(() => {
    if (isGiftMining && giftTimeRemaining > 0) {
      const giftMiningIntervalId = setInterval(async () => {
        setGiftTimeRemaining(prev => {
          const newTimeRemaining = prev - 1000;
          if (newTimeRemaining <= 0) {
            AsyncStorage.removeItem('giftOpenStart');
            AsyncStorage.removeItem('boxList');
            setIsGiftMining(false);
            setGiftTimeRemaining(0);
            setList(
              Array(4)
                .fill()
                .map(() => ({value: 0, opened: false})),
            );
            setFlippedCount(0);
            clearInterval(giftMiningIntervalId);
          }
          return newTimeRemaining;
        });
      }, 1000);

      setGiftIntervalId(giftMiningIntervalId);
    }

    // Daily bonus timer refresh
    const dailyInterval = setInterval(() => {
      setLastDailyClaim(prev => (prev ? prev : prev));
    }, 1000);

    return () => {
      clearInterval(giftIntervalId);
      clearInterval(dailyInterval);
    };

    return () => clearInterval(giftIntervalId);
  }, [isGiftMining, giftTimeRemaining]);

  const openBox = async index => {
    if (flippedCount >= MAX_FLIPS || list[index].opened) return;

    setIsVisible(true);
    const randomAmount = await getRandomInt(10, 200);
    setGiftAmt(randomAmount);

    let newList = [...list];
    newList[index].value = randomAmount;
    newList[index].opened = true;
    setList(newList);
    const newFlipped = flippedCount + 1;
    setFlippedCount(newFlipped);
    AsyncStorage.setItem('boxList', JSON.stringify(newList));

    if (newFlipped >= MAX_FLIPS && !isGiftMining) {
      const now = new Date().getTime();
      await AsyncStorage.setItem('giftOpenStart', now.toString());
      setIsGiftMining(true);
      setGiftTimeRemaining(GIFT_DURATION_MS);
    }
  };

  const getRandomInt = async (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const claimReward = async () => {
    setIsVisible(false);
    setMasterCoin(prev => {
      const totalMasterCoin = prev + giftAmt;
      AsyncStorage.setItem('masterCoin', totalMasterCoin.toString());
      return totalMasterCoin;
    });

    // Log analytics for reward claims
    if (selectedGameMode === 'flip') {
      await analyticsService.logFlipRewardClaimed(giftAmt, 'success');
    } else if (selectedGameMode === 'daily') {
      await analyticsService.logDailyRewardClaimed(giftAmt);
    }

    // Show interstitial ad after opening 4 cards in Flip & Win
    if (selectedGameMode === 'flip' && flippedCount >= MAX_FLIPS) {
      setTimeout(() => {
        console.log('Showing interstitial ad after Flip & Win session');
        multiAdManager.showInterstitial();
      }, 500); // Small delay to ensure modal is closed
    }

    // Show interstitial ad after Daily Bonus collection
    if (selectedGameMode === 'daily') {
      setTimeout(() => {
        multiAdManager.showInterstitial();
      }, 500); // Small delay to ensure modal is closed
    }
  };

  const formatTime = ms => {
    const hours = Math.floor(ms / 3600000); // 1 hour = 3600000 ms
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderCard = ({item, index}) => {
    const handlePress = () => openBox(index);
    const overlayActive = isGiftMining || flippedCount >= MAX_FLIPS;
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.cardContainer,
          {
            opacity: overlayActive ? 0.3 : item.opened ? 0.7 : 1,
            backgroundColor: item.opened ? Colors.grey_300 : Colors.white,
            transform: [{scale: item.opened ? 0.95 : 1}],
          },
        ]}
        disabled={overlayActive || item.opened}
        activeOpacity={0.8}>
        <View style={styles.cardContent}>
          {!item.opened ? (
            <>
              <View style={styles.cardIconContainer}>
                <Image style={styles.cardIcon} source={Images.giftIcon} />
              </View>
              <Text style={styles.cardText}>Tap to open</Text>
            </>
          ) : (
            <>
              <View
                style={[
                  styles.cardIconContainer,
                  {backgroundColor: Colors.secondaryColor},
                ]}>
                <Image
                  style={[styles.cardIcon, {tintColor: Colors.white}]}
                  source={Images.starIcon}
                />
              </View>
              <Text style={styles.cardReward}>{item.value}</Text>
              <Text style={styles.cardLabel}>Coins</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGameMode = ({item}) => (
    <TouchableOpacity
      style={[
        styles.gameModeCard,
        {
          borderColor:
            selectedGameMode === item.id ? item.color : Colors.grey_300,
        },
      ]}
      onPress={() => setSelectedGameMode(item.id)}
      activeOpacity={0.8}>
      <View style={[styles.gameModeIcon, {backgroundColor: item.color + '20'}]}>
        <Image
          source={item.icon}
          style={[styles.gameModeIconImage, {tintColor: item.color}]}
        />
      </View>
      <Text style={styles.gameModeTitle}>{item.title}</Text>
      <Text style={styles.gameModeDesc}>{item.description}</Text>
      <Text style={styles.gameModeReward}>
        {item.minReward}-{item.maxReward} coins
      </Text>
    </TouchableOpacity>
  );

  const selectedGame = gameModes.find(mode => mode.id === selectedGameMode);
  const canClaimDaily =
    !lastDailyClaim || Date.now() - lastDailyClaim >= DAILY_COOLDOWN_MS;
  const dailyTimeRemaining = lastDailyClaim
    ? Math.max(0, DAILY_COOLDOWN_MS - (Date.now() - lastDailyClaim))
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CustomStatusBar dark backgroundColor={Colors.semiGray} />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => props.navigation.navigate('HelpScreen')}>
            <Image style={styles.helpIcon} source={Images.Question} />
          </TouchableOpacity>
        </View>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <Image style={[styles.headerIcon]} source={Images.presentIcon} />
            <Text style={styles.title}>Play & Earn</Text>
          </View>
          <Text style={styles.subtitle}>
            Play fun games and earn Super Coins instantly!
          </Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Your Balance</Text>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('ConvertCoinScreen')}
              style={styles.convertButton}>
              <Text style={styles.convertButtonText}>Convert</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.balanceAmount}>
            <Image style={styles.balanceIcon} source={Images.starIcon} />
            <Text style={styles.balanceValue}>
              {masterCoin.toLocaleString()}
            </Text>
            <Text style={styles.balanceLabel}>Super Coins</Text>
          </View>
        </View>

        {/* Game Modes */}
        <View style={styles.gameModesSection}>
          <Text style={styles.sectionTitle}>Choose Game Mode</Text>
          <FlatList
            data={gameModes}
            renderItem={renderGameMode}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gameModesContainer}
          />
        </View>

        {/* Game Area */}
        <View style={styles.gameSection}>
          <View style={styles.gameHeader}>
            <Text style={styles.gameTitle}>{selectedGame.title}</Text>
            {selectedGame.id === 'flip' && isGiftMining && (
              <View style={styles.timerContainer}>
                <Image source={Images.Hourglass} style={styles.timerIcon} />
                <Text style={styles.timerText}>
                  {formatTime(giftTimeRemaining)}
                </Text>
              </View>
            )}
            {selectedGame.id === 'daily' && !canClaimDaily && (
              <View style={styles.timerContainer}>
                <Image source={Images.Hourglass} style={styles.timerIcon} />
                <Text style={styles.timerText}>
                  {formatTime(dailyTimeRemaining)}
                </Text>
              </View>
            )}
          </View>

          {selectedGame.id === 'flip' ? (
            <>
              {/* Game Status */}
              <View style={styles.gameStatus}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Attempts</Text>
                  <Text
                    style={
                      styles.statusValue
                    }>{`${flippedCount}/${MAX_FLIPS}`}</Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Reward Range</Text>
                  <Text style={styles.statusValue}>
                    {selectedGame.minReward}-{selectedGame.maxReward}
                  </Text>
                </View>
              </View>

              {/* Cards Grid */}
              <View style={[styles.cardsSection, {position: 'relative'}]}>
                <FlatList
                  data={list}
                  renderItem={renderCard}
                  numColumns={2}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.cardsGrid}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.cardRow}
                />
                {(isGiftMining || flippedCount >= MAX_FLIPS) && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: verticalScale(15),
                    }}>
                    <Text
                      style={{
                        color: Colors.white,
                        fontWeight: '600',
                        marginBottom: verticalScale(6),
                      }}>
                      Come back later to play again
                    </Text>
                    {isGiftMining && (
                      <View style={styles.timerContainer}>
                        <Image
                          source={Images.Hourglass}
                          style={styles.timerIcon}
                        />
                        <Text style={styles.timerText}>
                          {formatTime(giftTimeRemaining)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Game Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>How to Play:</Text>
                <Text style={styles.instructionsText}>
                  • Tap on any card to reveal your reward
                </Text>
                <Text style={styles.instructionsText}>
                  • You can flip {MAX_FLIPS} cards per session
                </Text>
                <Text style={styles.instructionsText}>
                  • Wait 30 minutes between sessions
                </Text>
                <Text style={styles.instructionsText}>
                  • Higher rewards available in other game modes
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Daily Bonus UI - styled grid like shared design */}
              <View style={{marginBottom: verticalScale(16)}}>
                <View style={styles.dailyGrid}>
                  {dailyRewards.map((amount, i) => {
                    const collected = i < dailyDayIndex;
                    const isToday = i === dailyDayIndex;
                    const disabled =
                      collected ||
                      i > dailyDayIndex ||
                      (isToday && !canClaimDaily);
                    return (
                      <TouchableOpacity
                        key={`day-${i}`}
                        activeOpacity={0.9}
                        disabled={disabled}
                        onPress={async () => {
                          if (!(isToday && canClaimDaily)) return;
                          const reward = amount;
                          setMasterCoin(prev => {
                            const total = prev + reward;
                            AsyncStorage.setItem(
                              'masterCoin',
                              total.toString(),
                            );
                            return total;
                          });
                          const nextDay = (dailyDayIndex + 1) % 7;
                          setDailyDayIndex(nextDay);
                          const now = Date.now();
                          setLastDailyClaim(now);
                          await AsyncStorage.setItem(
                            'dailyDayIndex',
                            nextDay.toString(),
                          );
                          await AsyncStorage.setItem(
                            'lastDailyClaim',
                            now.toString(),
                          );
                          setIsVisible(true);
                          setGiftAmt(reward);
                        }}
                        style={[
                          styles.dailyCard,
                          {
                            backgroundColor: Colors.white,
                            borderColor: collected
                              ? Colors.semiGray
                              : Colors.primaryColor,
                            opacity: disabled && !isToday ? 0.7 : 1,
                          },
                        ]}>
                        <Image
                          source={Images.starIcon}
                          style={styles.dailyStarIcon}
                        />
                        <Text style={styles.dailyValue}>{amount}</Text>
                        <Text style={styles.dailyLabel}>Super Coin</Text>
                        <View
                          style={[
                            styles.dailyBadge,
                            {
                              backgroundColor: collected
                                ? Colors.grey_400
                                : isToday && canClaimDaily
                                ? Colors.primaryColor
                                : Colors.grey_300,
                            },
                          ]}>
                          <Text
                            style={{
                              color: collected
                                ? Colors.white
                                : isToday && canClaimDaily ? Colors.white : Colors.semiBlack,
                              fontWeight: '700',
                              fontSize: verticalScale(10),
                            }}>
                            DAY {i + 1}
                          </Text>
                        </View>
                        {collected && (
                          <View style={styles.dailyCheckBadge}>
                            <Image
                              source={Images.Tick}
                              style={styles.dailyCheckIcon}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Daily Bonus Rules:</Text>
                <Text style={styles.instructionsText}>
                  • One claim every 24 hours
                </Text>
                <Text style={styles.instructionsText}>
                  • Rewards for 7 consecutive days
                </Text>
                <Text style={styles.instructionsText}>
                  • Cycle repeats after Day 7
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <Popup
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        btnText={'Claim Your Reward'}
        image={Images.presentIcon}
        text1={'Congratulations!'}
        text2={'You won super coins! Keep playing to earn more rewards.'}
        text3={`You won ${giftAmt} super coins`}
        onPress={claimReward}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.semiGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: horizontalScale(1),
    paddingTop: verticalScale(10),
  },
  helpButton: {
    backgroundColor: Colors.white,
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: verticalScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpIcon: {
    width: verticalScale(20),
    height: verticalScale(20),
    resizeMode: 'contain',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  headerSection: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(25),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  headerIcon: {
    width: verticalScale(35),
    height: verticalScale(35),
    marginRight: horizontalScale(10),
    // tintColor: Colors.primaryColor,
    resizeMode: 'contain',
  },
  title: {
    fontSize: verticalScale(28),
    fontWeight: 'bold',
    color: Colors.black,
  },
  subtitle: {
    fontSize: verticalScale(14),
    color: Colors.grey_500,
    textAlign: 'center',
    paddingHorizontal: horizontalScale(20),
    lineHeight: verticalScale(20),
  },
  balanceCard: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(20),
    padding: verticalScale(20),
    marginBottom: verticalScale(25),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  balanceTitle: {
    fontSize: verticalScale(16),
    fontWeight: '600',
    color: Colors.black,
  },
  convertButton: {
    backgroundColor: Colors.secondaryColor,
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(8),
    borderRadius: verticalScale(15),
  },
  convertButtonText: {
    fontSize: verticalScale(12),
    fontWeight: '600',
    color: Colors.white,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceIcon: {
    width: verticalScale(30),
    height: verticalScale(30),
    marginRight: horizontalScale(10),
    resizeMode: 'contain',
  },
  balanceValue: {
    fontSize: verticalScale(32),
    fontWeight: 'bold',
    color: Colors.black,
    marginRight: horizontalScale(8),
  },
  balanceLabel: {
    fontSize: verticalScale(16),
    color: Colors.grey_500,
    marginTop: verticalScale(8),
  },
  gameModesSection: {
    marginBottom: verticalScale(25),
  },
  sectionTitle: {
    fontSize: verticalScale(18),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(15),
  },
  gameModesContainer: {
    paddingHorizontal: horizontalScale(5),
  },
  gameModeCard: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(15),
    marginRight: horizontalScale(12),
    width: horizontalScale(140),
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gameModeIcon: {
    width: verticalScale(50),
    height: verticalScale(50),
    borderRadius: verticalScale(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(10),
  },
  gameModeIconImage: {
    width: verticalScale(25),
    height: verticalScale(25),
    resizeMode: 'contain',
  },
  gameModeTitle: {
    fontSize: verticalScale(14),
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: verticalScale(4),
  },
  gameModeDesc: {
    fontSize: verticalScale(11),
    color: Colors.grey_500,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  gameModeReward: {
    fontSize: verticalScale(12),
    fontWeight: '600',
    color: Colors.secondaryColor,
    textAlign: 'center',
  },
  gameSection: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(20),
    padding: verticalScale(20),
    marginBottom: verticalScale(100),
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  gameTitle: {
    fontSize: verticalScale(20),
    fontWeight: 'bold',
    color: Colors.black,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgColor,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: verticalScale(15),
  },
  timerIcon: {
    width: verticalScale(16),
    height: verticalScale(16),
    marginRight: horizontalScale(6),
    tintColor: Colors.secondaryColor,
    resizeMode: 'contain',
  },
  timerText: {
    fontSize: verticalScale(12),
    fontWeight: '600',
    color: Colors.secondaryColor,
  },
  gameStatus: {
    flexDirection: 'row',
    backgroundColor: Colors.bgColor,
    borderRadius: verticalScale(15),
    padding: verticalScale(15),
    marginBottom: verticalScale(25),
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    marginBottom: verticalScale(4),
  },
  statusValue: {
    fontSize: verticalScale(16),
    fontWeight: 'bold',
    color: Colors.black,
  },
  statusDivider: {
    width: 1,
    backgroundColor: Colors.grey_300,
    marginHorizontal: horizontalScale(15),
  },
  cardsSection: {
    marginBottom: verticalScale(25),
  },
  cardsGrid: {
    alignItems: 'center',
  },
  cardRow: {
    justifyContent: 'space-between',
    marginBottom: verticalScale(15),
  },
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    width: '48%',
    aspectRatio: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.grey_300,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: verticalScale(15),
  },
  cardIconContainer: {
    width: verticalScale(50),
    height: verticalScale(50),
    borderRadius: verticalScale(25),
    backgroundColor: Colors.primaryColor + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(10),
  },
  cardIcon: {
    width: verticalScale(25),
    height: verticalScale(25),
    tintColor: Colors.primaryColor,
    resizeMode: 'contain',
  },
  cardText: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    textAlign: 'center',
  },
  cardReward: {
    fontSize: verticalScale(20),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(2),
  },
  cardLabel: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
  },
  instructionsContainer: {
    backgroundColor: Colors.bgColor,
    borderRadius: verticalScale(15),
    padding: verticalScale(15),
  },
  dailyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dailyCard: {
    width: '31%',
    borderRadius: verticalScale(12),
    marginBottom: verticalScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(8),
    borderWidth: 1,
    position: 'relative',
    alignItems: 'center',
  },
  dailyStarIcon: {
    width: verticalScale(16),
    height: verticalScale(16),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  dailyValue: {
    fontSize: verticalScale(16),
    fontWeight: '700',
    color: Colors.primaryColor,
    marginTop: verticalScale(10),
  },
  dailyLabel: {
    fontSize: verticalScale(10),
    color: Colors.grey_400,
    marginBottom: verticalScale(10),
  },
  dailyBadge: {
    paddingVertical: verticalScale(6),
    borderRadius: verticalScale(12),
    alignItems: 'center',
    width: '100%',
  },
  dailyCheckBadge: {
    position: 'absolute',
    top: verticalScale(8),
    left: verticalScale(8),
    backgroundColor: Colors.primaryColor,
    borderRadius: verticalScale(10),
    padding: verticalScale(2),
  },
  dailyCheckIcon: {
    width: verticalScale(14),
    height: verticalScale(14),
    tintColor: Colors.white,
    resizeMode: 'contain',
  },
  instructionsTitle: {
    fontSize: verticalScale(14),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: verticalScale(10),
  },
  instructionsText: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    marginBottom: verticalScale(4),
    lineHeight: verticalScale(16),
  },
});
