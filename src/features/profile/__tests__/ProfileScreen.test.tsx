import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, Alert } from 'react-native';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ideasApi } from '../../../services/api/ideasApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockSignOut = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockUser: any = {
  _id: 'usr-1',
  name: 'Aarav Sharma',
  email: 'aarav@pitchmint.app',
  credits: 8,
  plan: 'pro',
  isPremium: true,
};

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: mockSignOut,
    refreshUser: mockRefreshUser,
  }),
}));

describe('ProfileScreen Integration (Phase 3A)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('renders verified user name, email, credits, and live total ideas count', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: [],
      total: 14,
      totalPages: 2,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('Settings');
    expect(textNodes).toContain('Aarav Sharma');
    expect(textNodes).toContain('aarav@pitchmint.app');
    expect(textNodes).toContain(14); // Live total ideas count
    expect(textNodes).toContain(8); // Available credits
    expect(textNodes).toContain('PRO'); // Plan
    expect(textNodes).toContain('8 available'); // Setting row value
    expect(mockRefreshUser).toHaveBeenCalled();
  });

  it('triggers confirmation alert when sign out is pressed', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const signOutRow = root.findByProps({ accessibilityLabel: 'Sign out' });
    expect(signOutRow).toBeDefined();

    await act(async () => {
      signOutRow.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Sign Out',
      expect.stringContaining('Are you sure you want to sign out'),
      expect.any(Array)
    );
  });
});
