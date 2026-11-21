import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, PanResponder } from 'react-native';
import { PitchDeckSlideViewer } from '../PitchDeckSlideViewer';
import { SLIDE_DEFINITIONS } from '../../constants/slideDefinitions';
import { colors } from '../../../../theme';
import { SLIDE_TONE_BACKGROUNDS } from '../../screens/PitchDeckScreen.styles';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock PanResponder.create to bridge gestureState directly in unit tests without native TouchHistoryMath
jest.spyOn(PanResponder, 'create').mockImplementation((config: any) => {
  return {
    panHandlers: {
      onMoveShouldSetResponderCapture: (e: any, gs: any) =>
        config.onMoveShouldSetPanResponderCapture ? config.onMoveShouldSetPanResponderCapture(e, gs) : false,
      onMoveShouldSetResponder: (e: any, gs: any) =>
        config.onMoveShouldSetPanResponder ? config.onMoveShouldSetPanResponder(e, gs) : false,
      onResponderGrant: (e: any, gs: any) => config.onPanResponderGrant?.(e, gs),
      onResponderMove: (e: any, gs: any) => config.onPanResponderMove?.(e, gs),
      onResponderRelease: (e: any, gs: any) => config.onPanResponderRelease?.(e, gs),
      onResponderTerminate: (e: any, gs: any) => config.onPanResponderTerminate?.(e, gs),
    },
  } as any;
});

