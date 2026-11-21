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
  let activeRenderer: ReactTestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (activeRenderer) {
      act(() => {
        activeRenderer?.unmount();
      });
      activeRenderer = null;
    }
    jest.clearAllTimers();
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
    activeRenderer = renderer!;

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

  it('navigates to IdeaDetails with ideaId when an idea card is pressed', async () => {
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
    activeRenderer = renderer!;

    const root = renderer!.root;
    const card = root.findByProps({ testID: 'idea-card-id-1' });
    expect(card).toBeDefined();

    await act(async () => {
      card.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('IdeaDetails', { ideaId: 'id-1' });
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
    activeRenderer = renderer!;

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
    activeRenderer = renderer!;

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
    activeRenderer = renderer!;

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
    activeRenderer = renderer!;

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
    activeRenderer = renderer!;

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

  it('triggers delete confirmation modal, calls deleteIdea and removes card on confirm', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: sampleIdeas,
      total: 2,
      totalPages: 1,
      currentPage: 1,
    });
    const deleteSpy = jest.spyOn(ideasApi, 'deleteIdea').mockResolvedValue({ success: true, message: 'Idea removed' });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    const root = renderer!.root;

    // Verify both ideas rendered initially
    let textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('AI Dental Clinic');
    expect(textNodes).toContain('Sub-lease Marketplace');

    // Click delete button on idea 1
    const deleteBtn = root.findByProps({ testID: 'idea-card-delete-id-1' });
    await act(async () => {
      deleteBtn.props.onPress();
    });

    // Delete confirmation modal should be visible
    const confirmBtn = root.findByProps({ testID: 'ideas-screen-confirm-delete-button' });
    expect(confirmBtn).toBeDefined();

    // Confirm deletion
    await act(async () => {
      await confirmBtn.props.onPress();
    });

    expect(deleteSpy).toHaveBeenCalledWith('id-1');

    // Idea 1 should now be removed from displayed ideas
    textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).not.toContain('AI Dental Clinic');
    expect(textNodes).toContain('Sub-lease Marketplace');
  });

  it('renders detected category and relative timestamps on cards', async () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
    const datedIdeas = [
      {
        _id: 'id-cat-1',
        userId: 'usr-1',
        ideaText: 'Doctor Patient Wellness App\nMedical therapy tracking',
        overallScore: 85,
        createdAt: recentDate,
      },
    ];

    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: datedIdeas,
      total: 42,
      totalPages: 5,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    // Detected category should be Healthcare, not 'Validation'
    expect(textNodes).toContain('Healthcare');
    expect(textNodes).not.toContain('Validation');

    // Relative timestamp should be rendered
    expect(textNodes).toContain('2h ago');

    // All filter chip should reflect global totalCount (42) rather than current page size (1)
    expect(textNodes).toContain('All (42)');
  });

  it('handles invalid or future timestamps gracefully', async () => {
    const futureDate = new Date(Date.now() + 100000).toISOString();
    const edgeIdeas = [
      {
        _id: 'id-edge-1',
        userId: 'usr-1',
        ideaText: 'Decentralized Energy Grid\nSolar micro-generation',
        overallScore: 78,
        createdAt: futureDate,
      },
      {
        _id: 'id-edge-2',
        userId: 'usr-1',
        ideaText: 'Retail Delivery App\nGrocery shopping',
        overallScore: 70,
        createdAt: 'invalid-date-string',
      },
    ];

    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: edgeIdeas,
      total: 2,
      totalPages: 1,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    // Future timestamp formats as 'Just now'
    expect(textNodes).toContain('Just now');
    // Categories correctly detected
    expect(textNodes).toContain('Climate');
    expect(textNodes).toContain('E-commerce');
  });
});
