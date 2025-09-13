import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import analyticsService from '../services/analyticsService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has completed onboarding
      const onboardingStatus = await AsyncStorage.getItem('onboardingCompleted');
      setOnboardingCompleted(onboardingStatus === 'true');
      
      // Check if user is logged in and get stored session data
      const storedSession = await AsyncStorage.getItem('userSession');
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        if (sessionData.apiResponse && sessionData.apiResponse.data && sessionData.apiResponse.data.user) {
          setUser(sessionData.apiResponse.data.user);
          setApiResponse(sessionData.apiResponse);
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('https://peradox.in/api/mtc/login', { email, password });

      if (res.data?.status === 'success') {
        const userData = res.data.data.user;
        const sessionData = {
          apiResponse: res.data,
          loginTime: new Date().toISOString()
        };
        let totalMasterCoin = userData?.coin || 0;
        let totalEarned = userData?.mine || 0;
        let dailyDayIndex = userData?.daily_reward || 0;
        // Save session data and user data
        await AsyncStorage.setItem('userSession', JSON.stringify(sessionData));
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('masterCoin', totalMasterCoin.toString());
      await AsyncStorage.setItem('totalEarned', totalEarned.toString());
        await AsyncStorage.setItem('dailyDayIndex', dailyDayIndex.toString());
        
        setUser(userData);
        setApiResponse(res.data);
        setIsLoggedIn(true);
        
        // Log login analytics
        await analyticsService.logLogin('email');
        await analyticsService.setUserProperties(userData.id.toString(), {
          user_name: userData.name,
          user_email: userData.email,
          is_verified: userData.is_verified ? 'true' : 'false',
          social_type: userData.social_type || 'email'
        });
        
        await completeOnboarding();
        return { success: true };
      } else {
        return { success: false, message: res.data?.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login API error:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const signup = async (name, email, password, refer_code) => {
    try {
      const payload = { name, email, password };
      if (refer_code) payload.refer_code = refer_code;

      const res = await axios.post('https://peradox.in/api/mtc/register', payload);

      if (res.data?.status === 'success') {
        const userData = res.data.data.user;
        const sessionData = {
          apiResponse: res.data,
          signupTime: new Date().toISOString()
        };
        
        // Save session data and user data
        await AsyncStorage.setItem('userSession', JSON.stringify(sessionData));
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setApiResponse(res.data);
        setIsLoggedIn(true);
        
        // Log signup analytics
        await analyticsService.logSignUp('email');
        await analyticsService.setUserProperties(userData.id.toString(), {
          user_name: userData.name,
          user_email: userData.email,
          is_verified: userData.is_verified ? 'true' : 'false',
          social_type: userData.social_type || 'email',
          refer_code: refer_code || 'none'
        });
        
        await completeOnboarding();
        return { success: true };
      } else {
        return { success: false, message: res.data?.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup API error:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const logout = async () => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      const sessionUserData = await AsyncStorage.getItem('userData');
      const userData = session ? JSON.parse(session) : null;
      const userDataParse = sessionUserData ? JSON.parse(sessionUserData) : null;

      if (!userData || !userData.apiResponse) {
        console.log('No valid session found');
        return;
      }
      console.log('Logging out userDataParse:', userDataParse);
      const user = userData.apiResponse.data.user;
      console.log('Logging out user:', user);
      let mine = 0;
      let coin = 0;
      let daily_reward = 0;
      const storedEarnings = await AsyncStorage.getItem('totalEarned');
      if (storedEarnings) {
        mine = parseFloat(storedEarnings);
      }
      const totalMasterCoin = await AsyncStorage.getItem('masterCoin');
      if (totalMasterCoin) {
        coin = parseFloat(totalMasterCoin);
      }

      const storedDay = await AsyncStorage.getItem('dailyDayIndex');
      if(storedDay){
       daily_reward = parseInt(storedDay, 10)
      }
      const body = {
        user_id: user.id,
        is_active: 1,
        coin: coin,
        mine: mine,
        daily_reward: daily_reward,
      };
      console.log('Logout API body:', body);

      const response = await axios.post(
        'https://peradox.in/api/mtc/saveData',
        body,
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Logout API response:', response.data);
      if (response.data.status === 'success') {
        // Clear user data and session
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userSession');
        await AsyncStorage.removeItem('masterCoin');
        await AsyncStorage.removeItem('dailyDayIndex');
        await AsyncStorage.removeItem('totalEarned');
        setUser(null);
        setApiResponse(null);
        setIsLoggedIn(false);
        console.log('User logged out successfully');
      } else {
        console.log('API Failed:', response.data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setOnboardingCompleted(true);
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };
  const updateUserData = async (updates) => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Update stored session data
      const storedSession = await AsyncStorage.getItem('userSession');
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        sessionData.apiResponse.data.user = updatedUser;
        await AsyncStorage.setItem('userSession', JSON.stringify(sessionData));
        setApiResponse(sessionData.apiResponse);
      }
      
      // Update individual storage items if they exist in updates
      if (updates.coin !== undefined) {
        await AsyncStorage.setItem('masterCoin', updates.coin.toString());
      }
      if (updates.mine !== undefined) {
        await AsyncStorage.setItem('totalEarned', updates.mine.toString());
      }
      
    } catch (error) {
      console.error('Update user data error:', error);
    }
  };

  const getInitialRoute = () => {
      if (isLoading) {
        return 'SplashScreen';
      }

      if (!onboardingCompleted) {
        return 'OnBoardingScreen';
      }

      if (!isLoggedIn) {
        return 'LoginScreen';
      }

      return 'BottomTab';
    };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        onboardingCompleted,
        apiResponse,
        login,
        signup,
        logout,
        completeOnboarding,
        updateUserData,
        getInitialRoute,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
