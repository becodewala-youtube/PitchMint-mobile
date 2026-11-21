import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { MarketResearchScreen } from '../MarketResearchScreen';
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
      ideaText: 'AI Dental Clinic automation',
    },
  }),
}));

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@pitchmint.app', credits: 5 },
    refreshUser: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('MarketResearchScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input form with prefilled idea text', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<MarketResearchScreen />);
    });

    const ideaInput = renderer.root.findByProps({ testID: 'market-research-idea-input' });
    expect(ideaInput.props.value).toBe('AI Dental Clinic automation');
    expect(renderer.root.findByProps({ testID: 'market-research-submit-btn' })).toBeTruthy();
  });

  it('executes market analysis and displays TAM/SAM/SOM results', async () => {
    jest.spyOn(toolkitApi, 'analyzeMarketResearch').mockResolvedValue({
      tam: { value: 10000000000, description: '$10B dental market' },
      sam: { value: 2000000000, description: '$2B North America' },
      som: { value: 200000000, description: '$200M beachhead' },
      marketGrowthRate: '12% CAGR',
      targetAudience: [{ segment: 'Independent Dental Clinics', description: 'Small clinics' }],
      userCredits: 3,
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<MarketResearchScreen />);
    });

    const submitBtn = renderer.root.findByProps({ testID: 'market-research-submit-btn' });
    await act(async () => {
      submitBtn.props.onPress();
    });

    const confirmBtn = renderer.root.findByProps({ testID: 'market-confirm-btn' });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    expect(toolkitApi.analyzeMarketResearch).toHaveBeenCalledWith({
      ideaText: 'AI Dental Clinic automation',
      industry: 'SaaS / Technology',
      targetRegion: 'Global',
    });

    expect(renderer.root.findByProps({ testID: 'market-research-results' })).toBeTruthy();
  });
});
