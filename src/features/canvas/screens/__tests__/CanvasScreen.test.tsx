import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Alert, RefreshControl } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CanvasScreen } from '../CanvasScreen';
import { ideasApi } from '../../../../services/api/ideasApi';
import { sampleIdeaWithCanvas, sampleIdeaWithoutCanvas } from './canvasFixtures';

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

    getSpy.mockResolvedValue(sampleIdeaWithCanvas);
    const retryBtn = root.findByProps({ testID: 'canvas-retry-button' });
    await act(async () => {
      retryBtn.props.onPress();
    });

    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when idea has no canvas and does NOT auto-generate', async () => {
    const generateSpy = jest.spyOn(ideasApi, 'generateCanvas');
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithoutCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

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

    let text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 1 of 9');
    expect(text).toContain('1. Problem');

    await act(async () => {
      nextBtn.props.onPress();
    });
    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 2 of 9');
    expect(text).toContain('2. Solution');
    expect(text).toContain('Autonomous AI voice agent connected to dental practice management systems.');

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

    const chip3 = root.findByProps({ testID: 'canvas-block-chip-3' });
    await act(async () => {
      chip3.props.onPress();
    });

    let text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 4 of 9');
    expect(text).toContain('4. Unfair Advantage');
    expect(text).toContain('Direct bi-directional EHR integration with Dentrix and Eaglesoft.');

    const chip8 = root.findByProps({ testID: 'canvas-block-chip-8' });
    await act(async () => {
      chip8.props.onPress();
    });

    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 9 of 9');
    expect(text).toContain('9. Revenue Streams');
    expect(text).toContain('$249/month flat SaaS subscription per clinic.');
  });

  it('supports valid initialBlockIndex from route params', async () => {
    mockRouteParams = { ideaId: 'idea-canvas-123', initialBlockIndex: 4 };
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 5 of 9');
    expect(text).toContain('5. Customer Segments');
  });

  it('defaults to index 0 when initialBlockIndex is out-of-range (> 8)', async () => {
    mockRouteParams = { ideaId: 'idea-canvas-123', initialBlockIndex: 99 };
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 1 of 9');
    expect(text).toContain('1. Problem');
  });

  it('defaults to index 0 when initialBlockIndex is negative', async () => {
    mockRouteParams = { ideaId: 'idea-canvas-123', initialBlockIndex: -5 };
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Block 1 of 9');
    expect(text).toContain('1. Problem');
  });

  it('refreshes idea and user balance on manual pull-to-refresh', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const refreshControl = root.findByType(RefreshControl);
    expect(refreshControl).toBeDefined();

    await act(async () => {
      await refreshControl.props.onRefresh();
    });

    expect(getSpy).toHaveBeenCalledTimes(2);
    expect(mockRefreshUser).toHaveBeenCalledTimes(1);
  });

  it('replaces copy timeout and resets copied state on timer expiration', async () => {
    jest.useFakeTimers();
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const copySectionBtn = root.findByProps({ testID: 'canvas-copy-section-button' });

    // First tap sets copied
    await act(async () => {
      await copySectionBtn.props.onPress();
    });
    expect(copySectionBtn.findByType(Text).props.children).toBe('Copied');

    // Advance 1s and tap again (replaces timer)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await act(async () => {
      await copySectionBtn.props.onPress();
    });
    expect(copySectionBtn.findByType(Text).props.children).toBe('Copied');

    // After 2s, timer expires and reverts to Copy
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(copySectionBtn.findByType(Text).props.children).toBe('Copy');

    await act(async () => {
      renderer.unmount();
    });
    jest.useRealTimers();
  });

  it('cleans up copy timeouts on unmount without throwing', async () => {
    jest.useFakeTimers();
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const copySectionBtn = root.findByProps({ testID: 'canvas-copy-section-button' });
    const copyAllBtn = root.findByProps({ testID: 'canvas-copy-all-button' });

    await act(async () => {
      await copySectionBtn.props.onPress();
      await copyAllBtn.props.onPress();
    });

    expect(() => {
      act(() => {
        renderer.unmount();
      });
    }).not.toThrow();

    act(() => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
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
    expect(copySectionBtn.findByType(Text).props.children).toBe('Copied');

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
    expect(copySectionBtn.findByType(Text).props.children).toBe('Copy');

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
    expect(copyAllBtn.props.title).toBe('Canvas Copied to Clipboard!');

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
