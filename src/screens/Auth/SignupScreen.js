import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {Colors} from '../../constants/colors';
import {horizontalScale, verticalScale} from '../../constants/helper';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import CustomStatusBar from '../../components/CustomStatusBar';
import {useAuth} from '../../context/AuthContext';
import {showToast} from '../../utils/toastUtils';

const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  refer_code: Yup.string(),
});

export default function SignupScreen({navigation}) {
  const {signup} = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async values => {
    setLoading(true);
    const res = await signup(
      values.name,
      values.email,
      values.password,
      values.refer_code,
    );
    setLoading(false);

    if (res.success) {
      showToast.success('Success', 'Signup successful!');
      navigation.navigate('BottomTab');
    } else {
      showToast.error('Error', res.message);
    }
  };
  const navigateToLogin = () => {
    navigation.navigate('LoginScreen');
  };

  return (
    <>
      <CustomStatusBar dark backgroundColor={Colors.white} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              Join the mining revolution today
            </Text>
          </View>

          <Formik
            initialValues={{name: '', email: '', password: '', refer_code: ''}}
            validationSchema={SignupSchema}
            onSubmit={handleSignup}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <InputField
                    placeholder="Enter your name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    errorTitle={errors.name && touched.name ? errors.name : ''}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
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

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password *</Text>
                  <InputField
                    placeholder="Create a password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry={!showPassword}
                    rightIcon={showPassword ? 'eye-off' : 'eye'}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    errorTitle={
                      errors.password && touched.password ? errors.password : ''
                    }
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Referral Code</Text>
                  <InputField
                    placeholder="Enter referral code (optional)"
                    value={values.refer_code}
                    onChangeText={handleChange('refer_code')}
                    onBlur={handleBlur('refer_code')}
                    errorTitle={
                      errors.refer_code && touched.refer_code
                        ? errors.refer_code
                        : ''
                    }
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Create Account"
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
                  <Text style={styles.loginText}>
                    Already have an account?{' '}
                    <Text style={styles.loginLink} onPress={navigateToLogin}>
                      Sign In
                    </Text>
                  </Text>
                  {/* <Button title="Create Account" onPress={handleSubmit} loading={loading} /> */}
                </View>
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
    marginBottom: verticalScale(30),
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
  inputContainer: {},
  inputLabel: {
    fontSize: verticalScale(16),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: verticalScale(5),
  },
  termsContainer: {marginBottom: verticalScale(20)},
  termsText: {
    fontSize: verticalScale(14),
    color: Colors.shadeGrey,
    textAlign: 'center',
    lineHeight: verticalScale(20),
  },
  termsLink: {color: Colors.primaryColor, fontWeight: '500'},
  buttonContainer: {marginBottom: verticalScale(20)},
  loginText: {
    fontSize: verticalScale(16),
    color: Colors.shadeGrey,
    textAlign: 'center',
    marginVertical: verticalScale(30),
  },
  loginLink: {color: Colors.primaryColor, fontWeight: '600'},
});
