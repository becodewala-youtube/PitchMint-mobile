import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PitchDeckControls } from '../PitchDeckControls';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('PitchDeckControls (Stage 2C.2)', () => {
  const defaultProps = {
    currentSlideIndex: 0,
    totalSlides: 10,
    onPrevSlide: jest.fn(),
    onNextSlide: jest.fn(),
    onSelectSlide: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Previous and Next buttons with 10 pagination dots', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckControls {...defaultProps} />);
    });

    const root = renderer!.root;
    const prevBtn = root.findByProps({ testID: 'pitch-deck-prev-slide-button' });
    const nextBtn = root.findByProps({ testID: 'pitch-deck-next-slide-button' });
    const pagination = root.findByProps({ testID: 'pitch-deck-pagination' });

    expect(prevBtn).toBeDefined();
    expect(nextBtn).toBeDefined();
    expect(pagination).toBeDefined();

    // Verify all 10 dots render
    for (let i = 0; i < 10; i++) {
      const dot = root.findByProps({ testID: `pitch-deck-dot-${i}` });
      expect(dot).toBeDefined();
    }
  });

  it('disables Previous button on first slide (boundary 0) and enables Next button', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckControls {...defaultProps} currentSlideIndex={0} />);
    });

    const root = renderer!.root;
    const prevBtn = root.findByProps({ testID: 'pitch-deck-prev-slide-button' });
    const nextBtn = root.findByProps({ testID: 'pitch-deck-next-slide-button' });

    expect(prevBtn.props.disabled).toBe(true);
    expect(prevBtn.props.accessibilityState).toEqual({ disabled: true });
    expect(nextBtn.props.disabled).toBe(false);
    expect(nextBtn.props.accessibilityState).toEqual({ disabled: false });
  });

  it('disables Next button on last slide (boundary 9) and enables Previous button', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckControls {...defaultProps} currentSlideIndex={9} />);
    });

    const root = renderer!.root;
    const prevBtn = root.findByProps({ testID: 'pitch-deck-prev-slide-button' });
    const nextBtn = root.findByProps({ testID: 'pitch-deck-next-slide-button' });

    expect(prevBtn.props.disabled).toBe(false);
    expect(prevBtn.props.accessibilityState).toEqual({ disabled: false });
    expect(nextBtn.props.disabled).toBe(true);
    expect(nextBtn.props.accessibilityState).toEqual({ disabled: true });
  });

  it('enables both Previous and Next buttons on intermediate slides', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckControls {...defaultProps} currentSlideIndex={4} />);
    });

    const root = renderer!.root;
    const prevBtn = root.findByProps({ testID: 'pitch-deck-prev-slide-button' });
    const nextBtn = root.findByProps({ testID: 'pitch-deck-next-slide-button' });

    expect(prevBtn.props.disabled).toBe(false);
    expect(nextBtn.props.disabled).toBe(false);
  });

  it('triggers onPrevSlide and onNextSlide callbacks on button presses when enabled', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckControls
          {...defaultProps}
          currentSlideIndex={3}
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

  it('calls onSelectSlide when an inactive dot is tapped', () => {
    const onSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckControls
          {...defaultProps}
          currentSlideIndex={0}
          onSelectSlide={onSelect}
        />
      );
    });

    const root = renderer!.root;
    const dot4 = root.findByProps({ testID: 'pitch-deck-dot-4' });

    act(() => {
      dot4.props.onPress();
    });
    expect(onSelect).toHaveBeenCalledWith(4);
  });

  it('supports TalkBack / VoiceOver adjustable increment and decrement accessibility actions', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckControls
          {...defaultProps}
          currentSlideIndex={3}
          onPrevSlide={onPrev}
          onNextSlide={onNext}
        />
      );
    });

    const root = renderer!.root;
    const pagination = root.findByProps({ testID: 'pitch-deck-pagination' });

    // Increment -> onNextSlide
    act(() => {
      pagination.props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } });
    });
    expect(onNext).toHaveBeenCalledTimes(1);

    // Decrement -> onPrevSlide
    act(() => {
      pagination.props.onAccessibilityAction({ nativeEvent: { actionName: 'decrement' } });
    });
    expect(onPrev).toHaveBeenCalledTimes(1);
  });
});
