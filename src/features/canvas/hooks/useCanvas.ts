import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ideasApi, BackendIdea, CanvasResponse, ApiError } from '../../../services/api';
import { hasSubDocument } from '../../../utils/ideaParser';
import { CANVAS_BLOCK_DEFINITIONS } from '../constants/blockDefinitions';
import { formatCanvasAsMarkdown } from '../utils/canvasMarkdown';

export interface UseCanvasOptions {
  ideaId: string;
  initialBlockIndex?: number;
  userCredits?: number;
  refreshUserData?: () => Promise<void>;
}

export const useCanvas = ({
  ideaId,
  initialBlockIndex = 0,
  userCredits = 0,
  refreshUserData,
}: UseCanvasOptions) => {
  const [idea, setIdea] = useState<BackendIdea | CanvasResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(
    Math.min(Math.max(0, initialBlockIndex), CANVAS_BLOCK_DEFINITIONS.length - 1)
  );
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const fetchIdeaData = useCallback(
    async (refreshOnly: boolean = false) => {
      if (!refreshOnly) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const data = await ideasApi.getIdeaById(ideaId);
        if (isMountedRef.current) {
          setIdea(data);
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          let msg = 'Failed to load business canvas. Please check your network connection.';
          if (err instanceof ApiError) {
            if (err.status === 404) {
              msg = 'Idea not found. It may have been deleted or is unavailable.';
            } else if (err.status === 403) {
              msg = 'You are not authorized to view this business canvas.';
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
    fetchIdeaData(false);
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchIdeaData]);

  const handleNextBlock = () => {
    setCurrentBlockIndex((prev) => (prev + 1) % CANVAS_BLOCK_DEFINITIONS.length);
  };

  const handlePrevBlock = () => {
    setCurrentBlockIndex(
      (prev) => (prev - 1 + CANVAS_BLOCK_DEFINITIONS.length) % CANVAS_BLOCK_DEFINITIONS.length
    );
  };

  const handleSelectBlock = (index: number) => {
    if (index >= 0 && index < CANVAS_BLOCK_DEFINITIONS.length) {
      setCurrentBlockIndex(index);
    }
  };

  const handleOpenConfirmModal = () => {
    if (userCredits < 1) {
      Alert.alert(
        'Insufficient Credits',
        'You need at least 1 credit to generate this business model canvas. Please add credits to continue.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const handleManualRefresh = async () => {
    await fetchIdeaData(true);
  };

  const hasCanvas = hasSubDocument(idea?.canvasContent);

  const handleConfirmAction = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const isRegeneration = hasCanvas;
    const previousCanvasString = JSON.stringify(idea?.canvasContent || {});

    try {
      const updatedIdea: CanvasResponse = isRegeneration
        ? await ideasApi.regenerateCanvas(ideaId)
        : await ideasApi.generateCanvas(ideaId);

      if (isMountedRef.current) {
        setIdea(updatedIdea);
      }
      if (refreshUserData) {
        await refreshUserData().catch(() => {});
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;

      let msg = isRegeneration
        ? 'Failed to regenerate business model canvas. Please try again.'
        : 'Failed to generate business model canvas. Please try again.';

      if (err instanceof ApiError) {
        if (err.status === 402) {
          msg = 'Insufficient credits. 1 credit is required to generate your canvas.';
        } else if (err.status === 429) {
          msg = 'Rate limit reached: Maximum 2 generation requests allowed per minute. Please wait 60 seconds before trying again.';
        } else if (err.status === 0) {
          Alert.alert(
            'Network Request Timed Out',
            'Your generation request was sent, but the network connection was interrupted. The AI may still be processing your canvas on the server.\n\nPlease tap "Check Status" in a few moments rather than resubmitting.',
            [
              {
                text: 'Check Status',
                onPress: async () => {
                  try {
                    const fresh = await ideasApi.getIdeaById(ideaId);
                    if (isMountedRef.current && fresh?.canvasContent) {
                      const newCanvasString = JSON.stringify(fresh.canvasContent);
                      if (!isRegeneration || newCanvasString !== previousCanvasString) {
                        setIdea(fresh);
                        if (refreshUserData) {
                          await refreshUserData().catch(() => {});
                        }
                        Alert.alert('Canvas Updated', 'Your canvas was generated successfully.');
                        return;
                      }
                    }
                    Alert.alert(
                      'Still Processing',
                      'The canvas update has not appeared yet. Please pull to refresh in a few moments.'
                    );
                  } catch {
                    Alert.alert('Connection Error', 'Could not reach server to verify canvas status.');
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

      Alert.alert(isRegeneration ? 'Regeneration Failed' : 'Generation Failed', msg, [{ text: 'OK' }]);
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
      isSubmittingRef.current = false;
    }
  };

  const handleCopyCurrentSection = async () => {
    const currentDef = CANVAS_BLOCK_DEFINITIONS[currentBlockIndex];
    const text = idea?.canvasContent?.[currentDef.key]?.trim() || 'Not specified';
    const payload = `${currentDef.index}. ${currentDef.title} (${currentDef.category})\n\n${text}`;

    try {
      const result = await Clipboard.setStringAsync(payload);
      if (result === false) {
        if (isMountedRef.current) setCopiedSection(false);
        Alert.alert('Copy Failed', `Could not copy ${currentDef.title} to clipboard. Please try again.`);
        return;
      }
      if (isMountedRef.current) {
        setCopiedSection(true);
        setTimeout(() => {
          if (isMountedRef.current) setCopiedSection(false);
        }, 2000);
      }
    } catch {
      if (isMountedRef.current) setCopiedSection(false);
      Alert.alert('Copy Failed', `Could not copy ${currentDef.title} to clipboard. Please try again.`);
    }
  };

  const handleCopyEntireCanvas = async (displayTitle: string) => {
    if (!idea?.canvasContent) {
      Alert.alert('Cannot Copy', 'No canvas content is available to copy.');
      return;
    }

    const markdown = formatCanvasAsMarkdown(displayTitle, idea.canvasContent);

    try {
      const result = await Clipboard.setStringAsync(markdown);
      if (result === false) {
        if (isMountedRef.current) setCopiedAll(false);
        Alert.alert('Copy Failed', 'Could not copy Business Model Canvas to clipboard. Please try again.');
        return;
      }
      if (isMountedRef.current) {
        setCopiedAll(true);
        setTimeout(() => {
          if (isMountedRef.current) setCopiedAll(false);
        }, 2500);
      }
    } catch {
      if (isMountedRef.current) setCopiedAll(false);
      Alert.alert('Copy Failed', 'Could not copy Business Model Canvas to clipboard. Please try again.');
    }
  };

  return {
    idea,
    isLoading,
    isRefreshing,
    isSubmitting,
    currentBlockIndex,
    error,
    showConfirmModal,
    setShowConfirmModal,
    copiedSection,
    copiedAll,
    hasCanvas,
    fetchIdeaData,
    handleNextBlock,
    handlePrevBlock,
    handleSelectBlock,
    handleOpenConfirmModal,
    handleManualRefresh,
    handleConfirmAction,
    handleCopyCurrentSection,
    handleCopyEntireCanvas,
  };
};
