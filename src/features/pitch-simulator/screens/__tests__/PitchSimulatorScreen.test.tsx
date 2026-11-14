import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import { PitchSimulatorScreen } from '../PitchSimulatorScreen';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import { CreditConfirmationModal } from '../../../../components';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockRouteParams = { ideaId: 'idea-123', ideaTitle: 'FinFlow' };
let mockUserCredits = 5;

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'usr-1',
      name: 'Test Founder',
      credits: mockUserCredits,
    },
    refreshUser: mockRefreshUser,
  }),
}));

const mockIdeaWithoutSimulation: BackendIdea = {
  _id: 'idea-123',
  userId: 'usr-1',
  ideaText: 'FinFlow\nAutomated cashflow reconciliation for SMBs.',
  overallScore: 82,
  pitchSimulation: {
    questions: [],
  },
  createdAt: '2026-10-24T10:00:00Z',
};

const mockSimulatedQuestions = [
  {
    id: 'q-1',
    category: 'Market Opportunity',
    question: 'What is your total addressable market and how did you calculate it?',
    answer: '',
  },
  {
    id: 'q-2',
    category: 'Unit Economics',
    question: 'What is your current customer acquisition cost and payback period?',
    answer: '',
  },
];

describe('PitchSimulatorScreen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-123', ideaTitle: 'FinFlow' };
    mockUserCredits = 5;
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(mockIdeaWithoutSimulation);
    jest.spyOn(ideasApi, 'simulatePitch').mockResolvedValue({
      _id: 'idea-123',
      pitchSimulation: {
        pitchSummary: 'Automated cashflow reconciliation',
        questions: mockSimulatedQuestions,
      },
    } as any);
  });

  it('renders intro stage when idea has no simulation questions', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchSimulatorScreen />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('Pitch Simulator');
    expect(textNodes).toContain('Your Pitch');
    expect(textNodes).toContain('Automated cashflow reconciliation for SMBs');
    expect(textNodes).toContain('5 Tough Investor Questions');
    expect(textNodes).toContain('Start Simulation (1 Credit)');
  });

  it('shows credit confirmation modal, initiates simulation and enters QA stage', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchSimulatorScreen />);
    });

    const root = renderer!.root;
    const startButton = root.findByProps({ testID: 'simulator-start-button' });

    await act(async () => {
      startButton.props.onPress();
    });

    // Credit modal is shown
    const modal = root.findByType(CreditConfirmationModal);
    expect(modal.props.visible).toBe(true);

    // Confirm credit deduction
    await act(async () => {
      await modal.props.onConfirm();
    });

    expect(ideasApi.simulatePitch).toHaveBeenCalledWith('idea-123', true);
    expect(mockRefreshUser).toHaveBeenCalled();

    // Now in QA stage: renders Question 1
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('Investor Question');
    expect(textNodes).toContain('What is your total addressable market and how did you calculate it?');
  });

  it('supports "Use sample" quick helper and submits answer for evaluation', async () => {
    const mockEvaluatedResponse = {
      feedback: {
        rating: 4,
        strengths: ['Clear TAM sizing methodology', 'Sound bottom-up logic'],
        improvements: ['Include pilot customer contract values'],
        additionalAdvice: 'Keep your presentation under 2 minutes.',
      },
    };
    jest.spyOn(ideasApi, 'evaluateAnswer').mockResolvedValue(mockEvaluatedResponse as any);

    // Pre-seed idea with question 1 active
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue({
      ...mockIdeaWithoutSimulation,
      pitchSimulation: {
        questions: mockSimulatedQuestions,
      },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchSimulatorScreen />);
    });

    const root = renderer!.root;

    // Tap "Use sample"
    const useSampleButton = root.findByProps({ testID: 'simulator-use-sample-button' });
    await act(async () => {
      useSampleButton.props.onPress();
    });

    const input = root.findByProps({ testID: 'simulator-answer-input' });
    expect(input.props.value).toContain('Our market is roughly $48B globally');

    // Tap "Submit Answer"
    const submitButton = root.findByProps({ testID: 'simulator-submit-answer-button' });
    await act(async () => {
      await submitButton.props.onPress();
    });

    expect(ideasApi.evaluateAnswer).toHaveBeenCalledWith(
      'idea-123',
      'q-1',
      expect.stringContaining('$48B')
    );

    // Evaluation card is displayed
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('Answer Evaluation');
    expect(textNodes).toContain('Strengths');
    expect(textNodes).toContain('Clear TAM sizing methodology');
    expect(textNodes).toContain('Improvements');
    expect(textNodes).toContain('Include pilot customer contract values');
  });

  it('renders results scorecard when all questions are answered and navigates back on Done', async () => {
    const fullyAnsweredIdea: BackendIdea = {
      ...mockIdeaWithoutSimulation,
      pitchSimulation: {
        questions: [
          {
            id: 'q-1',
            category: 'Market Size',
            question: 'What is your TAM?',
            answer: 'Our TAM is $10B.',
            feedback: { rating: 4 },
          },
          {
            id: 'q-2',
            category: 'Unit Economics',
            question: 'What is your CAC?',
            answer: 'CAC is $200 with 6 month payback.',
            feedback: { rating: 5 },
          },
        ],
      },
    };
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullyAnsweredIdea);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchSimulatorScreen />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('Investor Readiness');
    // Average rating is 4.5 -> score = 90
    expect(textNodes).toContain('90');
    expect(textNodes).toContain("You're pitch-ready. Time to book those investor meetings.");
    expect(textNodes).toContain('What is your TAM?');
    expect(textNodes).toContain('What is your CAC?');

    // Tap Done
    const doneButton = root.findByProps({ testID: 'simulator-done-button' });
    await act(async () => {
      doneButton.props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
