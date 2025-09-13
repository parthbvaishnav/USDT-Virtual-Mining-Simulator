import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Colors} from '../../constants/colors';
import {horizontalScale, verticalScale} from '../../constants/helper';
import {Images} from '../../assets/images';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {showToast} from '../../utils/toastUtils';
import analyticsService from '../../services/analyticsService';
import {useAuth} from '../../context/AuthContext';

export default function ConvertCoinScreen(props) {
  const navigation = useNavigation();
  const {updateUserData} = useAuth();
  const [masterCoin, setMasterCoin] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [conversionRate] = useState(0.00006); // 1 Super Coin = 0.0006 USDT
  const [minimumCoins] = useState(2500);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [history, setHistory] = useState([
    {
      id: 1,
      date: '11 Feb, 2024',
      usdt: '0.28',
      coins: '467',
      status: 'completed',
    },
    {
      id: 2,
      date: '13 Feb, 2024',
      usdt: '0.51',
      coins: '850',
      status: 'completed',
    },
    {
      id: 3,
      date: '15 Feb, 2024',
      usdt: '0.68',
      coins: '1133',
      status: 'completed',
    },
  ]);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', async () => {
      // Log screen view analytics
      await analyticsService.logScreenView('ConvertCoinScreen');
      
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

  const convertableAmount = masterCoin * conversionRate;
  const canConvert = masterCoin >= minimumCoins;

  const handleConvert = async () => {
    if (!canConvert) {
      showToast.error(
        'Insufficient Coins',
        `You need at least ${minimumCoins} Super Coins to convert. You currently have ${masterCoin} coins.`,
      );
      return;
    }

    setShowConfirmation(true);
  };

  const confirmConversion = async () => {
    try {
      // Add to total mine
      console.log('Convertable Amount:', convertableAmount);
      const newTotalEarned = totalEarned + masterCoin;
      console.log('New Total Earned:', newTotalEarned);
      setTotalEarned(newTotalEarned);
      await AsyncStorage.setItem('totalEarned', newTotalEarned.toString());

      // Update user data in context
      await updateUserData({
        coin: 0,
        mine: newTotalEarned
      });

      // Reset master coins
      setMasterCoin(0);
      await AsyncStorage.setItem('masterCoin', '0');

      // Log coin conversion analytics
      await analyticsService.logCoinConversion(masterCoin, convertableAmount);

      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        usdt: convertableAmount.toFixed(4),
        coins: masterCoin.toString(),
        status: 'completed',
      };
      setHistory(prev => [newHistoryItem, ...prev]);

      setShowConfirmation(false);
      showToast.success('Success', 'Coins converted successfully!');
    } catch (error) {
      showToast.error('Error', 'Failed to convert coins. Please try again.');
    }
  };

  const renderHistoryItem = ({item}) => {
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyLeft}>
          <View style={styles.historyIcon}>
            <Image
              source={Images.convertCoinIcon}
              style={styles.historyIconImage}
            />
          </View>
          <View>
            <Text style={styles.historyDate}>{item.date}</Text>
            <Text style={styles.historyCoins}>{item.coins} Super Coins</Text>
          </View>
        </View>
        <View style={styles.historyRight}>
          <Text style={styles.historyUsdt}>{item.usdt} USDT</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'completed'
                    ? Colors.lightGreen
                    : Colors.lightRed,
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === 'completed'
                      ? Colors.darkGreen
                      : Colors.darkRed,
                },
              ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header ishelp={true} />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Image style={styles.convertIcon} source={Images.convertCoinIcon} />
          </View>
          <Text style={styles.title}>Convert Super Coins</Text>
          <Text style={styles.subtitle}>
            Convert your collected reward points into crypto coins
          </Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Available Balance</Text>
            <View style={styles.rateContainer}>
              <Text style={styles.rateText}>
                Rate: 1 Coin = {conversionRate} USDT
              </Text>
            </View>
          </View>

          <View style={styles.conversionContainer}>
            <View style={styles.coinSection}>
              <Text style={styles.coinLabel}>Super Coins</Text>
              <Text style={styles.coinValue}>
                {masterCoin.toLocaleString()}
              </Text>
            </View>

            <View style={styles.arrowContainer}>
              <Image source={Images.rePostIcon} style={styles.arrowIcon} />
            </View>

            <View style={styles.usdtSection}>
              <Text style={styles.usdtLabel}>USDT</Text>
              <Text style={styles.usdtValue}>
                {convertableAmount.toFixed(4)}
              </Text>
            </View>
          </View>

          {/* Convert Button */}
          <TouchableOpacity
            style={[styles.convertButton, {opacity: canConvert ? 1 : 0.5}]}
            onPress={handleConvert}
            disabled={!canConvert}>
            <Text style={styles.convertButtonText}>
              {canConvert ? 'Convert Now' : 'Insufficient Coins'}
            </Text>
          </TouchableOpacity>

          {/* Minimum Requirement */}
          <View style={styles.requirementContainer}>
            <Image source={Images.Info} style={styles.infoIcon} />
            <Text style={styles.requirementText}>
              Minimum {minimumCoins.toLocaleString()} Super Coins required to
              convert
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalEarned.toFixed(4)}</Text>
            <Text style={styles.statLabel}>Total Mine</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>Conversions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{conversionRate}</Text>
            <Text style={styles.statLabel}>Current Rate</Text>
          </View>
        </View> */}

        {/* History Section */}
        {/* <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Conversion History</Text>
          {history.length > 0 ? (
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyHistory}>
              <Image source={Images.convertCoinIcon} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No conversions yet</Text>
              <Text style={styles.emptySubtext}>
                Start earning Super Coins to make your first conversion
              </Text>
            </View>
          )}
        </View> */}
      </ScrollView>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Confirm Conversion</Text>
            <Text style={styles.confirmationMessage}>
              Convert {masterCoin.toLocaleString()} Super Coins to{' '}
              {convertableAmount.toFixed(4)} USDT?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.convertConfirmButton]}
                onPress={confirmConversion}>
                <Text style={styles.convertConfirmButtonText}>Convert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  headerSection: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  iconContainer: {
    width: verticalScale(100),
    height: verticalScale(100),
    borderRadius: verticalScale(50),
    backgroundColor: Colors.secondaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
    shadowColor: Colors.secondaryColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  convertIcon: {
    width: verticalScale(50),
    height: verticalScale(50),
    tintColor: Colors.white,
    resizeMode: 'contain',
  },
  title: {
    fontSize: verticalScale(24),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: verticalScale(14),
    color: Colors.grey_500,
    textAlign: 'center',
    lineHeight: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
  },
  balanceCard: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(20),
    padding: verticalScale(25),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  balanceTitle: {
    fontSize: verticalScale(18),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: verticalScale(8),
  },
  rateContainer: {
    backgroundColor: Colors.bgColor,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: verticalScale(12),
  },
  rateText: {
    fontSize: verticalScale(12),
    color: Colors.secondaryColor,
    fontWeight: '500',
  },
  conversionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(25),
  },
  coinSection: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
    borderRadius: verticalScale(15),
    padding: verticalScale(20),
    alignItems: 'center',
  },
  coinLabel: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    marginBottom: verticalScale(8),
    fontWeight: '500',
  },
  coinValue: {
    fontSize: verticalScale(20),
    fontWeight: 'bold',
    color: Colors.black,
  },
  arrowContainer: {
    backgroundColor: Colors.grey_300,
    borderRadius: verticalScale(25),
    width: verticalScale(50),
    height: verticalScale(50),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: horizontalScale(15),
  },
  arrowIcon: {
    width: verticalScale(20),
    height: verticalScale(20),
    resizeMode: 'contain',
    transform: [{rotate: '90deg'}],
    tintColor: Colors.grey_500,
  },
  usdtSection: {
    flex: 1,
    backgroundColor: Colors.secondaryColor,
    borderRadius: verticalScale(15),
    padding: verticalScale(20),
    alignItems: 'center',
  },
  usdtLabel: {
    fontSize: verticalScale(12),
    color: Colors.white,
    marginBottom: verticalScale(8),
    fontWeight: '500',
  },
  usdtValue: {
    fontSize: verticalScale(20),
    fontWeight: 'bold',
    color: Colors.white,
  },
  convertButton: {
    backgroundColor: Colors.primaryColor,
    borderRadius: verticalScale(15),
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  convertButtonText: {
    fontSize: verticalScale(16),
    fontWeight: '600',
    color: Colors.white,
  },
  requirementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgColor,
    borderRadius: verticalScale(10),
    padding: verticalScale(12),
  },
  infoIcon: {
    width: verticalScale(16),
    height: verticalScale(16),
    marginRight: horizontalScale(8),
    resizeMode: 'contain',
  },
  requirementText: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    textAlign: 'center',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(20),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: verticalScale(18),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.grey_300,
    marginHorizontal: horizontalScale(15),
  },
  historySection: {
    marginBottom: verticalScale(100),
  },
  historyTitle: {
    fontSize: verticalScale(18),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(15),
  },
  historyItem: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(15),
    marginBottom: verticalScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: verticalScale(20),
    backgroundColor: Colors.bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(12),
  },
  historyIconImage: {
    width: verticalScale(20),
    height: verticalScale(20),
    tintColor: Colors.secondaryColor,
    resizeMode: 'contain',
  },
  historyDate: {
    fontSize: verticalScale(14),
    fontWeight: '500',
    color: Colors.black,
    marginBottom: verticalScale(2),
  },
  historyCoins: {
    fontSize: verticalScale(12),
    color: Colors.grey_500,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyUsdt: {
    fontSize: verticalScale(16),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(4),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: verticalScale(8),
  },
  statusText: {
    fontSize: verticalScale(10),
    fontWeight: '600',
  },
  emptyHistory: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(15),
    padding: verticalScale(40),
    alignItems: 'center',
  },
  emptyIcon: {
    width: verticalScale(60),
    height: verticalScale(60),
    tintColor: Colors.grey_400,
    marginBottom: verticalScale(15),
    resizeMode: 'contain',
  },
  emptyText: {
    fontSize: verticalScale(16),
    fontWeight: '500',
    color: Colors.grey_500,
    marginBottom: verticalScale(8),
  },
  emptySubtext: {
    fontSize: verticalScale(14),
    color: Colors.grey_400,
    textAlign: 'center',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    backgroundColor: Colors.white,
    borderRadius: verticalScale(20),
    padding: verticalScale(25),
    marginHorizontal: horizontalScale(30),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationTitle: {
    fontSize: verticalScale(20),
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: verticalScale(15),
  },
  confirmationMessage: {
    fontSize: verticalScale(14),
    color: Colors.grey_500,
    textAlign: 'center',
    marginBottom: verticalScale(25),
    lineHeight: verticalScale(20),
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: horizontalScale(15),
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: verticalScale(10),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.grey_300,
  },
  cancelButtonText: {
    fontSize: verticalScale(14),
    fontWeight: '600',
    color: Colors.grey_500,
  },
  convertConfirmButton: {
    backgroundColor: Colors.secondaryColor,
  },
  convertConfirmButtonText: {
    fontSize: verticalScale(14),
    fontWeight: '600',
    color: Colors.white,
  },
});
