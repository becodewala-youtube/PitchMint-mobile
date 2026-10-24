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

  it('submits exactly once and renders real backend validation results on success', async () => {
    const submitSpy = jest.spyOn(ideasApi, 'submitIdea').mockResolvedValue(sampleValidResponse);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('A specialized platform for carbon footprint accounting for logistics fleets');
    });

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });

    // Tap submit once
    await act(async () => {
      submitBtn.props.onPress();
    });

    // Verify it transitioned to analyzing screen
    const currentTexts = root.findAllByType(Text).map((t) => t.props.children);
    expect(currentTexts).toContain('Analyzing your idea…');
    expect(currentTexts).toContain('Reading your idea');

    // Verify exactly one client request was made
    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith({
      ideaText: 'A specialized platform for carbon footprint accounting for logistics fleets',
    });

    // Fast-forward timers for step progression and transition
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await act(async () => {
      jest.runAllTimers();
    });

    // Verify real backend results are rendered
    const resultTexts = root.findAllByType(Text).map((t) => t.props.children);
    expect(resultTexts).toContain('Idea Analysis');
    expect(resultTexts).toContain('Strong Potential');
    expect(resultTexts).toContain('4 credits');
    expect(resultTexts).toContain('84/100');
    expect(resultTexts).toContain(
      'High regulatory pressure driving adoption among transport fleets.'
    );

    // Verify refreshUser was triggered
    expect(mockRefreshUser).toHaveBeenCalled();
  });

  it('handles HTTP 402 insufficient credits by displaying error and staying on form with preserved text', async () => {
    const error402 = new ApiError({ message: 'Insufficient credits to validate idea.', status: 402 });
    jest.spyOn(ideasApi, 'submitIdea').mockRejectedValue(error402);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('Fleet carbon tracking platform');
    });

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });

    await act(async () => {
      submitBtn.props.onPress();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    const textNodes = root.findAllByType(Text).map((t) => t.props.children);
    expect(textNodes).toContain('Validation Error');
    expect(textNodes).toContain('Insufficient credits to validate idea.');

    // Preserves entered text
    const updatedInput = root.findByType(TextInput);
    expect(updatedInput.props.value).toBe('Fleet carbon tracking platform');
  });

  it('handles HTTP 401 session expiry gracefully', async () => {
    const error401 = new ApiError({ message: 'Not authorized', status: 401 });
    jest.spyOn(ideasApi, 'submitIdea').mockRejectedValue(error401);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('Autonomous warehouse picking robots');
    });

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });

    await act(async () => {
      submitBtn.props.onPress();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    const textNodes = root.findAllByType(Text).map((t) => t.props.children);
    expect(textNodes).toContain('Your session has expired. Please sign in again.');
  });

  it('handles network failure with ambiguous warning, guiding user to check Saved Ideas without retrying', async () => {
    const networkError = new ApiError({
      message: 'Unable to connect to PitchMint server. Please check your network connection.',
      status: 0,
    });
    const submitSpy = jest.spyOn(ideasApi, 'submitIdea').mockRejectedValue(networkError);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('AI legal assistant for seed startups');
    });

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });

    await act(async () => {
      submitBtn.props.onPress();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    // Exactly one attempt was made, no automatic retry
    expect(submitSpy).toHaveBeenCalledTimes(1);

    const textNodes = root.findAllByType(Text).map((t) => t.props.children);
    expect(textNodes).toContain('Connection Issue');
    expect(textNodes).toContain('Check Saved Ideas →');

    // User can tap "Check Saved Ideas →"
    const checkSavedIdeasBtn = root.findByProps({ testID: 'check-saved-ideas-button' });
    expect(checkSavedIdeasBtn).toBeDefined();

    await act(async () => {
      checkSavedIdeasBtn.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', { screen: 'Ideas' });
  });

  it('handles server errors (HTTP 500) without automatic retry', async () => {
    const error500 = new ApiError({
      message: 'Internal server error',
      status: 500,
    });
    const submitSpy = jest.spyOn(ideasApi, 'submitIdea').mockRejectedValue(error500);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('Medical device inventory tracking');
    });

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });

    await act(async () => {
      submitBtn.props.onPress();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(submitSpy).toHaveBeenCalledTimes(1);
    const textNodes = root.findAllByType(Text).map((t) => t.props.children);
    expect(textNodes).toContain('Connection Issue');
  });

  it('navigates to Saved Ideas and Home from the results stage', async () => {
    jest.spyOn(ideasApi, 'submitIdea').mockResolvedValue(sampleValidResponse);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ValidateModalScreen />);
    });

    const root = renderer!.root;
    const textInput = root.findByType(TextInput);

    await act(async () => {
      textInput.props.onChangeText('A specialized platform for carbon footprint accounting for logistics fleets');
    });

    const submitBtn = root.findByProps({ testID: 'submit-idea-button' });

    await act(async () => {
      submitBtn.props.onPress();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    // Look for "View in Saved Ideas" button
    const viewSavedBtn = root.findByProps({ testID: 'view-saved-ideas-button' });
    expect(viewSavedBtn).toBeDefined();

    await act(async () => {
      viewSavedBtn.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', { screen: 'Ideas' });

    // Look for "Back to Dashboard" button
    const backHomeBtn = root.findByProps({ testID: 'back-to-home-button' });
    expect(backHomeBtn).toBeDefined();

    await act(async () => {
      backHomeBtn.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', { screen: 'Home' });
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
