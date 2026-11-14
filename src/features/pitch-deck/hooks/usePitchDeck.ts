import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { ideasApi, BackendIdea, PitchDeckResponse, ApiError } from '../../../services/api';
import { SLIDE_DEFINITIONS } from '../constants/slideDefinitions';

export interface UsePitchDeckOptions {
  ideaId: string;
  initialSlideIndex?: number;
  userCredits?: number;
  refreshUserData?: () => Promise<void>;
}

export const usePitchDeck = ({
  ideaId,
  initialSlideIndex = 0,
  userCredits = 0,
  refreshUserData,
}: UsePitchDeckOptions) => {
  const [idea, setIdea] = useState<BackendIdea | PitchDeckResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(initialSlideIndex);
  const [error, setError] = useState<string | null>(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const fetchIdeaData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ideasApi.getIdeaById(ideaId);
      if (isMountedRef.current) {
        setIdea(data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        let msg = 'Failed to load pitch deck. Please check your network connection.';
        if (err instanceof ApiError) {
          if (err.status === 404) {
            msg = 'Idea not found. It may have been deleted or is unavailable.';
          } else if (err.status === 403) {
            msg = 'You are not authorized to view this pitch deck.';
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
      }
    }
  }, [ideaId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchIdeaData();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchIdeaData]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDE_DEFINITIONS.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDE_DEFINITIONS.length) % SLIDE_DEFINITIONS.length);
  };

  const handleSelectSlide = (index: number) => {
    if (index >= 0 && index < SLIDE_DEFINITIONS.length) {
      setCurrentSlideIndex(index);
    }
  };

  const handleOpenRegenerateModal = () => {
    if (userCredits < 1) {
      Alert.alert(
        'Insufficient Credits',
        'You need at least 1 credit to regenerate this pitch deck. Please add credits to continue.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowRegenerateModal(true);
  };

  const handleConfirmRegenerate = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setShowRegenerateModal(false);

    try {
      const updatedIdea: PitchDeckResponse = await ideasApi.regeneratePitchDeck(ideaId);
      if (isMountedRef.current) {
        setIdea(updatedIdea);
      }
      if (refreshUserData) {
        await refreshUserData().catch(() => {});
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;

      let msg = 'Failed to regenerate pitch deck. Please try again.';
      if (err instanceof ApiError) {
        if (err.status === 402) {
          msg = 'Insufficient credits. 1 credit is required to regenerate your pitch deck.';
        } else if (err.status === 429) {
          msg = 'Rate limit reached: Maximum 2 generation requests allowed per minute. Please wait 60 seconds before trying again.';
        } else {
          msg = err.message || msg;
        }
      } else if (err?.message) {
        msg = err.message;
      }

      if (err instanceof ApiError && err.status === 0) {
        try {
          const fresh = await ideasApi.getIdeaById(ideaId);
          if (isMountedRef.current && fresh?.pitchDeckContent) {
            setIdea(fresh);
            if (refreshUserData) {
              await refreshUserData().catch(() => {});
            }
            return;
          }
        } catch {
          // Keep original error message
        }
      }

      Alert.alert('Regeneration Failed', msg, [{ text: 'OK' }]);
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
      isSubmittingRef.current = false;
    }
  };

  return {
    idea,
    isLoading,
    isSubmitting,
    currentSlideIndex,
    error,
    showRegenerateModal,
    setShowRegenerateModal,
    fetchIdeaData,
    handleNextSlide,
    handlePrevSlide,
    handleSelectSlide,
    handleOpenRegenerateModal,
    handleConfirmRegenerate,
  };
};
