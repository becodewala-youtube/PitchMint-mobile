import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ideasApi } from '../../../services/api/ideasApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockUser: any = {
  _id: 'usr-100',
  name: 'Aarav Sharma',
  email: 'aarav@pitchmint.app',
  credits: 8,
  plan: 'pro',
  isPremium: true,
  isEmailVerified: true,
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    refreshUser: mockRefreshUser,
  }),
}));

describe('HomeScreen Integration (Phase 3A)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      _id: 'usr-100',
      name: 'Aarav Sharma',
      email: 'aarav@pitchmint.app',
      credits: 8,
      plan: 'pro',
      isPremium: true,
      isEmailVerified: true,
    };
  });

  it('renders verified user profile, avatar initial, and credit balance', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: [
        {
          _id: 'idea-1',
          userId: 'usr-100',
          ideaText: 'AI Copilot for Dental Clinics\nAutomated dental hygiene recall.',
          overallScore: 88,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      totalPages: 1,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    const textContent = textNodes.join(' ');
    expect(textContent).toMatch(/Welcome back,\s*Aarav\s*!/);
    expect(textContent).toContain('PRO');
    expect(textContent).toContain('TIER');
    expect(textNodes).toContain('A'); // Initial
    expect(textNodes).toContain(8); // Available credits
    expect(textNodes).toContain('AI Copilot for Dental Clinics');
    expect(mockRefreshUser).toHaveBeenCalled();
  });

  it('displays empty state when user has 0 saved ideas', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('No saved ideas yet');
    expect(textNodes).toContain('Validate First Idea');
  });

  it('renders error state and retry button on fetch failure', async () => {
    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockRejectedValueOnce(new Error('Network offline'))
      .mockResolvedValueOnce({
        success: true,
        ideas: [
          {
            _id: 'idea-2',
            userId: 'usr-100',
            ideaText: 'Sub-lease Platform\nVerified subleasing.',
            overallScore: 74,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('Could not load recent ideas');
    expect(textNodes).toContain('Network offline');

    // Find and press Retry button
    const retryButton = root.findByProps({ accessibilityLabel: 'Retry loading ideas' });
    expect(retryButton).toBeDefined();

    await act(async () => {
      retryButton.props.onPress();
    });

    expect(ideasSpy).toHaveBeenCalledTimes(2);
  });
});
