import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';
import * as Animatable from 'react-native-animatable';
import {useAuth} from '../../context/AuthContext';
import {Colors} from '../../constants/colors';
import CustomStatusBar from '../../components/CustomStatusBar';
import {horizontalScale, verticalScale} from '../../constants/helper';
import {Images} from '../../assets/images';

const {width} = Dimensions.get('window');

export default function OnBoardingScreen(props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {completeOnboarding: completeOnboardingAuth} = useAuth();

  const completeOnboarding = async () => {
    try {
      await completeOnboardingAuth();
      props.navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      props.navigation.navigate('LoginScreen');
    }
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
  };

  const list = [
    {
      image: Images.onboardScreen1,
      title1: '',
      title2: 'Welcome to',
      title3: 'MTC Mining',
      desc: 'Experience the future of digital mining with our advanced simulation platform. Start your journey to financial freedom today.',
    },
    {
      image: Images.onboardScreen2,
      title1: 'Refer &',
      title2: 'Earn',
      title3: 'Together',
      desc: 'Invite your friends and grow your network. Every referral brings you closer to building your digital empire.',
    },
    {
      image: Images.onboardScreen3,
      title1: 'Build Your',
      title2: 'Digital',
      title3: 'Fortune',
      desc: 'Transform your mining dreams into reality. Our platform provides the tools you need to succeed.',
    },
    {
      image: Images.onboardScreen4,
      title1: 'Start',
      title2: 'Mining',
      title3: 'Today',
      desc: 'Join thousands of users who are already mining their way to success. Your digital future starts now.',
    },
  ];

  const Slider = () => {
    return (
      <View style={styles.container}>
        <Animatable.Text
          animation="fadeInRight"
          duration={1000}
          style={styles.skipText}
          key={`skip-${currentIndex}`}
          onPress={skipOnboarding}>
          Skip
        </Animatable.Text>

        <View style={styles.sliderContainer}>
          <Animatable.Image
            animation="slideInUp"
            duration={1200}
            style={styles.sliderImage}
            source={list[currentIndex].image}
            key={`image-${currentIndex}`}
          />

          <View style={styles.textContainer}>
            <Animatable.Text
              animation="fadeInUp"
              delay={200}
              style={styles.sliderText1}
              key={`title-${currentIndex}`}>
              <Text style={{color: Colors.primaryColor}}>
                {list[currentIndex].title1}
              </Text>
              <Text style={{color: Colors.black}}>
                {' '}
                {list[currentIndex].title2}{' '}
              </Text>
              <Text style={{color: Colors.secondaryColor}}>
                {list[currentIndex].title3}
              </Text>
            </Animatable.Text>

            <Animatable.Text
              animation="fadeInUp"
              delay={400}
              style={styles.descText1}
              key={`desc-${currentIndex}`}>
              {list[currentIndex].desc}
            </Animatable.Text>
          </View>

          {/* Pagination dots */}
          <View style={styles.paginationContainer}>
            {list.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.navigationContainer}>
          <Animatable.View
            animation="bounceIn"
            delay={600}
            key={`prev-button-${currentIndex}`}>
            <TouchableOpacity
              onPress={() => {
                setCurrentIndex(currentIndex - 1);
              }}
              disabled={currentIndex < 1}
              style={[
                styles.navigationButton,
                currentIndex < 1 && styles.navigationButtonDisabled,
              ]}>
              <Image
                style={[
                  styles.navigationIcon,
                  currentIndex < 1 && styles.navigationIconDisabled,
                ]}
                source={Images.lessThanIcon}
              />
            </TouchableOpacity>
          </Animatable.View>
          {currentIndex === 3 ? (
            <Animatable.View
              animation="bounceIn"
              delay={800}
              style={styles.getStartedContainer}>
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={completeOnboarding}>
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
            </Animatable.View>
          ): (
          <Animatable.View
            animation="bounceIn"
            delay={800}
            key={`next-button-${currentIndex}`}>
            <TouchableOpacity
              onPress={() => {
                if (currentIndex < 3) {
                  setCurrentIndex(currentIndex + 1);
                } else {
                  completeOnboarding();
                }
              }}
              style={styles.navigationButtonPrimary}>
              <Image
                style={styles.navigationIconPrimary}
                source={Images.lessThanIcon}
              />
            </TouchableOpacity>
          </Animatable.View>
          )}
        </View>

        {/* Get Started Button for last slide */}
        
      </View>
    );
  };

  return (
    <>
      <CustomStatusBar dark backgroundColor={Colors.white} />
      {Slider()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  sliderText1: {
    fontSize: verticalScale(28),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: verticalScale(36),
  },
  descText1: {
    textAlign: 'center',
    color: Colors.shadeGrey,
    marginTop: verticalScale(15),
    fontSize: verticalScale(16),
    lineHeight: verticalScale(24),
    paddingHorizontal: horizontalScale(20),
  },
  skipText: {
    textAlign: 'center',
    marginRight: horizontalScale(20),
    marginTop: verticalScale(50),
    color: Colors.primaryColor,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(8),
    borderRadius: verticalScale(20),
    overflow: 'hidden',
    fontSize: verticalScale(14),
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  sliderImage: {
    height: verticalScale(300),
    width: verticalScale(300),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  textContainer: {
    marginTop: verticalScale(30),
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(40),
    marginBottom: verticalScale(20),
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.primaryColor,
    width: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(30),
    paddingBottom: verticalScale(50),
  },
  navigationButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    backgroundColor: Colors.borderLight,
    borderRadius: verticalScale(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationButtonDisabled: {
    backgroundColor: Colors.borderLight,
    opacity: 0.5,
  },
  navigationButtonPrimary: {
    height: verticalScale(50),
    width: verticalScale(50),
    backgroundColor: Colors.primaryColor,
    borderRadius: verticalScale(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationIcon: {
    height: verticalScale(20),
    width: verticalScale(20),
    resizeMode: 'contain',
    tintColor: Colors.shadeGrey,
  },
  navigationIconDisabled: {
    tintColor: Colors.borderLight,
  },
  navigationIconPrimary: {
    height: verticalScale(20),
    width: verticalScale(20),
    resizeMode: 'contain',
    tintColor: Colors.white,
    transform: [{rotate: '180deg'}],
  },
  getStartedContainer: {
    // position: 'absolute',
    // bottom: verticalScale(120),
    // left: 0,
    // right: 0,
    // paddingHorizontal: horizontalScale(30),
  },
  getStartedButton: {
    backgroundColor: Colors.secondaryColor,
    paddingVertical: verticalScale(15),
    borderRadius: verticalScale(25),
    alignItems: 'center',
    width: width - horizontalScale(150),
  },
  getStartedText: {
    color: Colors.white,
    fontSize: verticalScale(18),
    fontWeight: '600',
  },
});
