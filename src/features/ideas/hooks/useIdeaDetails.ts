import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList, RootStackNavigationProp } from '../../../navigation/types';
import {
  ideasApi,
  BackendIdea,
  PitchDeckResponse,
  CanvasResponse,
} from '../../../services/api/ideasApi';
import { ApiError } from '../../../services/api/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { parseIdeaTitleAndDesc, hasSubDocument } from '../../../utils/ideaParser';
import { formatDisplayDate } from '../../../utils/date';
import { colors } from '../../../theme';

export interface UseIdeaDetailsResult {
  ideaId: string;
  idea: BackendIdea | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  expandedSection: string | null;
  setExpandedSection: (section: string | null) => void;
  isGeneratingDeck: boolean;
  showDeckConfirmModal: boolean;
  setShowDeckConfirmModal: (show: boolean) => void;
  isGeneratingCanvas: boolean;
  showCanvasConfirmModal: boolean;
  setShowCanvasConfirmModal: (show: boolean) => void;
  fetchIdeaDetails: (isPullToRefresh?: boolean) => Promise<void>;
  handleRefresh: () => void;
  handleBack: () => void;
  handleValidateAnother: () => void;
  handleViewPitchDeck: (initialSlideIndex?: number) => void;
  handleOpenDeckConfirm: () => void;
  handleConfirmGenerateDeck: () => Promise<void>;
  handleViewCanvas: (initialBlockIndex?: number) => void;
  handleOpenCanvasConfirm: () => void;
  handleConfirmGenerateCanvas: () => Promise<void>;
  parsedTitle: string;
  dateFormatted: string;
  overallScore: number;
  marketScore: number;
  competitionScore: number;
  monetizationScore: number;
  verdictText: string;
  verdictColor: string;
  marketText: string;
  competitionText: string;
  monetizationText: string;
  overallText?: string;
  hasPitchDeck: boolean;
  hasCanvas: boolean;
  hasCompetitors: boolean;
  hasSimulation: boolean;
  userCredits: number;
}

