import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import { SignInScreen } from '../screens/SignInScreen';
import { ApiError } from '../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
let mockRouteParams: any = {};
const mockSignIn = jest.fn();
const mockClearError = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    clearError: mockClearError,
  }),
}));

describe('SignInScreen (Arena Design)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {};
  });

  it('renders the Arena AuthCard header, title, and subtitle', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<SignInScreen />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean);

    expect(textNodes).toContain('Welcome Back');
    expect(textNodes).toContain('Sign in to continue your journey');
    expect(textNodes).toContain('Or continue with');
    expect(textNodes).toContain('Continue with Google');
    expect(textNodes).toContain('Forgot your password?');
    expect(textNodes).toContain('Sign up');
  });

  it('populates initialEmail and renders noticeMessage from route params', async () => {
    mockRouteParams = {
      initialEmail: 'founder@pitchmint.app',
      noticeMessage: 'Password successfully reset. Please sign in.',
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<SignInScreen />);
    });

    const root = renderer!.root;
    const noticeBox = root.findByProps({ testID: 'signin-notice-box' });
    expect(noticeBox).toBeTruthy();

    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Password successfully reset. Please sign in.');

    const emailInput = root.findByProps({ testID: 'signin-email-input' });
    const textInput = emailInput.findByType(TextInput);
    expect(textInput.props.value).toBe('founder@pitchmint.app');
  });

  it('validates invalid email format on submit', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<SignInScreen />);
    });

    const root = renderer!.root;
    const emailInput = root.findByProps({ testID: 'signin-email-input' }).findByType(TextInput);
    await act(async () => {
      emailInput.props.onChangeText('invalid-email-address');
    });

    const submitBtn = root.findByProps({ testID: 'signin-submit-btn' });
    await act(async () => {
      submitBtn.props.onPress();
    });

    expect(mockSignIn).not.toHaveBeenCalled();
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes.some((t: any) => typeof t === 'string' && t.includes('valid email'))).toBe(true);
  });

  it('validates empty password on submit when email is valid', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<SignInScreen />);
    });

    const root = renderer!.root;
    const emailInput = root.findByProps({ testID: 'signin-email-input' }).findByType(TextInput);

    await act(async () => {
      emailInput.props.onChangeText('test@pitchmint.app');
    });

    const submitBtn = root.findByProps({ testID: 'signin-submit-btn' });
    await act(async () => {
      submitBtn.props.onPress();
    });

    expect(mockSignIn).not.toHaveBeenCalled();
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Password is required');
  });

  it('calls signIn on valid credentials', async () => {
    mockSignIn.mockResolvedValueOnce({ token: 'test-jwt', user: { _id: '1', email: 'test@pitchmint.app' } });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<SignInScreen />);
    });

    const root = renderer!.root;
    const emailInput = root.findByProps({ testID: 'signin-email-input' }).findByType(TextInput);
    const passwordInput = root.findByProps({ testID: 'signin-password-input' }).findByType(TextInput);

    await act(async () => {
      emailInput.props.onChangeText('test@pitchmint.app');
      passwordInput.props.onChangeText('SecretPassword123!');
    });

    const submitBtn = root.findByProps({ testID: 'signin-submit-btn' });
    await act(async () => {
      await submitBtn.props.onPress();
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@pitchmint.app',
      password: 'SecretPassword123!',
    });
  });

  it('routes to EmailVerification if backend returns emailNotVerified 401', async () => {
    const apiError = new ApiError({
      message: 'Email not verified',
      status: 401,
      emailNotVerified: true,
      email: 'unverified@pitchmint.app',
    });
    mockSignIn.mockRejectedValueOnce(apiError);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<SignInScreen />);
    });

    const root = renderer!.root;
    const emailInput = root.findByProps({ testID: 'signin-email-input' }).findByType(TextInput);
    const passwordInput = root.findByProps({ testID: 'signin-password-input' }).findByType(TextInput);

    await act(async () => {
      emailInput.props.onChangeText('unverified@pitchmint.app');
      passwordInput.props.onChangeText('SecretPassword123!');
    });

    const submitBtn = root.findByProps({ testID: 'signin-submit-btn' });
    await act(async () => {
      await submitBtn.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('EmailVerification', {
      email: 'unverified@pitchmint.app',
      fromRegistration: false,
    });
  });

  it('navigates to ForgotPassword when pressing Forgot your password? link', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<SignInScreen />);
    });

    const root = renderer!.root;
    const emailInput = root.findByProps({ testID: 'signin-email-input' }).findByType(TextInput);
    await act(async () => {
      emailInput.props.onChangeText('forgot@pitchmint.app');
    });

    const forgotLink = root.findByProps({ testID: 'signin-forgot-password-link' });
    await act(async () => {
      forgotLink.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword', {
      initialEmail: 'forgot@pitchmint.app',
    });
  });

  it('navigates to SignUp when pressing bottom Sign up link', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<SignInScreen />);
    });

    const root = renderer!.root;
    const signUpLink = root.findByProps({ testID: 'signin-signup-link' });
    await act(async () => {
      signUpLink.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });
});
