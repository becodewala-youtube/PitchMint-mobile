import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import { ActivityCard } from '../components/ActivityCard';
import { ActivityHistoryItem } from '../../../services/api/activityApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('ActivityCard Component', () => {
  const baseItem: ActivityHistoryItem = {
    _id: 'act-101',
    userId: 'usr-1',
    serviceType: 'idea_validation',
    title: 'AI Dental Clinic Validation',
    description: 'Score 88/100 across market demand and feasibility',
    creditsUsed: 1,
    relatedIdeaId: 'idea-999',
    createdAt: '2026-11-21T10:00:00Z',
  };

  it('renders interactive card with button semantics when relatedIdeaId is present', () => {
    const onPressIdea = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    act(() => {
      renderer = ReactTestRenderer.create(
        <ActivityCard item={baseItem} onPressIdea={onPressIdea} />
      );
    });

    const root = renderer!.root;
    const pressable = root.findByProps({ testID: 'activity-item-act-101' });
    expect(pressable).toBeDefined();
    expect(pressable.props.accessibilityRole).toBe('button');
    expect(pressable.props.accessibilityLabel).toContain('AI Dental Clinic Validation');

    act(() => {
      pressable.props.onPress();
    });

    expect(onPressIdea).toHaveBeenCalledTimes(1);
    expect(onPressIdea).toHaveBeenCalledWith('idea-999');
  });

  it('renders static non-interactive card when relatedIdeaId is null or empty', () => {
    const onPressIdea = jest.fn();
    const itemWithoutIdea: ActivityHistoryItem = {
      ...baseItem,
      relatedIdeaId: null,
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ActivityCard item={itemWithoutIdea} onPressIdea={onPressIdea} />
      );
    });

    const root = renderer!.root;
    const buttonNodes = root.findAllByProps({ accessibilityRole: 'button' });
    expect(buttonNodes).toHaveLength(0);
    expect(onPressIdea).not.toHaveBeenCalled();
  });

  it('renders whitespace-only relatedIdeaId as non-interactive', () => {
    const onPressIdea = jest.fn();
    const itemWhitespace: ActivityHistoryItem = {
      ...baseItem,
      relatedIdeaId: '   ',
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ActivityCard item={itemWhitespace} onPressIdea={onPressIdea} />
      );
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ accessibilityRole: 'button' })).toHaveLength(0);
  });

  it('renders credit deduction pill when creditsUsed > 0', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<ActivityCard item={baseItem} />);
    });

    const root = renderer!.root;
    const texts = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity);

    expect(texts).toContain('-1 credit');
  });

  it('omits credit pill when creditsUsed is 0', () => {
    const freeItem: ActivityHistoryItem = {
      ...baseItem,
      creditsUsed: 0,
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<ActivityCard item={freeItem} />);
    });

    const root = renderer!.root;
    const texts = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity);

    expect(texts.some((t) => typeof t === 'string' && t.includes('credit'))).toBe(false);
  });
});
