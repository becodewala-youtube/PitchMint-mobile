import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput, Pressable } from 'react-native';
import { IdeasScreen } from '../screens/IdeasScreen';
import { ideasApi } from '../../../services/api/ideasApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('IdeasScreen Integration (Phase 3A)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleIdeas = [
    {
      _id: 'id-1',
      userId: 'usr-1',
      ideaText: 'AI Dental Clinic\nHygiene recall platform',
      overallScore: 88,
      pitchDeckContent: { problem: 'Manual calls' },
      createdAt: '2026-10-24T10:00:00Z',
    },
    {
      _id: 'id-2',
      userId: 'usr-1',
      ideaText: 'Sub-lease Marketplace\nEscrow student platform',
      overallScore: 72,
      createdAt: '2026-10-22T10:00:00Z',
    },
  ];

  it('renders saved ideas and total count from live endpoint', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: sampleIdeas,
      total: 2,
      totalPages: 1,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('Saved Ideas');
    expect(textNodes).toContain('AI Dental Clinic');
    expect(textNodes).toContain('Sub-lease Marketplace');
  });

  it('filters ideas client-side when typing into search input', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: sampleIdeas,
      total: 2,
      totalPages: 1,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });

    const root = renderer!.root;
    const input = root.findByType(TextInput);

    await act(async () => {
      input.props.onChangeText('Dental');
    });

    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('AI Dental Clinic');
    expect(textNodes).not.toContain('Sub-lease Marketplace');
  });

  it('applies top scored (80+) chip filter correctly', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: sampleIdeas,
      total: 2,
      totalPages: 1,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });

    const root = renderer!.root;
    const topChip = root.findByProps({ accessibilityLabel: 'Top scored (80+)' });
    expect(topChip).toBeDefined();

    await act(async () => {
      topChip.props.onPress();
    });

    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('AI Dental Clinic');
    expect(textNodes).not.toContain('Sub-lease Marketplace');
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
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('No saved ideas yet');
    expect(textNodes).toContain('Submit New Idea');
  });

  it('renders pagination bar and allows changing page when totalPages > 1', async () => {
    const ideasSpy = jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: sampleIdeas,
      total: 20,
      totalPages: 2,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });

    const root = renderer!.root;
    const nextBtn = root.findByProps({ accessibilityLabel: 'Next page' });
    expect(nextBtn).toBeDefined();

    await act(async () => {
      nextBtn.props.onPress();
    });

    expect(ideasSpy).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it('handles error state and retries on press', async () => {
    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockRejectedValueOnce(new Error('Server error'))
      .mockResolvedValueOnce({
        success: true,
        ideas: sampleIdeas,
        total: 2,
        totalPages: 1,
        currentPage: 1,
      });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });

    const root = renderer!.root;
    expect(
      root
        .findAllByType(Text)
        .map((t) => t.props.children)
        .flat(Infinity)
    ).toContain('Could not load saved ideas');

    const retryBtn = root.findByProps({ accessibilityLabel: 'Retry loading ideas' });
    expect(retryBtn).toBeDefined();

    await act(async () => {
      retryBtn.props.onPress();
    });

    expect(ideasSpy).toHaveBeenCalledTimes(2);
  });
});
