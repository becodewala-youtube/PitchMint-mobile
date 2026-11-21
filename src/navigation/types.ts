import { NavigatorScreenParams, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Home: undefined;
  Ideas: undefined;
  ValidateTab: undefined;
  Toolkit: undefined;
  Profile: undefined;
  Activity?: undefined;
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
  IdeaDetails: { ideaId: string };
  PitchDeck: { ideaId: string; ideaTitle?: string; initialSlideIndex?: number };
  Canvas: { ideaId: string; ideaTitle?: string; initialBlockIndex?: number };
  Competitor: { ideaId?: string; ideaTitle?: string; ideaText?: string } | undefined;
  PitchSimulator: { ideaId?: string; ideaTitle?: string; ideaText?: string } | undefined;
  MarketResearch?: { ideaId?: string; ideaTitle?: string; ideaText?: string };
  InvestorDirectory?: undefined;
  InvestorMatchmaking?: { ideaId?: string; ideaTitle?: string; ideaText?: string };
  Toolkit: undefined;
  Activity: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export type MainTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
