import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../../constants/colors';
import CustomStatusBar from '../../components/CustomStatusBar';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import {horizontalScale, verticalScale} from '../../constants/helper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useAuth} from '../../context/AuthContext';
import {showToast} from '../../utils/toastUtils';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginScreen({navigation}) {
  const {login} = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async values => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        showToast.success('Success', 'Login successful!');
        navigation.replace('BottomTab');
      } else {
        showToast.error('Error', result.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast.error(
        'Error',
        'An unexpected error occurred. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('SignupScreen');
  };

  return (
    <>
      <CustomStatusBar dark backgroundColor={Colors.white} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>
              Sign in to continue your mining journey
            </Text>
          </View>

          <Formik
            initialValues={{email: '', password: ''}}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                {/* Email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <InputField
                    placeholder="Enter your email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    errorTitle={
                      errors.email && touched.email ? errors.email : ''
                    }
                  />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <InputField
                    placeholder="Enter your password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry={!showPassword}
                    errorTitle={
                      errors.password && touched.password ? errors.password : ''
                    }
                  />
                </View>

                {/* Login Button */}
                <View style={styles.buttonContainer}>
                  <Button
                    title="Sign In"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={{
                      backgroundColor: loading
                        ? Colors.primaryColor + '80'
                        : Colors.primaryColor,
                      paddingVertical: verticalScale(15),
                      borderRadius: verticalScale(30),
                      alignItems: 'center',
                    }}
                  />
                </View>

                {/* Signup Link */}
                <Text style={styles.signupText}>
                  Don't have an account?{' '}
                  <Text style={styles.signupLink} onPress={navigateToSignup}>
                    Sign Up
                  </Text>
                </Text>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  scrollContent: {flexGrow: 1, paddingHorizontal: horizontalScale(20)},
  headerContainer: {
    marginTop: verticalScale(60),
    marginBottom: verticalScale(40),
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: verticalScale(32),
    fontWeight: 'bold',
    color: Colors.primaryColor,
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
  subtitleText: {
    fontSize: verticalScale(16),
    color: Colors.shadeGrey,
    textAlign: 'center',
    lineHeight: verticalScale(24),
  },
  formContainer: {flex: 1},
  inputLabel: {
    fontSize: verticalScale(16),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: verticalScale(5),
  },
  forgotPasswordText: {
    fontSize: verticalScale(14),
    color: Colors.primaryColor,
    fontWeight: '500',
    alignSelf: 'flex-end',
    marginBottom: verticalScale(20),
  },
  buttonContainer: {marginBottom: verticalScale(30)},
  signupText: {
    fontSize: verticalScale(16),
    color: Colors.shadeGrey,
    textAlign: 'center',
  },
  signupLink: {
    color: Colors.primaryColor,
    fontWeight: '600',
  },
});
