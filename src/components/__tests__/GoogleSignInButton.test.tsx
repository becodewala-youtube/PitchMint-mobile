import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { GoogleSignInButton } from '../GoogleSignInButton';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthError } from '../../services/auth/googleAuthService';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('GoogleSignInButton', () => {
  let mockSignInWithGoogle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithGoogle = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
    });
  });

  it('renders correctly with label and logo in default state', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<GoogleSignInButton />);
    });

    const root = renderer!.root;
    const textNode = root.findByProps({ children: 'Continue with Google' });
    expect(textNode).toBeTruthy();

    const pressable = root.findByProps({ accessibilityLabel: 'Continue with Google' });
    expect(pressable.props.accessibilityRole).toBe('button');
    expect(pressable.props.disabled).toBe(false);
  });

  it('respects external disabled prop', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<GoogleSignInButton disabled={true} />);
    });

    const pressable = renderer!.root.findByProps({ accessibilityLabel: 'Continue with Google' });
    expect(pressable.props.disabled).toBe(true);

    // Pressing when disabled should not invoke signInWithGoogle
    act(() => {
      pressable.props.onPress();
    });
    expect(mockSignInWithGoogle).not.toHaveBeenCalled();
  });

  it('triggers signInWithGoogle and displays loading indicator while active', async () => {
    let resolveSignIn!: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolveSignIn = resolve;
    });
    mockSignInWithGoogle.mockReturnValueOnce(pendingPromise);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<GoogleSignInButton />);
    });

    const pressable = renderer!.root.findByProps({ accessibilityLabel: 'Continue with Google' });

    // Press button
    let pressPromise: Promise<void>;
    act(() => {
      pressPromise = pressable.props.onPress();
    });

    // Check loading indicator is shown while in flight
    const loadingIndicator = renderer!.root.findByProps({ testID: 'google-sign-in-loading-indicator' });
    expect(loadingIndicator).toBeTruthy();
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);

    // Resolve sign in
    await act(async () => {
      resolveSignIn();
      await pressPromise;
    });

    // After resolve, indicator is removed and text returns
    expect(renderer!.root.findByProps({ children: 'Continue with Google' })).toBeTruthy();
  });

  it('prevents concurrent duplicate taps while sign-in is in flight', async () => {
    let resolveSignIn!: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolveSignIn = resolve;
    });
    mockSignInWithGoogle.mockReturnValue(pendingPromise);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<GoogleSignInButton />);
    });

    const pressable = renderer!.root.findByProps({ accessibilityLabel: 'Continue with Google' });

    let pressPromise: Promise<void>;
    act(() => {
      pressPromise = pressable.props.onPress();
      // Immediate duplicate tap while in progress
      pressable.props.onPress();
      pressable.props.onPress();
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSignIn();
      await pressPromise;
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('does not display alert when user cancels sign-in', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    mockSignInWithGoogle.mockResolvedValueOnce(null);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<GoogleSignInButton />);
    });

    const pressable = renderer!.root.findByProps({ accessibilityLabel: 'Continue with Google' });
    await act(async () => {
      await pressable.props.onPress();
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('does not show duplicate alert when error was already handled by service', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    mockSignInWithGoogle.mockRejectedValueOnce(
      new GoogleAuthError('OAuth misconfiguration', 'DEVELOPER_ERROR', true)
    );

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<GoogleSignInButton />);
    });

    const pressable = renderer!.root.findByProps({ accessibilityLabel: 'Continue with Google' });
    await act(async () => {
      await pressable.props.onPress();
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    // Button should suppress duplicate alert since service already alerted user
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('shows error alert when unexpected error occurs without prior alert', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    mockSignInWithGoogle.mockRejectedValueOnce(new Error('Backend server unavailable'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<GoogleSignInButton />);
    });

    const pressable = renderer!.root.findByProps({ accessibilityLabel: 'Continue with Google' });
    await act(async () => {
      await pressable.props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Sign-In Failed',
      'Backend server unavailable',
      [{ text: 'OK' }]
    );
  });
});