export function useIdeaDetails(): UseIdeaDetailsResult {
  const route = useRoute<RouteProp<RootStackParamList, 'IdeaDetails'>>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { ideaId } = route.params;

  const { user, refreshUser } = useAuth();
  const [idea, setIdea] = useState<BackendIdea | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState<boolean>(false);
  const [showDeckConfirmModal, setShowDeckConfirmModal] = useState<boolean>(false);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState<boolean>(false);
  const [showCanvasConfirmModal, setShowCanvasConfirmModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('demand');

  const isMountedRef = useRef<boolean>(true);
  const isSubmittingDeckRef = useRef<boolean>(false);
  const isSubmittingCanvasRef = useRef<boolean>(false);

  const fetchIdeaDetails = useCallback(
    async (isPullToRefresh = false) => {
      if (isPullToRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await ideasApi.getIdeaById(ideaId);
        if (isMountedRef.current) {
          setIdea(data);
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          let msg = 'Failed to load saved idea details. Please check your network connection.';
          if (err instanceof ApiError) {
            if (err.status === 404) {
              msg = 'Idea not found. It may have been deleted or is unavailable.';
            } else if (err.status === 403) {
              msg = 'You are not authorized to access this saved idea.';
            } else {
              msg = err.message || msg;
            }
          } else if (err?.message) {
            msg = err.message;
          }
          setError(msg);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [ideaId]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchIdeaDetails();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchIdeaDetails]);

  const handleRefresh = () => {
    fetchIdeaDetails(true);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleValidateAnother = () => {
    navigation.navigate('ValidateModal');
  };

  const userCredits = user?.credits ?? 0;
  const parsedTitle = idea?.ideaText ? parseIdeaTitleAndDesc(idea.ideaText).title : '';
  const dateFormatted = idea?.createdAt ? formatDisplayDate(idea.createdAt) : '';

  const overallScore = typeof idea?.overallScore === 'number' ? idea.overallScore : 0;
  const marketScore =
    typeof idea?.marketDemandScore === 'number'
      ? idea.marketDemandScore
      : idea?.analysis?.marketDemand?.score ?? 0;
  const competitionScore =
    typeof idea?.competitionScore === 'number'
      ? idea.competitionScore
      : idea?.analysis?.competition?.score ?? 0;
  const monetizationScore =
    typeof idea?.monetizationFeasibilityScore === 'number'
      ? idea.monetizationFeasibilityScore
      : idea?.analysis?.monetization?.score ?? 0;

  const verdictText =
    overallScore >= 80
      ? 'Strong Potential'
      : overallScore >= 60
      ? 'Moderate Potential'
      : 'Needs Iteration';
  const verdictColor =
    overallScore >= 80
      ? colors.tones.emerald.text
      : overallScore >= 60
      ? colors.tones.amber.text
      : colors.tones.red.text;

  const marketText =
    idea?.analysis?.marketDemand?.text || 'No market demand explanation persisted for this idea.';
  const competitionText =
    idea?.analysis?.competition?.text || 'No competition explanation persisted for this idea.';
  const monetizationText =
    idea?.analysis?.monetization?.text ||
    'No monetization feasibility explanation persisted for this idea.';
  const overallText = idea?.analysis?.overall?.text;

  const hasPitchDeck = hasSubDocument(idea?.pitchDeckContent);
  const hasCanvas = hasSubDocument(idea?.canvasContent);
  const hasCompetitors = Boolean(
    idea?.competitorAnalysis?.competitors && idea.competitorAnalysis.competitors.length > 0
  );
  const hasSimulation = Boolean(
    idea?.pitchSimulation?.questions && idea.pitchSimulation.questions.length > 0
  );

  const handleViewPitchDeck = (initialSlideIndex: number = 0) => {
    navigation.navigate('PitchDeck', {
      ideaId,
      ideaTitle: parsedTitle,
      initialSlideIndex,
    });
  };

  const handleOpenDeckConfirm = () => {
    if (userCredits < 1) {
      Alert.alert(
        'Insufficient Credits',
        'You need at least 1 credit to generate a pitch deck. Please add credits to your account.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowDeckConfirmModal(true);
  };

  const handleConfirmGenerateDeck = async () => {
    if (isSubmittingDeckRef.current) return;
    isSubmittingDeckRef.current = true;
    setIsGeneratingDeck(true);
    setShowDeckConfirmModal(false);

    const isRegen = hasPitchDeck;
    const prevDeckString = JSON.stringify(idea?.pitchDeckContent || {});

    try {
      const updatedIdea: PitchDeckResponse = isRegen
        ? await ideasApi.regeneratePitchDeck(ideaId)
        : await ideasApi.generatePitchDeck(ideaId);

      if (isMountedRef.current) {
        setIdea(updatedIdea);
      }
      await refreshUser().catch(() => {});

      navigation.navigate('PitchDeck', {
        ideaId,
        ideaTitle: parsedTitle,
      });
    } catch (err: any) {
      if (!isMountedRef.current) return;

      let msg = isRegen
        ? 'Failed to regenerate pitch deck. Please try again.'
        : 'Failed to generate pitch deck. Please try again.';
      if (err instanceof ApiError) {
        if (err.status === 402) {
          msg = 'Insufficient credits. 1 credit is required to generate a pitch deck.';
        } else if (err.status === 429) {
          msg = 'Rate limit reached: Maximum 2 generation requests allowed per minute. Please wait 60 seconds before trying again.';
        } else if (err.isCancelled) {
          msg = isRegen
            ? 'Pitch deck regeneration was cancelled.'
            : 'Pitch deck generation was cancelled.';
        } else if (err.isTimeout || err.status === 0) {
          Alert.alert(
            'Request Timed Out',
            'Your pitch deck request was sent, but the network connection timed out. The AI may still be generating your pitch deck on the server.\n\nPlease tap "Check Status" in a few moments rather than resubmitting to avoid duplicate credit charges.',
            [
              {
                text: 'Check Status',
                onPress: async () => {
                  try {
                    const fresh = await ideasApi.getIdeaById(ideaId);
                    if (!isMountedRef.current) return;
                    if (hasSubDocument(fresh?.pitchDeckContent)) {
                      const newDeckString = JSON.stringify(fresh.pitchDeckContent);
                      if (!isRegen || newDeckString !== prevDeckString) {
                        setIdea(fresh);
                        await refreshUser().catch(() => {});
                        navigation.navigate('PitchDeck', {
                          ideaId,
                          ideaTitle: parsedTitle,
                        });
                        return;
                      }
                    }
                    Alert.alert(
                      'Still Processing',
                      'The pitch deck has not appeared yet. Please pull to refresh in a few moments.'
                    );
                  } catch {
                    if (isMountedRef.current) {
                      Alert.alert('Connection Error', 'Could not reach server to verify pitch deck status.');
                    }
                  }
                },
              },
              { text: 'OK', style: 'cancel' },
            ]
          );
          return;
        } else {
          msg = err.message || msg;
        }
      } else if (err?.message) {
        msg = err.message;
      }

      Alert.alert('Generation Failed', msg, [{ text: 'OK' }]);
    } finally {
      if (isMountedRef.current) {
        setIsGeneratingDeck(false);
        isSubmittingDeckRef.current = false;
      }
    }
  };

  const handleViewCanvas = (initialBlockIndex: number = 0) => {
    navigation.navigate('Canvas', {
      ideaId,
      ideaTitle: parsedTitle,
      initialBlockIndex,
    });
  };

  const handleOpenCanvasConfirm = () => {
    if (userCredits < 1) {
      Alert.alert(
        'Insufficient Credits',
        'You need at least 1 credit to generate a Business Model Canvas. Please add credits to your account.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowCanvasConfirmModal(true);
  };

  const handleConfirmGenerateCanvas = async () => {
    if (isSubmittingCanvasRef.current) return;
    isSubmittingCanvasRef.current = true;
    setIsGeneratingCanvas(true);
    setShowCanvasConfirmModal(false);

    const isRegen = hasCanvas;
    const prevCanvasString = JSON.stringify(idea?.canvasContent || {});

    try {
      const updatedIdea: CanvasResponse = isRegen
        ? await ideasApi.regenerateCanvas(ideaId)
        : await ideasApi.generateCanvas(ideaId);

      if (isMountedRef.current) {
        setIdea(updatedIdea);
      }
      await refreshUser().catch(() => {});

      navigation.navigate('Canvas', {
        ideaId,
        ideaTitle: parsedTitle,
        initialBlockIndex: 0,
      });
    } catch (err: any) {
      if (!isMountedRef.current) return;

      let msg = isRegen
        ? 'Failed to regenerate business model canvas. Please try again.'
        : 'Failed to generate business model canvas. Please try again.';

      if (err instanceof ApiError) {
        if (err.status === 402) {
          msg = 'Insufficient credits. 1 credit is required to generate a canvas.';
        } else if (err.status === 429) {
          msg = 'Rate limit reached: Maximum 2 generation requests allowed per minute. Please wait 60 seconds before trying again.';
        } else if (err.isCancelled) {
          msg = isRegen
            ? 'Business model canvas regeneration was cancelled.'
            : 'Business model canvas generation was cancelled.';
        } else if (err.isTimeout || err.status === 0) {
          Alert.alert(
            'Network Request Timed Out',
            'Your generation request was sent, but the network connection was interrupted. The AI may still be processing your canvas on the server.\n\nPlease tap "Check Status" in a few moments rather than resubmitting.',
            [
              {
                text: 'Check Status',
                onPress: async () => {
                  try {
                    const fresh = await ideasApi.getIdeaById(ideaId);
                    if (!isMountedRef.current) return;
                    if (hasSubDocument(fresh?.canvasContent)) {
                      const newCanvasString = JSON.stringify(fresh.canvasContent);
                      if (!isRegen || newCanvasString !== prevCanvasString) {
                        setIdea(fresh);
                        await refreshUser().catch(() => {});
                        navigation.navigate('Canvas', {
                          ideaId,
                          ideaTitle: parsedTitle,
                          initialBlockIndex: 0,
                        });
                        return;
                      }
                    }
                    Alert.alert(
                      'Still Processing',
                      'The canvas update has not appeared yet. Please pull to refresh in a few moments.'
                    );
                  } catch {
                    if (isMountedRef.current) {
                      Alert.alert('Connection Error', 'Could not reach server to verify canvas status.');
                    }
                  }
                },
              },
              { text: 'OK', style: 'cancel' },
            ]
          );
          return;
        } else {
          msg = err.message || msg;
        }
      } else if (err?.message) {
        msg = err.message;
      }

      Alert.alert(isRegen ? 'Regeneration Failed' : 'Generation Failed', msg, [{ text: 'OK' }]);
    } finally {
      if (isMountedRef.current) {
        setIsGeneratingCanvas(false);
        isSubmittingCanvasRef.current = false;
      }
    }
  };

  return {
    ideaId,
    idea,
    isLoading,
    isRefreshing,
    error,
    expandedSection,
    setExpandedSection,
    isGeneratingDeck,
    showDeckConfirmModal,
    setShowDeckConfirmModal,
    isGeneratingCanvas,
    showCanvasConfirmModal,
    setShowCanvasConfirmModal,
    fetchIdeaDetails,
    handleRefresh,
    handleBack,
    handleValidateAnother,
    handleViewPitchDeck,
    handleOpenDeckConfirm,
    handleConfirmGenerateDeck,
    handleViewCanvas,
    handleOpenCanvasConfirm,
    handleConfirmGenerateCanvas,
    parsedTitle,
    dateFormatted,
    overallScore,
    marketScore,
    competitionScore,
    monetizationScore,
    verdictText,
    verdictColor,
    marketText,
    competitionText,
    monetizationText,
    overallText,
    hasPitchDeck,
    hasCanvas,
    hasCompetitors,
    hasSimulation,
    userCredits,
  };
}
