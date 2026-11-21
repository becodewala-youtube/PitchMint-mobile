import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { InvestorDirectoryScreen } from '../InvestorDirectoryScreen';
import { InvestorMatchScreen } from '../InvestorMatchScreen';
import { toolkitApi } from '../../../../services/api/toolkitApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 44, bottom: 34, left: 0, right: 0 };
  return {
    useSafeAreaInsets: () => insets,
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(insets),
  };
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      ideaText: 'AI automated radiology reports',
    },
  }),
}));

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@pitchmint.app', credits: 5 },
    refreshUser: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('Investor Screens Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('InvestorDirectoryScreen', () => {
    it('fetches and renders investors directory', async () => {
      jest.spyOn(toolkitApi, 'getInvestors').mockResolvedValue([
        {
          _id: 'inv-1',
          name: 'Sequoia Capital',
          type: 'VC',
          location: 'Menlo Park, CA',
          industryFocus: ['AI', 'HealthTech'],
          description: 'Top global venture capital firm',
          contactLink: 'https://sequoiacap.com',
        },
      ]);

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<InvestorDirectoryScreen />);
      });

      expect(renderer.root.findByProps({ testID: 'investor-card-inv-1' })).toBeTruthy();
    });

    it('renders premium banner when server responds with 403', async () => {
      jest.spyOn(toolkitApi, 'getInvestors').mockRejectedValue({
        status: 403,
        message: 'Premium subscription required',
      });

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<InvestorDirectoryScreen />);
      });

      expect(renderer.root.findByProps({ testID: 'investor-premium-banner' })).toBeTruthy();
    });
  });

  describe('InvestorMatchScreen', () => {
    it('matches investors and renders results', async () => {
      jest.spyOn(toolkitApi, 'matchInvestors').mockResolvedValue({
        matches: [
          {
            name: 'Khosla Ventures',
            type: 'VC',
            stage: 'Seed / Series A',
            ticketSize: '$1M - $5M',
            industryFocus: ['Healthcare AI'],
            description: 'Venture fund investing in bold tech',
            matchReason: 'Strong alignment with healthcare AI',
          },
        ],
        userCredits: 3,
      });

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<InvestorMatchScreen />);
      });

      const submitBtn = renderer.root.findByProps({ testID: 'investor-match-submit-btn' });
      await act(async () => {
        submitBtn.props.onPress();
      });

      const confirmBtn = renderer.root.findByProps({ testID: 'investor-match-confirm-btn' });
      await act(async () => {
        confirmBtn.props.onPress();
      });

      expect(toolkitApi.matchInvestors).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'AI automated radiology reports',
        })
      );
      expect(renderer.root.findByProps({ testID: 'investor-match-card-0' })).toBeTruthy();
    });
  });
});
