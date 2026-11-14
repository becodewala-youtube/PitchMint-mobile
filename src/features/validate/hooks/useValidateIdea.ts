import { useState, useEffect, useRef } from 'react';
import { ideasApi, SubmitIdeaResponse } from '../../../services/api/ideasApi';
import { ApiError } from '../../../services/api/apiClient';
import {
  ANALYZING_STEPS,
  MIN_IDEA_LENGTH,
  MAX_IDEA_LENGTH,
  ModalStage,
} from '../constants/validateConstants';

export interface UseValidateIdeaOptions {
  initialCredits?: number;
  refreshUser?: () => Promise<void>;
}

export const useValidateIdea = ({
  initialCredits = 0,
  refreshUser,
}: UseValidateIdeaOptions) => {
  const [stage, setStage] = useState<ModalStage>('form');
  const [ideaText, setIdeaText] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('demand');

  const [validationResult, setValidationResult] = useState<SubmitIdeaResponse | null>(null);
  const [creditBalance, setCreditBalance] = useState<number>(initialCredits);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAmbiguousError, setIsAmbiguousError] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
    };
  }, []);

  const handleUseExample = () => {
    setIdeaText(
      'A marketplace that connects freelance designers with early-stage startups for fixed-price, 7-day design sprints. Founders get on-demand design capacity and designers get predictable income.'
    );
    setSubmitError(null);
  };

  const handleTextChange = (text: string) => {
    setIdeaText(text);
    if (submitError) {
      setSubmitError(null);
      setIsAmbiguousError(false);
    }
  };

  const handleInitiateValidation = () => {
    const trimmed = ideaText.trim();

    if (!trimmed) {
      setSubmitError('Please provide your startup idea.');
      setIsAmbiguousError(false);
      return;
    }

    if (trimmed.length < MIN_IDEA_LENGTH) {
      setSubmitError(
        `Please describe your idea in a bit more detail (at least ${MIN_IDEA_LENGTH} characters).`
      );
      setIsAmbiguousError(false);
      return;
    }

    if (ideaText.length > MAX_IDEA_LENGTH) {
      setSubmitError(
        `Startup idea exceeds the maximum limit of ${MAX_IDEA_LENGTH} characters.`
      );
      setIsAmbiguousError(false);
      return;
    }

    if (creditBalance < 1) {
      setSubmitError(
        'Insufficient credits. You need at least 1 credit to validate an idea.'
      );
      setIsAmbiguousError(false);
      return;
    }

    setSubmitError(null);
    setIsAmbiguousError(false);
    setShowConfirmModal(true);
  };

  const handleConfirmValidation = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setShowConfirmModal(false);
    setSubmitError(null);
    setIsAmbiguousError(false);

    setStage('analyzing');
    setActiveStep(0);

    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    stepTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      setActiveStep((prev) => {
        if (prev < ANALYZING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    try {
      const trimmed = ideaText.trim();
      const result = await ideasApi.submitIdea({ ideaText: trimmed });

      if (!isMountedRef.current) return;

      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }

      setActiveStep(ANALYZING_STEPS.length);
      setValidationResult(result);

      if (typeof result.userCredits === 'number') {
        setCreditBalance(result.userCredits);
      }
      if (refreshUser) {
        refreshUser().catch(() => {});
      }

      setTimeout(() => {
        if (isMountedRef.current) {
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          setStage('results');
        }
      }, 500);
    } catch (err: any) {
      if (!isMountedRef.current) return;

      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }

      setIsSubmitting(false);
      isSubmittingRef.current = false;

      let errorMessage = 'An error occurred while validating your startup idea.';
      let isAmbiguous = false;

      if (err instanceof ApiError) {
        if (err.status === 402) {
          errorMessage =
            err.message ||
            'Insufficient credits. 1 credit is required to validate an idea.';
          setCreditBalance(0);
        } else if (err.status === 401) {
          errorMessage = 'Your session has expired. Please sign in again.';
        } else if (err.status === 400) {
          errorMessage = err.message || 'Please provide a valid startup idea.';
        } else if (err.isCancelled) {
          isAmbiguous = false;
          errorMessage = 'Validation request was cancelled.';
        } else if (err.status === 0 || err.isTimeout) {
          isAmbiguous = true;
          errorMessage =
            'Network connection interrupted or timed out. If the request reached the server, your validation may still process. Please check your Saved Ideas before re-submitting to avoid duplicate charges.';
        } else if (err.status >= 500) {
          isAmbiguous = true;
          errorMessage =
            err.message ||
            'The server encountered an error while processing your idea. Please check your Saved Ideas to verify if it was saved before submitting again.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setSubmitError(errorMessage);
      setIsAmbiguousError(isAmbiguous);
      setStage('form');
    }
  };

  const handleValidateAnother = () => {
    setIdeaText('');
    setValidationResult(null);
    setSubmitError(null);
    setIsAmbiguousError(false);
    setShowConfirmModal(false);
    setStage('form');
  };

  const trimmedLength = ideaText.trim().length;
  const isInputValid =
    trimmedLength >= MIN_IDEA_LENGTH && ideaText.length <= MAX_IDEA_LENGTH;
  const isCreditsSufficient = creditBalance >= 1;
  const isSubmitDisabled = !isInputValid || !isCreditsSufficient || isSubmitting;

  return {
    stage,
    ideaText,
    activeStep,
    expandedSection,
    setExpandedSection,
    validationResult,
    creditBalance,
    isSubmitting,
    submitError,
    isAmbiguousError,
    showConfirmModal,
    setShowConfirmModal,
    isSubmitDisabled,
    handleUseExample,
    handleTextChange,
    handleInitiateValidation,
    handleConfirmValidation,
    handleValidateAnother,
  };
};
