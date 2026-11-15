import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Alert } from 'react-native';
import { PitchDeckScreen } from '../PitchDeckScreen';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import * as pdfExportModule from '../../utils/pdfExport';

jest.mock('expo-file-system', () => ({
  Paths: { cache: { uri: 'file:///cache' } },
  File: class MockFile {
    uri = 'file:///cache/test.pdf';
    exists = true;
    size = 1000;
    create = jest.fn();
    delete = jest.fn();
    write = jest.fn();
    bytes = jest.fn(async () => new Uint8Array());
  },
}));

jest.mock('../../utils/pdfExport', () => ({
  ...jest.requireActual('../../utils/pdfExport'),
  exportPitchDeckPdf: jest.fn(),
}));

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockRouteParams: { ideaId: string; ideaTitle?: string; initialSlideIndex?: number } = {
  ideaId: 'idea-123',
  ideaTitle: 'AI Dental Copilot',
};

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
      name: 'Sarah Connor',
      email: 'sarah@pitchmint.app',
      credits: 5,
      plan: 'pro',
    },
    refreshUser: mockRefreshUser,
  }),
}));

describe('PitchDeckScreen — PDF Export Interactions & Error Separation', () => {
  const sampleIdeaWithDeck: BackendIdea = {
    _id: 'idea-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Copilot\nAutomated patient recall software for dental practices.',
    overallScore: 88,
    marketDemandScore: 90,
    competitionScore: 85,
    monetizationFeasibilityScore: 89,
    pitchDeckContent: {
      problem: 'Dental clinics lose 20% of revenue to missed recall appointments.',
      solution: 'Autonomous conversational voice agent that schedules recall visits.',
      marketSize: '$4.2B US dental clinic technology market.',
      businessModel: '$299 per clinic monthly subscription.',
      competitors: 'Legacy SMS systems like Lighthouse 360.',
      goToMarket: 'Direct outreach to dental service organizations (DSOs).',
      team: '2 co-founders with dental tech & AI experience.',
      financials: 'Targeting $1M ARR in year 2 with 80% gross margins.',
      milestones: 'Beta with 15 pilot clinics in Austin, TX.',
      askAndUse: 'Raising $750k seed for clinical integrations.',
    },
    createdAt: '2026-10-24T12:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-123', ideaTitle: 'AI Dental Copilot' };
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('handles PDF export successfully with Preparing PDF loading state and dismissible banner', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);

    let resolveExport: (val: any) => void;
    const exportPromise = new Promise<any>((resolve) => {
      resolveExport = resolve;
    });
    (pdfExportModule.exportPitchDeckPdf as jest.Mock).mockReturnValue(exportPromise);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const exportBtn = root.findByProps({ testID: 'pitch-deck-export-pdf-button' });

    expect(exportBtn.props.title).toBe('Export PDF');
    expect(exportBtn.props.loading).toBe(false);

    // Tap Export PDF
    await act(async () => {
      exportBtn.props.onPress();
    });

    expect(exportBtn.props.title).toBe('Preparing PDF…');
    expect(exportBtn.props.loading).toBe(true);
    expect(exportBtn.props.disabled).toBe(true);

    // Simulate onDownloadSuccess callback from export utility
    await act(async () => {
      const lastCall = (pdfExportModule.exportPitchDeckPdf as jest.Mock).mock.calls[0];
      const options = lastCall?.[2];
      if (options?.onDownloadSuccess) {
        await options.onDownloadSuccess({
          safUri: 'content://.../ai-dental.pdf',
          filename: 'PitchMint_AI_Dental_Copilot_Deck_2026-11-15.pdf',
          location: 'Saved to Download/PitchMint_AI_Dental_Copilot_Deck_2026-11-15.pdf',
        });
      }
      resolveExport!({
        uri: 'file:///cache/ai-dental-copilot-pitch-deck.pdf',
        download: {
          safUri: 'content://.../ai-dental.pdf',
          filename: 'PitchMint_AI_Dental_Copilot_Deck_2026-11-15.pdf',
          location: 'Saved to Download/PitchMint_AI_Dental_Copilot_Deck_2026-11-15.pdf',
        },
      });
    });

    // Verify success banner is rendered
    const banner = root.findByProps({ testID: 'pitch-deck-download-success-banner' });
    expect(banner).toBeDefined();
    const bannerText = banner.findAllByType(Text).map((t) => t.props.children).flat(Infinity).join(' ');
    expect(bannerText).toContain('Pitch Deck downloaded successfully');
    expect(bannerText).toContain('Saved to Download/PitchMint_AI_Dental_Copilot_Deck_2026-11-15.pdf');

    // Dismiss banner via close button
    const closeBtn = root.findByProps({ testID: 'pitch-deck-download-banner-close' });
    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(root.findAllByProps({ testID: 'pitch-deck-download-success-banner' })).toHaveLength(0);
    expect(exportBtn.props.title).toBe('Export PDF');
    expect(exportBtn.props.loading).toBe(false);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('separates sharing failure when download succeeds: retains banner and shows Share Sheet Unavailable', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);

    (pdfExportModule.exportPitchDeckPdf as jest.Mock).mockImplementation(
      async (_title, _content, options) => {
        const downloadInfo = {
          safUri: 'content://.../ai-dental.pdf',
          filename: 'PitchMint_AI_Dental_Copilot_Deck_2026-11-15.pdf',
          location: 'Saved to Download/PitchMint_AI_Dental_Copilot_Deck_2026-11-15.pdf',
        };
        if (options?.onDownloadSuccess) {
          await options.onDownloadSuccess(downloadInfo);
        }
        return {
          uri: 'file:///cache/ai-dental-copilot-pitch-deck.pdf',
          download: downloadInfo,
          shareError: new Error('User cancelled or native share activity failed'),
        };
      }
    );

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const exportBtn = root.findByProps({ testID: 'pitch-deck-export-pdf-button' });

    await act(async () => {
      await exportBtn.props.onPress();
    });

    // Success banner must remain visible because the download succeeded
    const banner = root.findByProps({ testID: 'pitch-deck-download-success-banner' });
    expect(banner).toBeDefined();
    const bannerText = banner.findAllByType(Text).map((t) => t.props.children).flat(Infinity).join(' ');
    expect(bannerText).toContain('Pitch Deck downloaded successfully');

    // Communicates that the share dialog could not be opened, NOT that the export/download failed
    expect(Alert.alert).toHaveBeenCalledWith(
      'Share Sheet Unavailable',
      'Your pitch deck was saved to Downloads, but the share dialog could not be opened.'
    );
    expect(Alert.alert).not.toHaveBeenCalledWith('Export Failed', expect.anything());
  });

  it('displays error alert if PDF generation or download fails, without showing success banner', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);
    (pdfExportModule.exportPitchDeckPdf as jest.Mock).mockRejectedValue(
      new Error('Storage permission denied')
    );

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const exportBtn = root.findByProps({ testID: 'pitch-deck-export-pdf-button' });

    await act(async () => {
      await exportBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Export Failed', 'Storage permission denied');
    expect(root.findAllByProps({ testID: 'pitch-deck-download-success-banner' })).toHaveLength(0);
    expect(exportBtn.props.title).toBe('Export PDF');
    expect(exportBtn.props.loading).toBe(false);
  });

  it('alerts when attempting to export an idea with no pitch deck content', async () => {
    const ideaWithoutDeck: BackendIdea = {
      ...sampleIdeaWithDeck,
      pitchDeckContent: undefined,
    };
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeck);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const exportBtn = root.findByProps({ testID: 'pitch-deck-export-pdf-button' });

    await act(async () => {
      exportBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'No Pitch Deck Available',
      'Please generate or regenerate the pitch deck before exporting.'
    );
    expect(pdfExportModule.exportPitchDeckPdf).not.toHaveBeenCalled();
  });

  it('prevents duplicate concurrent export requests', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);

    let resolveExport: (val: any) => void;
    const exportPromise = new Promise<any>((resolve) => {
      resolveExport = resolve;
    });
    (pdfExportModule.exportPitchDeckPdf as jest.Mock).mockReturnValue(exportPromise);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const exportBtn = root.findByProps({ testID: 'pitch-deck-export-pdf-button' });

    // First tap starts export
    await act(async () => {
      exportBtn.props.onPress();
    });

    // Second tap while still exporting
    await act(async () => {
      exportBtn.props.onPress();
    });

    expect(pdfExportModule.exportPitchDeckPdf).toHaveBeenCalledTimes(1);

    // Clean up deferred promise
    await act(async () => {
      resolveExport!({ uri: 'file:///cache/deck.pdf' });
    });
  });
});
