import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput, Text } from 'react-native';
import { ValidateModalScreen } from '../screens/ValidateModalScreen';
import { ideasApi, SubmitIdeaResponse } from '../../../services/api/ideasApi';
import { creditsApi } from '../../../services/api/creditsApi';
import { ApiError } from '../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockUserCredits = 5;

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    addListener: jest.fn(() => jest.fn()),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'usr-1',
      name: 'Sarah Connor',
      email: 'sarah@pitchmint.app',
      credits: mockUserCredits,
      plan: 'pro',
    },
    refreshUser: mockRefreshUser,
  }),
}));

describe('ValidateModalScreen Component (Phase 3B)', () => {
  const sampleValidResponse: SubmitIdeaResponse = {
    _id: 'idea-888',
    userId: 'usr-1',
    ideaText: 'A specialized platform for carbon footprint accounting for logistics fleets',
    overallScore: 84,
    marketDemandScore: 89,
    competitionScore: 76,
    monetizationFeasibilityScore: 87,
    analysis: {
      marketDemand: { score: 89, text: 'High regulatory pressure driving adoption among transport fleets.' },
      competition: { score: 76, text: 'Competitors exist in general ESG reporting, but logistics vertical is underserved.' },
      monetization: { score: 87, text: 'SaaS recurring billing with per-vehicle tiers generates solid ARR.' },
      overall: { score: 84, text: 'Strong market opportunity with clear regulatory catalysts.' },
    },
    userCredits: 4,
    createdAt: '2026-10-24T14:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUserCredits = 5;
    jest.spyOn(creditsApi, 'getBalance').mockResolvedValue({
      success: true,
      credits: 5,
      plan: 'pro',
      lastReset: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial form with current credit balance and disables submit when idea is empty', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children);

    expect(textNodes).toContain('Submit Your Startup Idea');
    expect(textNodes).toContain('5 credits');
    expect(textNodes).toContain('Cost: 1 Credit • Backend Verified');

    // Submit button should be disabled because ideaText is empty
    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });
    expect(submitBtn.props.disabled).toBe(true);
  });

  it('enables submit button only when ideaText meets character requirement (>= 10 chars)', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    // Enter short text (< 10 chars)
    await act(async () => {
      textInput.props.onChangeText('Short');
    });

    let submitBtn = root.findByProps({ testID: 'submit-idea-button' });
    expect(submitBtn.props.disabled).toBe(true);

    // Enter valid text (>= 10 chars)
    await act(async () => {
      textInput.props.onChangeText('Autonomous delivery drones for suburban groceries');
    });

    submitBtn = root.findByProps({ testID: 'submit-idea-button' });
    expect(submitBtn.props.disabled).toBe(false);
  });

  it('disables submit and shows warning when credit balance is 0', async () => {
    mockUserCredits = 0;
    jest.spyOn(creditsApi, 'getBalance').mockResolvedValue({
      success: true,
      credits: 0,
      plan: 'free',
      lastReset: null,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('A revolutionary idea that cannot be validated without credits');
    });

    const textNodes = root.findAllByType(Text).map((t) => t.props.children);
    expect(textNodes).toContain('Zero Credits Remaining');

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });
    expect(submitBtn.props.disabled).toBe(true);
  });

  it('populates idea text when "Try an example →" is pressed', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const exampleButton = root.findByProps({ testID: 'try-example-button' });

    expect(exampleButton).toBeDefined();

    await act(async () => {
      exampleButton.props.onPress();
    });

    const textInput = root.findByType(TextInput);
    expect(textInput.props.value).toContain('marketplace that connects freelance designers');
  });

  it('opens pre-flight confirmation modal with credit balance details before submitting', async () => {
    const submitSpy = jest.spyOn(ideasApi, 'submitIdea');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('AI legal assistant for early stage companies');
    });

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });

    // Open confirmation modal
    await act(async () => {
      submitBtn.props.onPress();
    });

    // Check modal contents
    const textNodes = root.findAllByType(Text).map((t) => t.props.children);
    expect(textNodes).toContain('Validate Startup Idea?');
    expect(textNodes).toContain(
      'PitchMint AI will analyze your startup idea across market demand, competition, and monetization feasibility.'
    );
    expect(textNodes).toContain('1 Credit');
    expect(textNodes).toContain('5 Credits');
    expect(textNodes).toContain('4 Credits');

    // Confirm buttons exist
    const confirmBtn = root.findByProps({ testID: 'confirm-validation-button' });
    const cancelBtn = root.findByProps({ testID: 'cancel-validation-button' });
    expect(confirmBtn).toBeDefined();
    expect(cancelBtn).toBeDefined();

    // Verify submitIdea has NOT been called
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('cancels validation and closes confirmation modal without calling the API', async () => {
    const submitSpy = jest.spyOn(ideasApi, 'submitIdea');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('AI legal assistant for early stage companies');
    });

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });

    await act(async () => {
      submitBtn.props.onPress();
    });

    const cancelBtn = root.findByProps({ testID: 'cancel-validation-button' });

    // Cancel modal
    await act(async () => {
      cancelBtn.props.onPress();
    });

    // Modal is closed, no API request
    expect(submitSpy).not.toHaveBeenCalled();

    // User remains on form with ideaText preserved
    const currentInput = root.findByType(TextInput);
    expect(currentInput.props.value).toBe('AI legal assistant for early stage companies');
  });


  it('cleans up progression timers on unmount without throwing errors', async () => {
    jest.spyOn(ideasApi, 'submitIdea').mockImplementation(() => new Promise(() => {})); // Never resolves

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('Long running analysis test idea');
    });

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });

    await act(async () => {
      submitBtn.props.onPress();
    });

    const confirmBtn = root.findByProps({ testID: 'confirm-validation-button' });

    await act(async () => {
      confirmBtn.props.onPress();
    });

    // Unmount while analyzing
    await act(async () => {
      renderer.unmount();
    });

    // Advancing timers should not trigger errors on unmounted component
    act(() => {
      jest.advanceTimersByTime(5000);
    });
  });
});
