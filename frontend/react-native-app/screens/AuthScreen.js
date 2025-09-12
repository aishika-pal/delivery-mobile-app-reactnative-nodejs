import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList, Modal, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithCredential, PhoneAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

function getSyntheticEmail(phone, countryCode) {
  return `${countryCode}${phone}@phoneuser.app`;
}

export default function AuthScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState('login'); // 'login', 'signup', 'loginOtp', 'forgot', 'reset'
  const [countryCodes, setCountryCodes] = useState([]);
  const [countryModal, setCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ name: 'India', code: '+91', flag: '🇮🇳' });

  // Shared
  const [otpTimer, setOtpTimer] = useState(0);
  useEffect(() => {
    let interval;
    if (otpTimer > 0) interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Fetch country codes on mount
  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all');
        const data = await res.json();
        const codes = data
          .filter(c => c.idd?.root && c.idd?.suffixes && c.name?.common)
          .map(c => ({
            name: c.name.common,
            code: `${c.idd.root}${c.idd.suffixes[0]}`,
            flag: c.flag || '',
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountryCodes(codes);
        const india = codes.find(c => c.code === '+91');
        if (india) setSelectedCountry(india);
      } catch (error) {
        console.error('Failed to fetch country codes:', error);
      }
    };
    fetchCountryCodes();
  }, []);

  // --- SIGN UP STATE ---
  const [signupRole, setSignupRole] = useState('customer');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // OTP for sign up
  const [signupPhoneOTPSent, setSignupPhoneOTPSent] = useState(false);
  const [signupPhoneOTP, setSignupPhoneOTP] = useState('');
  const [signupPhoneVerified, setSignupPhoneVerified] = useState(false);
  const [signupPhoneVerificationId, setSignupPhoneVerificationId] = useState('');
  const [signupEmailOTP, setSignupEmailOTP] = useState('');
  const [signupEmailOTPSent, setSignupEmailOTPSent] = useState(false);
  const [signupEmailVerified, setSignupEmailVerified] = useState(false);
  const [signupEmailVerificationId, setSignupEmailVerificationId] = useState('');

  // --- LOGIN STATE ---
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // --- LOGIN OTP STATE (NEW) ---
  const [loginPhoneOTP, setLoginPhoneOTP] = useState('');
  const [loginPhoneOTPSent, setLoginPhoneOTPSent] = useState(false);
  const [loginPhoneVerificationId, setLoginPhoneVerificationId] = useState('');
  const [loginEmailOTP, setLoginEmailOTP] = useState('');
  const [loginEmailOTPSent, setLoginEmailOTPSent] = useState(false);
  const [loginEmailVerificationId, setLoginEmailVerificationId] = useState('');

  // --- FORGOT/RESET PASSWORD STATE ---
  const [forgotPasswordOption, setForgotPasswordOption] = useState('reset'); // 'reset' or 'otp'
  const [forgotPasswordPhone, setForgotPasswordPhone] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordPhoneOTPSent, setForgotPasswordPhoneOTPSent] = useState(false);
  const [forgotPasswordPhoneVerificationId, setForgotPasswordPhoneVerificationId] = useState('');
  const [forgotPasswordPhoneOTP, setForgotPasswordPhoneOTP] = useState('');
  const [forgotPasswordPhoneVerified, setForgotPasswordPhoneVerified] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  // --- SIGN UP PHONE OTP LOGIC ---
  const handleSendSignupPhoneOTP = async () => {
    if (!signupPhone) return Alert.alert('Error', 'Enter phone number');
    try {
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        `${selectedCountry.code}${signupPhone}`,
        recaptchaVerifier
      );
      setSignupPhoneVerificationId(verificationId);
      setSignupPhoneOTPSent(true);
      setOtpTimer(30);
      Alert.alert('OTP Sent', 'Check your phone for the OTP.');
    } catch (e) {
      Alert.alert('OTP Error', e.message);
    }
  };
  const handleVerifySignupPhoneOTP = async () => {
    if (!signupPhoneVerificationId || !signupPhoneOTP) {
      Alert.alert('Error', 'Enter the OTP sent to your phone.');
      return;
    }
    try {
      const credential = PhoneAuthProvider.credential(signupPhoneVerificationId, signupPhoneOTP);
      await signInWithCredential(auth, credential);
      setSignupPhoneVerified(true);
      Alert.alert('Success', 'Phone number verified!');
    } catch (e) {
      Alert.alert('OTP Verification Failed', e.message);
    }
  };

  // --- SIGN UP EMAIL OTP LOGIC (DEMO) ---
  const handleSendSignupEmailOTP = async () => {
    if (!signupEmail) return;
    try {
      const verificationId = Math.random().toString(36).substring(2, 15);
      setSignupEmailVerificationId(verificationId);
      setSignupEmailOTPSent(true);
      setOtpTimer(30);
      Alert.alert('OTP Sent', 'Check your email for the OTP.');
    } catch (e) {
      Alert.alert('Email OTP Error', e.message);
    }
  };
  const handleVerifySignupEmailOTP = async () => {
    if (!signupEmailVerificationId || !signupEmailOTP) {
      Alert.alert('Error', 'Enter the OTP sent to your email.');
      return;
    }
    try {
      setSignupEmailVerified(true);
      Alert.alert('Success', 'Email verified!');
    } catch (e) {
      Alert.alert('Email OTP Verification Failed', e.message);
    }
  };

  const handleSignup = async () => {
    if (!signupName || !signupPhone || !signupPassword || !signupConfirmPassword) {
      Alert.alert('Error', 'All fields except email are required');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!signupPhoneVerified) {
      Alert.alert('Error', 'Verify your phone number');
      return;
    }
    if (signupEmail && !signupEmailVerified) {
      Alert.alert('Error', 'Verify your email');
      return;
    }
    setSignupLoading(true);
    try {
      let email = signupEmail || getSyntheticEmail(signupPhone, selectedCountry.code);
      let userCredential = await createUserWithEmailAndPassword(auth, email, signupPassword);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: signupName,
        phone: signupPhone,
        countryCode: selectedCountry.code,
        email: signupEmail || '',
        role: signupRole,
        createdAt: new Date().toISOString(),
      });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      Alert.alert('Success', 'Account created!');
      setTab('login');
    } catch (e) {
      Alert.alert('Sign Up Failed', e.message);
    }
    setSignupLoading(false);
  };

  // --- LOGIN LOGIC ---
  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      let userCredential;
      if (loginPhone) {
        const email = getSyntheticEmail(loginPhone, selectedCountry.code);
        userCredential = await signInWithEmailAndPassword(auth, email, loginPassword);
      } else if (loginEmail) {
        userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      } else {
        Alert.alert('Error', 'Enter phone or email');
        setLoginLoading(false);
        return;
      }
      const uid = userCredential?.user?.uid || auth.currentUser?.uid;
      if (uid) {
        const userDoc = await getDoc(doc(db, 'users', uid));
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        Alert.alert('Success', 'Logged in!');
      } else {
        throw new Error('User not found after login.');
      }
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    }
    setLoginLoading(false);
  };

  // --- LOGIN WITH OTP LOGIC (NEW) ---
  // Phone OTP
  const handleSendLoginPhoneOTP = async () => {
    if (!loginPhone) return Alert.alert('Error', 'Enter phone number');
    try {
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        `${selectedCountry.code}${loginPhone}`,
        recaptchaVerifier
      );
      setLoginPhoneVerificationId(verificationId);
      setLoginPhoneOTPSent(true);
      setOtpTimer(30);
      Alert.alert('OTP Sent', 'Check your phone for the OTP.');
    } catch (e) {
      Alert.alert('OTP Error', e.message);
    }
  };
  const handleVerifyLoginPhoneOTP = async () => {
    if (!loginPhoneVerificationId || !loginPhoneOTP) {
      Alert.alert('Error', 'Enter the OTP sent to your phone.');
      return;
    }
    try {
      const credential = PhoneAuthProvider.credential(loginPhoneVerificationId, loginPhoneOTP);
      await signInWithCredential(auth, credential);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      Alert.alert('Success', 'Logged in!');
    } catch (e) {
      Alert.alert('OTP Verification Failed', e.message);
    }
  };
  // Email OTP (DEMO)
  const handleSendLoginEmailOTP = async () => {
    if (!loginEmail) return Alert.alert('Error', 'Enter email');
    try {
      const verificationId = Math.random().toString(36).substring(2, 15);
      setLoginEmailVerificationId(verificationId);
      setLoginEmailOTPSent(true);
      setOtpTimer(30);
      Alert.alert('OTP Sent', 'Check your email for the OTP.');
    } catch (e) {
      Alert.alert('Email OTP Error', e.message);
    }
  };
  const handleVerifyLoginEmailOTP = async () => {
    if (!loginEmailVerificationId || !loginEmailOTP) {
      Alert.alert('Error', 'Enter the OTP sent to your email.');
      return;
    }
    try {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      Alert.alert('Success', 'Logged in!');
    } catch (e) {
      Alert.alert('Email OTP Error', e.message);
    }
  };

  // --- FORGOT/RESET PASSWORD LOGIC ---
  const handleForgotSubmit = async () => {
    setForgotPasswordLoading(true);
    try {
      if (forgotPasswordOption === 'reset') {
        if (forgotPasswordEmail) {
          await sendPasswordResetEmail(auth, forgotPasswordEmail);
          Alert.alert('Success', 'Password reset email sent.');
          setTab('login');
        } else if (forgotPasswordPhone) {
          // Send OTP to phone for password reset
          const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
          const provider = new PhoneAuthProvider(auth);
          const verificationId = await provider.verifyPhoneNumber(
            `${selectedCountry.code}${forgotPasswordPhone}`,
            recaptchaVerifier
          );
          setForgotPasswordPhoneVerificationId(verificationId);
          setForgotPasswordPhoneOTPSent(true);
          setOtpTimer(30);
          setTab('reset');
          Alert.alert('OTP Sent', 'Check your phone for the OTP.');
        } else {
          Alert.alert('Error', 'Enter your email or phone to reset password.');
        }
      } else if (forgotPasswordOption === 'otp') {
        setTab('loginOtp');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setForgotPasswordLoading(false);
  };

  const handleVerifyForgotPasswordPhoneOTP = async () => {
    if (!forgotPasswordPhoneVerificationId || !forgotPasswordPhoneOTP) {
      Alert.alert('Error', 'Enter the OTP sent to your phone.');
      return;
    }
    try {
      const credential = PhoneAuthProvider.credential(forgotPasswordPhoneVerificationId, forgotPasswordPhoneOTP);
      await signInWithCredential(auth, credential);
      setForgotPasswordPhoneVerified(true);
      Alert.alert('Success', 'Phone number verified! Now set your new password.');
    } catch (e) {
      Alert.alert('OTP Verification Failed', e.message);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword || !resetConfirmPassword) {
      Alert.alert('Error', 'Enter and confirm your new password.');
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    try {
      if (forgotPasswordEmail) {
        Alert.alert('Success', 'Password reset! Please check your email.');
        setTab('login');
      } else if (forgotPasswordPhone && forgotPasswordPhoneVerified) {
        await auth.currentUser.updatePassword(resetPassword);
        Alert.alert('Success', 'Password reset! Please log in.');
        setTab('login');
      } else {
        Alert.alert('Error', 'Please verify your phone number with OTP.');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  // --- UI ---
  const renderCountryModal = () => (
    <Modal visible={countryModal} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Select Country</Text>
        <FlatList
          data={countryCodes}
          keyExtractor={item => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => {
                setSelectedCountry(item);
                setCountryModal(false);
              }}
            >
              <Text style={{ fontSize: 20 }}>{item.flag}</Text>
              <Text style={{ marginLeft: 10 }}>{item.name} ({item.code})</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity onPress={() => setCountryModal(false)} style={{ marginTop: 20 }}>
          <Text style={{ color: '#007AFF', textAlign: 'center' }}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'login' && styles.tabActive]}
          onPress={() => setTab('login')}
        >
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'signup' && styles.tabActive]}
          onPress={() => setTab('signup')}
        >
          <Text style={styles.tabText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* LOGIN FORM */}
      {tab === 'login' && (
        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => setCountryModal(true)}
            >
              <Text>{selectedCountry.flag} {selectedCountry.code}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={loginPhone}
              onChangeText={setLoginPhone}
            />
          </View>
          <Text style={{ textAlign: 'center', marginVertical: 6 }}>or</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={loginEmail}
            onChangeText={setLoginEmail}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={loginPassword}
            onChangeText={setLoginPassword}
          />
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff' }}>Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => setTab('loginOtp')}
          >
            <Text style={{ color: '#007AFF', textAlign: 'center' }}>Login with OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => setTab('forgot')}
          >
            <Text style={{ color: '#007AFF', textAlign: 'center' }}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LOGIN WITH OTP FORM */}
      {tab === 'loginOtp' && (
        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => setCountryModal(true)}
            >
              <Text>{selectedCountry.flag} {selectedCountry.code}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={loginPhone}
              onChangeText={setLoginPhone}
            />
          </View>
          <Text style={{ textAlign: 'center', marginVertical: 6 }}>or</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={loginEmail}
            onChangeText={setLoginEmail}
            autoCapitalize="none"
          />
          {/* Phone OTP */}
          {loginPhone && !loginPhoneOTPSent && (
            <TouchableOpacity
              style={styles.otpBtn}
              onPress={handleSendLoginPhoneOTP}
              disabled={otpTimer > 0}
            >
              <Text style={{ color: '#fff' }}>
                {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Send OTP to Phone'}
              </Text>
            </TouchableOpacity>
          )}
          {loginPhone && loginPhoneOTPSent && (
            <>
              <Text style={styles.label}>Enter Phone OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="OTP"
                keyboardType="number-pad"
                value={loginPhoneOTP}
                onChangeText={setLoginPhoneOTP}
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.otpBtn}
                onPress={handleVerifyLoginPhoneOTP}
              >
                <Text style={{ color: '#fff' }}>Verify Phone OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginTop: 8 }}
                onPress={handleSendLoginPhoneOTP}
                disabled={otpTimer > 0}
              >
                <Text style={{ color: otpTimer > 0 ? '#aaa' : '#007AFF', textAlign: 'center' }}>
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {/* Email OTP */}
          {loginEmail && !loginEmailOTPSent && (
            <TouchableOpacity
              style={styles.otpBtn}
              onPress={handleSendLoginEmailOTP}
              disabled={otpTimer > 0}
            >
              <Text style={{ color: '#fff' }}>
                {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Send OTP to Email'}
              </Text>
            </TouchableOpacity>
          )}
          {loginEmail && loginEmailOTPSent && (
            <>
              <Text style={styles.label}>Enter Email OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="OTP"
                keyboardType="number-pad"
                value={loginEmailOTP}
                onChangeText={setLoginEmailOTP}
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.otpBtn}
                onPress={handleVerifyLoginEmailOTP}
              >
                <Text style={{ color: '#fff' }}>Verify Email OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginTop: 8 }}
                onPress={handleSendLoginEmailOTP}
                disabled={otpTimer > 0}
              >
                <Text style={{ color: otpTimer > 0 ? '#aaa' : '#007AFF', textAlign: 'center' }}>
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => setTab('login')}
          >
            <Text style={{ color: '#007AFF', textAlign: 'center' }}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FORGOT PASSWORD FORM */}
      {tab === 'forgot' && (
        <View style={styles.form}>
          <Text style={styles.label}>Forgot Password</Text>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => setCountryModal(true)}
            >
              <Text>{selectedCountry.flag} {selectedCountry.code}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={forgotPasswordPhone}
              onChangeText={setForgotPasswordPhone}
            />
          </View>
          <Text style={{ textAlign: 'center', marginVertical: 6 }}>or</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={forgotPasswordEmail}
            onChangeText={setForgotPasswordEmail}
            autoCapitalize="none"
          />
          <View style={styles.row}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
              onPress={() => setForgotPasswordOption('reset')}
            >
              <View style={{
                width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#007AFF',
                alignItems: 'center', justifyContent: 'center', marginRight: 6
              }}>
                {forgotPasswordOption === 'reset' && <View style={{
                  width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF'
                }} />}
              </View>
              <Text>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setForgotPasswordOption('otp')}
            >
              <View style={{
                width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#007AFF',
                alignItems: 'center', justifyContent: 'center', marginRight: 6
              }}>
                {forgotPasswordOption === 'otp' && <View style={{
                  width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF'
                }} />}
              </View>
              <Text>Login with OTP</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleForgotSubmit}
            disabled={forgotPasswordLoading}
          >
            {forgotPasswordLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff' }}>Submit</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => setTab('login')}
          >
            <Text style={{ color: '#007AFF', textAlign: 'center' }}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RESET PASSWORD FORM */}
      {tab === 'reset' && (
        <View style={styles.form}>
          {forgotPasswordPhone && !forgotPasswordPhoneVerified && (
            <>
              <Text style={styles.label}>Enter Phone OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="OTP"
                keyboardType="number-pad"
                value={forgotPasswordPhoneOTP}
                onChangeText={setForgotPasswordPhoneOTP}
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.otpBtn}
                onPress={handleVerifyForgotPasswordPhoneOTP}
              >
                <Text style={{ color: '#fff' }}>Verify Phone OTP</Text>
              </TouchableOpacity>
            </>
          )}
          {(forgotPasswordEmail || (forgotPasswordPhone && forgotPasswordPhoneVerified)) && (
            <>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={resetPassword}
                onChangeText={setResetPassword}
              />
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={resetConfirmPassword}
                onChangeText={setResetConfirmPassword}
              />
              <TouchableOpacity
                style={styles.signupBtn}
                onPress={handleResetPassword}
              >
                <Text style={{ color: '#fff' }}>Submit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* SIGN UP FORM */}
      {tab === 'signup' && (
        <View style={styles.form}>
          <Text style={styles.label}>Sign Up As</Text>
          <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 8 }}>
            <Picker
              selectedValue={signupRole}
              onValueChange={setSignupRole}
              style={{ height: 44 }}
            >
              <Picker.Item label="Customer" value="customer" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={signupName}
            onChangeText={setSignupName}
          />
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => setCountryModal(true)}
            >
              <Text>{selectedCountry.flag} {selectedCountry.code}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={signupPhone}
              onChangeText={setSignupPhone}
            />
          </View>
          <Text style={styles.label}>Email (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={signupEmail}
            onChangeText={setSignupEmail}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={signupPassword}
            onChangeText={setSignupPassword}
          />
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={signupConfirmPassword}
            onChangeText={setSignupConfirmPassword}
          />
          {/* Phone OTP Verification */}
          {!signupPhoneVerified && (
            <>
              <TouchableOpacity
                style={styles.otpBtn}
                onPress={handleSendSignupPhoneOTP}
                disabled={otpTimer > 0}
              >
                <Text style={{ color: '#fff' }}>
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Send OTP to Phone'}
                </Text>
              </TouchableOpacity>
              {signupPhoneOTPSent && (
                <>
                  <Text style={styles.label}>Enter Phone OTP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="OTP"
                    keyboardType="number-pad"
                    value={signupPhoneOTP}
                    onChangeText={setSignupPhoneOTP}
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.otpBtn}
                    onPress={handleVerifySignupPhoneOTP}
                  >
                    <Text style={{ color: '#fff' }}>Verify Phone OTP</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
          {/* Email OTP Verification */}
          {signupEmail && !signupEmailVerified && (
            <>
              <TouchableOpacity
                style={styles.otpBtn}
                onPress={handleSendSignupEmailOTP}
                disabled={otpTimer > 0}
              >
                <Text style={{ color: '#fff' }}>
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Send OTP to Email'}
                </Text>
              </TouchableOpacity>
              {signupEmailOTPSent && (
                <>
                  <Text style={styles.label}>Enter Email OTP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="OTP"
                    keyboardType="number-pad"
                    value={signupEmailOTP}
                    onChangeText={setSignupEmailOTP}
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.otpBtn}
                    onPress={handleVerifySignupEmailOTP}
                  >
                    <Text style={{ color: '#fff' }}>Verify Email OTP</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
          <TouchableOpacity
            style={styles.signupBtn}
            onPress={handleSignup}
            disabled={signupLoading}
          >
            {signupLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff' }}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {renderCountryModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  tabRow: { flexDirection: 'row', marginBottom: 20 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#ccc' },
  tabActive: { borderBottomColor: '#007AFF' },
  tabText: { fontWeight: 'bold' },
  form: { flex: 1 },
  label: { fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8, flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  countryBtn: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginRight: 8, backgroundColor: '#f8f8f8' },
  otpBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  loginBtn: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  signupBtn: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
});