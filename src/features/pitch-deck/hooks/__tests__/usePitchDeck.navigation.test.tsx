import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { usePitchDeck, UsePitchDeckOptions } from '../usePitchDeck';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import { SLIDE_DEFINITIONS } from '../../constants/slideDefinitions';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('usePitchDeck - Navigation and Boundary Clamping', () => {
  let hookResult: ReturnType<typeof usePitchDeck>;

  const sampleIdea: BackendIdea = {
    _id: 'idea-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Recall software',
    overallScore: 88,
    pitchDeckContent: {
      problem: 'Dental clinics lose 20% of revenue.',
      solution: 'AI automated recall voice agent.',
    },
    createdAt: '2026-10-24T12:00:00Z',
  };

  function TestHarness(props: UsePitchDeckOptions) {
    hookResult = usePitchDeck(props);
    return null;
  }

  const renderHook = async (props: UsePitchDeckOptions = { ideaId: 'idea-123' }) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<TestHarness {...props} />);
    });
    return renderer!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdea);
  });

  it('initializes at initialSlideIndex 0 by default', async () => {
    await renderHook({ ideaId: 'idea-123' });
    expect(hookResult.currentSlideIndex).toBe(0);
  });

  it('initializes at custom initialSlideIndex if provided', async () => {
    await renderHook({ ideaId: 'idea-123', initialSlideIndex: 4 });
    expect(hookResult.currentSlideIndex).toBe(4);
  });

  it('clamps handlePrevSlide at 0 (first slide boundary)', async () => {
    await renderHook({ ideaId: 'idea-123', initialSlideIndex: 0 });
    expect(hookResult.currentSlideIndex).toBe(0);

    act(() => {
      hookResult.handlePrevSlide();
    });
    // Should NOT wrap to 9, must stay clamped at 0
    expect(hookResult.currentSlideIndex).toBe(0);
  });

  it('advances sequentially with handleNextSlide and clamps at index 9 (last slide boundary)', async () => {
    await renderHook({ ideaId: 'idea-123', initialSlideIndex: 8 });
    expect(hookResult.currentSlideIndex).toBe(8);

    act(() => {
      hookResult.handleNextSlide();
    });
    expect(hookResult.currentSlideIndex).toBe(9);

    // Call handleNextSlide again on the last slide
    act(() => {
      hookResult.handleNextSlide();
    });
    // Should NOT wrap to 0, must stay clamped at 9
    expect(hookResult.currentSlideIndex).toBe(9);
  });

  it('jumps directly to valid slide indices via handleSelectSlide and ignores invalid indices', async () => {
    await renderHook({ ideaId: 'idea-123', initialSlideIndex: 0 });

    act(() => {
      hookResult.handleSelectSlide(5);
    });
    expect(hookResult.currentSlideIndex).toBe(5);

    // Negative index ignored
    act(() => {
      hookResult.handleSelectSlide(-1);
    });
    expect(hookResult.currentSlideIndex).toBe(5);

    // Out of bounds index ignored
    act(() => {
      hookResult.handleSelectSlide(10);
    });
    expect(hookResult.currentSlideIndex).toBe(5);
  });
});
