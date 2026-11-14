import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CanvasScreen, CANVAS_BLOCK_DEFINITIONS, formatCanvasAsMarkdown } from '../CanvasScreen';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import { ApiError } from '../../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockRouteParams: { ideaId: string; ideaTitle?: string; initialBlockIndex?: number } = {
  ideaId: 'idea-canvas-123',
  ideaTitle: 'AI Dental Recall',
};

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

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../../../../context/AuthContext', () => ({
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

describe('CanvasScreen Component (Phase 4B)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-canvas-123', ideaTitle: 'AI Dental Recall' };
    mockUserCredits = 5;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(Clipboard, 'setStringAsync').mockResolvedValue(true);
  });

  const sampleIdeaWithCanvas: BackendIdea = {
    _id: 'idea-canvas-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Recall\nAutomated patient recall software for dental practices.',
    overallScore: 88,
    marketDemandScore: 90,
    competitionScore: 85,
    monetizationFeasibilityScore: 89,
    canvasContent: {
      problem: '1. Dental clinics lose $80k annually to overdue hygiene visits.\n2. Manual front-desk phone calls have <15% answer rates.',
      solution: '1. Autonomous AI voice agent connected to dental practice management systems.',
      uniqueValueProposition: 'Zero-hardware AI agent that reactivates 35% of overdue dental patients in 14 days.',
      unfairAdvantage: 'Direct bi-directional EHR integration with Dentrix and Eaglesoft.',
      customerSegments: '1. Independent dental practices (1-3 chairs).\n2. Multi-location regional dental service organizations.',
      keyMetrics: '1. Patient reactivation rate.\n2. Monthly recurring revenue.\n3. Net promoter score.',
      channels: '1. Dental supply distributor partnerships.\n2. Regional dental association conferences.',
      costStructure: '1. Cloud server infrastructure.\n2. Telephony SIP trunking per minute.\n3. EHR API integration licensing.',
      revenueStreams: '1. $249/month flat SaaS subscription per clinic.\n2. $15 per successfully booked and attended appointment.',
    },
    createdAt: '2026-10-24T12:00:00Z',
  };

  const sampleIdeaWithoutCanvas: BackendIdea = {
    _id: 'idea-canvas-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Recall\nAutomated patient recall software for dental practices.',
    overallScore: 88,
    marketDemandScore: 90,
    competitionScore: 85,
    monetizationFeasibilityScore: 89,
    canvasContent: undefined,
    createdAt: '2026-10-24T12:00:00Z',
  };

  it('renders loading state initially while fetching idea', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockImplementation(() => new Promise(() => {}));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean)
      .join(' ');
    expect(textNodes).toContain('Loading business canvas…');

    await act(async () => {
      renderer.unmount();
    });
  });

  it('renders error state and handles retry when fetching fails', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockRejectedValue(new Error('Network failure'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean)
      .join(' ');
    expect(textNodes).toContain('Could not load canvas');

    // Press retry button
    getSpy.mockResolvedValue(sampleIdeaWithCanvas);
    const retryBtn = root.findByProps({ testID: 'canvas-retry-button' });
    await act(async () => {
      retryBtn.props.onPress();
    });

    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when idea has no canvas and does NOT auto-generate', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithoutCanvas);
    const generateSpy = jest.spyOn(ideasApi, 'generateCanvas');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    // Verified requirement 1: Never automatically generate a canvas when screen mounts
    expect(generateSpy).not.toHaveBeenCalled();

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean)
      .join(' ');
    expect(textNodes).toContain('No Business Model Canvas Generated');
    expect(textNodes).toContain('1 Credit');
    expect(textNodes).toContain('Your Available Balance: 5 Credits');
  });


  it('renders active 9-block canvas with zero credit cost (does not invoke generation)', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);
    const generateSpy = jest.spyOn(ideasApi, 'generateCanvas');
    const regenerateSpy = jest.spyOn(ideasApi, 'regenerateCanvas');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    expect(getSpy).toHaveBeenCalledWith('idea-canvas-123');
    expect(generateSpy).not.toHaveBeenCalled();
    expect(regenerateSpy).not.toHaveBeenCalled();

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean)
      .join(' ');
    expect(textNodes).toContain('Block 1 of 9');
    expect(textNodes).toContain('1. Problem');
    expect(textNodes).toContain('Customer Pain Points');
    expect(textNodes).toContain('Dental clinics lose $80k annually to overdue hygiene visits.');
  });

  it('navigates through all 9 blocks using Next and Previous buttons', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const nextBtn = root.findByProps({ testID: 'canvas-next-block-button' });
    const prevBtn = root.findByProps({ testID: 'canvas-prev-block-button' });

    // Block 1: Problem
    let text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 1 of 9');
    expect(text).toContain('1. Problem');

    // Tap Next -> Block 2: Solution
    await act(async () => {
      nextBtn.props.onPress();
    });
    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 2 of 9');
    expect(text).toContain('2. Solution');
    expect(text).toContain('Autonomous AI voice agent connected to dental practice management systems.');

    // Tap Previous -> Back to Block 1: Problem
    await act(async () => {
      prevBtn.props.onPress();
    });
    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 1 of 9');
    expect(text).toContain('1. Problem');
  });

  it('jumps directly to a block when tapping a block chip from the 9-block selector', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;

    // Tap block 4 chip (Unfair Advantage - index 3)
    const chip3 = root.findByProps({ testID: 'canvas-block-chip-3' });
    await act(async () => {
      chip3.props.onPress();
    });

    let text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 4 of 9');
    expect(text).toContain('4. Unfair Advantage');
    expect(text).toContain('Direct bi-directional EHR integration with Dentrix and Eaglesoft.');

    // Tap block 9 chip (Revenue Streams - index 8)
    const chip8 = root.findByProps({ testID: 'canvas-block-chip-8' });
    await act(async () => {
      chip8.props.onPress();
    });

    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 9 of 9');
    expect(text).toContain('9. Revenue Streams');
    expect(text).toContain('$249/month flat SaaS subscription per clinic.');
  });

  it('supports initialBlockIndex from route params', async () => {
    mockRouteParams = { ideaId: 'idea-canvas-123', initialBlockIndex: 4 }; // Customer Segments (index 4)
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 5 of 9');
    expect(text).toContain('5. Customer Segments');
    expect(text).toContain('Target Market');
  });

  it('copies current section text to clipboard on copy button tap', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const copySectionBtn = root.findByProps({ testID: 'canvas-copy-section-button' });

    await act(async () => {
      await copySectionBtn.props.onPress();
    });

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('Problem (Customer Pain Points)')
    );
    const sectionBtnText = copySectionBtn.findByType(Text);
    expect(sectionBtnText.props.children).toBe('Copied');

    await act(async () => {
      renderer.unmount();
    });
  });

  it('displays error alert and does not show copied state when copying section fails with error', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);
    jest.spyOn(Clipboard, 'setStringAsync').mockRejectedValueOnce(new Error('Permission denied'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const copySectionBtn = root.findByProps({ testID: 'canvas-copy-section-button' });

    await act(async () => {
      await copySectionBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Copy Failed',
      expect.stringContaining('Could not copy Problem to clipboard')
    );
    const sectionBtnText = copySectionBtn.findByType(Text);
    expect(sectionBtnText.props.children).toBe('Copy');

    await act(async () => {
      renderer.unmount();
    });
  });

  it('displays error alert and does not show copied state when copying section returns false', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);
    jest.spyOn(Clipboard, 'setStringAsync').mockResolvedValueOnce(false);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const copySectionBtn = root.findByProps({ testID: 'canvas-copy-section-button' });

    await act(async () => {
      await copySectionBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Copy Failed',
      expect.stringContaining('Could not copy Problem to clipboard')
    );
    const sectionBtnText = copySectionBtn.findByType(Text);
    expect(sectionBtnText.props.children).toBe('Copy');

    await act(async () => {
      renderer.unmount();
    });
  });

  it('copies entire canvas as formatted Markdown on export button tap', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const copyAllBtn = root.findByProps({ testID: 'canvas-copy-all-button' });

    await act(async () => {
      await copyAllBtn.props.onPress();
    });

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('# AI Dental Recall — Business Model Canvas')
    );
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('## 1. Problem (Customer Pain Points)')
    );
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('## 9. Revenue Streams (Monetization)')
    );
    expect(copyAllBtn.props.title).toBe('Canvas Copied to Clipboard!');

    await act(async () => {
      renderer.unmount();
    });
  });

  it('displays error alert and does not show copied state when copying entire canvas fails with error', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);
    jest.spyOn(Clipboard, 'setStringAsync').mockRejectedValueOnce(new Error('Clipboard write error'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const copyAllBtn = root.findByProps({ testID: 'canvas-copy-all-button' });

    await act(async () => {
      await copyAllBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Copy Failed',
      expect.stringContaining('Could not copy Business Model Canvas to clipboard')
    );
    expect(copyAllBtn.props.title).toBe('Copy Entire Canvas (Markdown)');

    await act(async () => {
      renderer.unmount();
    });
  });

  it('displays error alert and does not show copied state when copying entire canvas returns false', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);
    jest.spyOn(Clipboard, 'setStringAsync').mockResolvedValueOnce(false);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const copyAllBtn = root.findByProps({ testID: 'canvas-copy-all-button' });

    await act(async () => {
      await copyAllBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Copy Failed',
      expect.stringContaining('Could not copy Business Model Canvas to clipboard')
    );
    expect(copyAllBtn.props.title).toBe('Copy Entire Canvas (Markdown)');

    await act(async () => {
      renderer.unmount();
    });
  });


  it('handles back button navigation', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const backBtn = root.findByProps({ testID: 'canvas-back-button' });
    await act(async () => {
      backBtn.props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
