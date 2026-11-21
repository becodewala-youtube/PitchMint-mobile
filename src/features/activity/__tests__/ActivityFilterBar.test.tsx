import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import { ActivityFilterBar } from '../components/ActivityFilterBar';
import { ACTIVITY_FILTERS } from '../constants/activityConstants';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('ActivityFilterBar Component', () => {
  it('renders all 8 supported service filter chips in the tablist', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ActivityFilterBar
          activeFilter="all"
          totalCount={42}
          onSelectFilter={jest.fn()}
        />
      );
    });

    const root = renderer!.root;
    const renderedChips = ACTIVITY_FILTERS.map((f) =>
      root.findByProps({ testID: `activity-filter-${f.key}` })
    );
    expect(renderedChips).toHaveLength(8);

    const labels = renderedChips.map((c) => c.props.accessibilityLabel);
    expect(labels).toEqual([
      'All',
      'Validations',
      'Pitch Decks',
      'Competitors',
      'Canvas',
      'Pitch Simulator',
      'Market Research',
      'Investor Matching',
    ]);
  });

  it('displays count badge for All when totalCount > 0', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ActivityFilterBar
          activeFilter="all"
          totalCount={15}
          onSelectFilter={jest.fn()}
        />
      );
    });

    const root = renderer!.root;
    const texts = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity);

    expect(texts).toContain('All (15)');
  });

  it('displays bare "All" when totalCount is 0', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ActivityFilterBar
          activeFilter="all"
          totalCount={0}
          onSelectFilter={jest.fn()}
        />
      );
    });

    const root = renderer!.root;
    const texts = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity);

    expect(texts).toContain('All');
  });

  it('fires onSelectFilter with the appropriate serviceType key on press', () => {
    const onSelectFilter = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ActivityFilterBar
          activeFilter="all"
          totalCount={10}
          onSelectFilter={onSelectFilter}
        />
      );
    });

    const root = renderer!.root;

    // Tap 'Pitch Decks' chip
    const pitchDeckChip = root.findByProps({ testID: 'activity-filter-pitch_deck' });
    act(() => {
      pitchDeckChip.props.onPress();
    });
    expect(onSelectFilter).toHaveBeenCalledWith('pitch_deck');

    // Tap 'Competitors' chip
    const competitorChip = root.findByProps({ testID: 'activity-filter-competitor_analysis' });
    act(() => {
      competitorChip.props.onPress();
    });
    expect(onSelectFilter).toHaveBeenCalledWith('competitor_analysis');

    // Tap 'Canvas' chip
    const canvasChip = root.findByProps({ testID: 'activity-filter-canvas' });
    act(() => {
      canvasChip.props.onPress();
    });
    expect(onSelectFilter).toHaveBeenCalledWith('canvas');

    // Tap 'All' chip
    const allChip = root.findByProps({ testID: 'activity-filter-all' });
    act(() => {
      allChip.props.onPress();
    });
    expect(onSelectFilter).toHaveBeenCalledWith('all');
  });

  it('marks active filter chip with selected accessibility state', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ActivityFilterBar
          activeFilter="canvas"
          totalCount={5}
          onSelectFilter={jest.fn()}
        />
      );
    });

    const root = renderer!.root;
    const canvasChip = root.findByProps({ testID: 'activity-filter-canvas' });
    const allChip = root.findByProps({ testID: 'activity-filter-all' });

    expect(canvasChip.props.accessibilityState).toEqual({ selected: true });
    expect(allChip.props.accessibilityState).toEqual({ selected: false });
  });
});