describe('PitchDeckSlideViewer (Phase 2C.1)', () => {
  const defaultProps = {
    currentDef: SLIDE_DEFINITIONS[0], // Problem: tone 'red', category 'Market Pain Point'
    currentSlideIndex: 0,
    totalSlides: 10,
    slideContent: 'Dental clinics lose 20% of revenue to missed recall appointments.',
    onPrevSlide: jest.fn(),
    onNextSlide: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders unified slide presentation card with two-digit number, category kicker, and brand mark', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckSlideViewer {...defaultProps} />);
    });

    const root = renderer!.root;
    const slideCard = root.findByProps({ testID: 'pitch-deck-slide-card' });
    expect(slideCard).toBeDefined();

    // Verify category kicker: "01 · MARKET PAIN POINT"
    const kicker = root.findByProps({ testID: 'pitch-deck-slide-category-kicker' });
    expect(kicker.props.children).toBe('01 · MARKET PAIN POINT');

    // Verify PitchMint brand mark text & logo accessibility
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('PitchMint');

    const brandLogo = root.findByProps({ accessibilityLabel: 'PitchMint Logo' });
    expect(brandLogo).toBeDefined();
  });

  it('applies tone-specific styling (border, background, kicker color) for each tone', () => {
    // Test red tone (Problem)
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckSlideViewer {...defaultProps} />);
    });
    let root = renderer!.root;
    let card = root.findByProps({ testID: 'pitch-deck-slide-card' });
    let cardStyles = card.props.style.flat(Infinity);
    expect(cardStyles).toContainEqual(expect.objectContaining({
      borderColor: colors.tones.red.border,
      backgroundColor: SLIDE_TONE_BACKGROUNDS.red,
    }));

    // Test violet tone (Business Model - index 3)
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckSlideViewer
          {...defaultProps}
          currentDef={SLIDE_DEFINITIONS[3]}
          currentSlideIndex={3}
        />
      );
    });
    root = renderer!.root;
    card = root.findByProps({ testID: 'pitch-deck-slide-card' });
    cardStyles = card.props.style.flat(Infinity);
    expect(cardStyles).toContainEqual(expect.objectContaining({
      borderColor: colors.tones.violet.border,
      backgroundColor: SLIDE_TONE_BACKGROUNDS.violet,
    }));
  });

  it('renders correct two-digit slide numbers and categories for all 10 authoritative slide definitions', () => {
    SLIDE_DEFINITIONS.forEach((def, index) => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PitchDeckSlideViewer
            {...defaultProps}
            currentDef={def}
            currentSlideIndex={index}
          />
        );
      });

      const root = renderer!.root;
      const kicker = root.findByProps({ testID: 'pitch-deck-slide-category-kicker' });
      const expectedNum = String(index + 1).padStart(2, '0');
      const expectedKicker = `${expectedNum} · ${def.category.toUpperCase()}`;
      expect(kicker.props.children).toBe(expectedKicker);
    });
  });

  it('renders structured bullet points with tone dot indicators when explicit bullet points exist', () => {
    const bulletContent = `
      • Dental clinics lose 20% of revenue to missed recall appointments.
      • Receptionists spend 3+ hours daily on manual phone outreach.
      • No existing tool integrates conversational voice AI with clinical EHRs.
    `;

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckSlideViewer
          {...defaultProps}
          slideContent={bulletContent}
        />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('Dental clinics lose 20% of revenue to missed recall appointments.');
    expect(textNodes).toContain('Receptionists spend 3+ hours daily on manual phone outreach.');
    expect(textNodes).toContain('No existing tool integrates conversational voice AI with clinical EHRs.');
  });

  it('renders numbered lists properly with marker text', () => {
    const numberedContent = `
      1. Onboard in under 60 seconds
      2. AI tailors the experience to each user
      3. Progress and insights compound over time
    `;

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckSlideViewer
          {...defaultProps}
          slideContent={numberedContent}
        />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('1.');
    expect(textNodes).toContain('Onboard in under 60 seconds');
    expect(textNodes).toContain('2.');
    expect(textNodes).toContain('AI tailors the experience to each user');
  });

  it('renders ordinary single paragraph content without artificial bullet dots', () => {
    const paragraphContent = 'Dental clinics lose 20% of revenue to missed recall appointments.';

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckSlideViewer
          {...defaultProps}
          slideContent={paragraphContent}
        />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('Dental clinics lose 20% of revenue to missed recall appointments.');
  });

  it('renders graceful fallback copy when slide content is empty or whitespace', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckSlideViewer
          {...defaultProps}
          slideContent="    "
        />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('No content persisted for this slide. Tap Regenerate to generate complete investor slides.');
  });

  it('safely handles long text, multiline strings, and financial symbols without crashing', () => {
    const longContent = `
      TAM: $4.2B & SAM: $1.1B in annual clinic operations (10× growth with 80% margins!)
      Direct integration with Dentrix, Eaglesoft & Curve Dental EHRs.
      15 pilot clinics in Austin & Dallas with 94% retention rate.
      Zero customer churn observed across beta period.
      Targeting $299/mo subscription with 6-month payback period.
    `;

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckSlideViewer
          {...defaultProps}
          slideContent={longContent}
        />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('$4.2B');
    expect(textNodes).toContain('80% margins');
    expect(textNodes).toContain('Dentrix, Eaglesoft & Curve Dental EHRs');
  });

  it('triggers navigation callbacks when next and prev buttons are pressed', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckSlideViewer
          {...defaultProps}
          onPrevSlide={onPrev}
          onNextSlide={onNext}
        />
      );
    });

    const root = renderer!.root;
    const prevBtn = root.findByProps({ testID: 'pitch-deck-prev-slide-button' });
    const nextBtn = root.findByProps({ testID: 'pitch-deck-next-slide-button' });

    act(() => {
      prevBtn.props.onPress();
    });
    expect(onPrev).toHaveBeenCalledTimes(1);

    act(() => {
      nextBtn.props.onPress();
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  describe('Horizontal Swipe Gestures (Stage 2C.3)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('captures horizontal gestures and rejects vertical gestures or micro-tremors', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<PitchDeckSlideViewer {...defaultProps} />);
      });
      const card = renderer!.root.findByProps({ testID: 'pitch-deck-slide-card' });

      // Valid horizontal swipe -> captures
      const isHorizontal = card.props.onMoveShouldSetResponderCapture(
        { nativeEvent: {} },
        { dx: -100, dy: 10 }
      );
      expect(isHorizontal).toBe(true);

      // Dominant vertical gesture -> rejected (falls through to inner content ScrollView)
      const isVertical = card.props.onMoveShouldSetResponderCapture(
        { nativeEvent: {} },
        { dx: 10, dy: 100 }
      );
      expect(isVertical).toBe(false);

      // Micro-movement within 12px deadzone -> rejected
      const isDeadzone = card.props.onMoveShouldSetResponderCapture(
        { nativeEvent: {} },
        { dx: 8, dy: 2 }
      );
      expect(isDeadzone).toBe(false);
    });

    it('triggers onNextSlide on valid horizontal left swipe', () => {
      const onNext = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PitchDeckSlideViewer {...defaultProps} currentSlideIndex={2} onNextSlide={onNext} />
        );
      });
      const card = renderer!.root.findByProps({ testID: 'pitch-deck-slide-card' });

      act(() => {
        card.props.onResponderGrant({ nativeEvent: {} }, { dx: 0, dy: 0 });
        card.props.onResponderMove({ nativeEvent: {} }, { dx: -150, dy: 5 });
        card.props.onResponderRelease({ nativeEvent: {} }, { dx: -150, dy: 5, vx: -0.6 });
        jest.advanceTimersByTime(200);
      });

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('triggers onPrevSlide on valid horizontal right swipe', () => {
      const onPrev = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PitchDeckSlideViewer {...defaultProps} currentSlideIndex={2} onPrevSlide={onPrev} />
        );
      });
      const card = renderer!.root.findByProps({ testID: 'pitch-deck-slide-card' });

      act(() => {
        card.props.onResponderGrant({ nativeEvent: {} }, { dx: 0, dy: 0 });
        card.props.onResponderMove({ nativeEvent: {} }, { dx: 150, dy: 5 });
        card.props.onResponderRelease({ nativeEvent: {} }, { dx: 150, dy: 5, vx: 0.6 });
        jest.advanceTimersByTime(200);
      });

      expect(onPrev).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onPrevSlide when swiping right on first slide (boundary 0)', () => {
      const onPrev = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PitchDeckSlideViewer {...defaultProps} currentSlideIndex={0} onPrevSlide={onPrev} />
        );
      });
      const card = renderer!.root.findByProps({ testID: 'pitch-deck-slide-card' });

      act(() => {
        card.props.onResponderGrant({ nativeEvent: {} }, { dx: 0, dy: 0 });
        card.props.onResponderMove({ nativeEvent: {} }, { dx: 150, dy: 0 });
        card.props.onResponderRelease({ nativeEvent: {} }, { dx: 150, dy: 0, vx: 0.6 });
      });

      expect(onPrev).not.toHaveBeenCalled();
    });

    it('does not trigger onNextSlide when swiping left on last slide (boundary 9)', () => {
      const onNext = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PitchDeckSlideViewer {...defaultProps} currentSlideIndex={9} onNextSlide={onNext} />
        );
      });
      const card = renderer!.root.findByProps({ testID: 'pitch-deck-slide-card' });

      act(() => {
        card.props.onResponderGrant({ nativeEvent: {} }, { dx: 0, dy: 0 });
        card.props.onResponderMove({ nativeEvent: {} }, { dx: -150, dy: 0 });
        card.props.onResponderRelease({ nativeEvent: {} }, { dx: -150, dy: 0, vx: -0.6 });
      });

      expect(onNext).not.toHaveBeenCalled();
    });

    it('does not trigger navigation on sub-threshold swipe and resets cleanly', () => {
      const onNext = jest.fn();
      const onPrev = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PitchDeckSlideViewer
            {...defaultProps}
            currentSlideIndex={3}
            onNextSlide={onNext}
            onPrevSlide={onPrev}
          />
        );
      });
      const card = renderer!.root.findByProps({ testID: 'pitch-deck-slide-card' });

      act(() => {
        card.props.onResponderGrant({ nativeEvent: {} }, { dx: 0, dy: 0 });
        card.props.onResponderMove({ nativeEvent: {} }, { dx: -25, dy: 0 });
        card.props.onResponderRelease({ nativeEvent: {} }, { dx: -25, dy: 0, vx: -0.1 });
      });

      expect(onNext).not.toHaveBeenCalled();
      expect(onPrev).not.toHaveBeenCalled();
    });

    it('supports adjustable accessibility actions on the presentation card', () => {
      const onNext = jest.fn();
      const onPrev = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PitchDeckSlideViewer
            {...defaultProps}
            currentSlideIndex={4}
            onNextSlide={onNext}
            onPrevSlide={onPrev}
          />
        );
      });
      const card = renderer!.root.findByProps({ testID: 'pitch-deck-slide-card' });

      act(() => {
        card.props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } });
      });
      expect(onNext).toHaveBeenCalledTimes(1);

      act(() => {
        card.props.onAccessibilityAction({ nativeEvent: { actionName: 'decrement' } });
      });
      expect(onPrev).toHaveBeenCalledTimes(1);
    });
  });
});
