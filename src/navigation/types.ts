import { NavigatorScreenParams, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Home: undefined;
  Ideas: undefined;
  ValidateTab: undefined;
  Activity: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  SignIn: { initialEmail?: string; noticeMessage?: string } | undefined;
  SignUp: undefined;
  EmailVerification: { email: string; fromRegistration?: boolean };
  ForgotPassword: { initialEmail?: string } | undefined;
  ResetPassword: { email?: string; token?: string } | undefined;
};

export type RootStackParamList = {
  AuthLoading: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ValidateModal: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export type MainTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
