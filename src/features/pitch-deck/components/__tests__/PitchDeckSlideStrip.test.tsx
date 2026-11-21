import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, ScrollView } from 'react-native';
import { PitchDeckSlideStrip } from '../PitchDeckSlideStrip';
import { SLIDE_DEFINITIONS } from '../../constants/slideDefinitions';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('PitchDeckSlideStrip (Stage 2C.4)', () => {
  const defaultProps = {
    slides: SLIDE_DEFINITIONS,
    currentSlideIndex: 0,
    onSelectSlide: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all 10 authoritative slide thumbnail cards in a horizontal ScrollView', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckSlideStrip {...defaultProps} />);
    });

    const root = renderer!.root;
    const scrollView = root.findByType(ScrollView);
    expect(scrollView.props.horizontal).toBe(true);
    expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false);

    for (let i = 0; i < 10; i++) {
      const chip = root.findByProps({ testID: `pitch-deck-slide-chip-${i}` });
      expect(chip).toBeDefined();
    }
  });

  it('displays two-digit numbers, titles, and categories on thumbnails', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckSlideStrip {...defaultProps} />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    // Check first slide
    expect(textNodes).toContain('01');
    expect(textNodes).toContain('Problem');
    expect(textNodes).toContain('Market Pain Point');

    // Check tenth slide
    expect(textNodes).toContain('10');
    expect(textNodes).toContain('Ask & Use of Funds');
    expect(textNodes).toContain('Capitalization');
  });

  it('applies active styling and selected accessibility state to the active thumbnail', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckSlideStrip {...defaultProps} currentSlideIndex={3} />);
    });

    const root = renderer!.root;
    const activeChip = root.findByProps({ testID: 'pitch-deck-slide-chip-3' });
    const inactiveChip = root.findByProps({ testID: 'pitch-deck-slide-chip-0' });

    expect(activeChip.props.accessibilityState).toEqual({ selected: true });
    expect(inactiveChip.props.accessibilityState).toEqual({ selected: false });
  });

  it('calls onSelectSlide with correct index when a thumbnail is pressed', () => {
    const onSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <PitchDeckSlideStrip {...defaultProps} onSelectSlide={onSelect} />
      );
    });

    const root = renderer!.root;
    const chip7 = root.findByProps({ testID: 'pitch-deck-slide-chip-7' });

    act(() => {
      chip7.props.onPress();
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(7);
  });

  it('scrolls the horizontal ScrollView when active slide index updates', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<PitchDeckSlideStrip {...defaultProps} currentSlideIndex={0} />);
    });

    const root = renderer!.root;
    const scrollView = root.findByType(ScrollView);
    const mockScrollTo = jest.fn();
    scrollView.instance.scrollTo = mockScrollTo;

    // Simulate container layout
    act(() => {
      scrollView.props.onLayout({ nativeEvent: { layout: { width: 360 } } });
    });

    // Update to slide index 5
    act(() => {
      renderer.update(<PitchDeckSlideStrip {...defaultProps} currentSlideIndex={5} />);
    });

    expect(mockScrollTo).toHaveBeenCalled();
  });
});
