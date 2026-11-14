import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { IdeaCard } from '../IdeaCard';
import { ParsedIdeaCard } from '../../utils/ideaParser';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('IdeaCard Component', () => {
  const mockIdea: ParsedIdeaCard = {
    id: 'test-idea-123',
    title: 'AI Coffee Roaster',
    description: 'Precision artisan roasting driven by real-time acoustic emission sensors.',
    category: 'Hardware',
    overallScore: 88,
    marketDemandScore: 90,
    competitionScore: 78,
    monetizationScore: 92,
    createdAt: '2026-03-01T12:00:00.000Z',
    hasPitchDeck: true,
    hasCanvas: true,
    hasCompetitors: false,
    hasSimulation: false,
  };

  it('renders title, description, category, score, and default testID', () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <IdeaCard idea={mockIdea} onPress={jest.fn()} />
      );
    });

    const root = renderer.root;
    const card = root.findByProps({ testID: 'idea-card-test-idea-123' });
    expect(card).toBeTruthy();

    const texts = root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('AI Coffee Roaster');
    expect(texts).toContain('Precision artisan roasting driven by real-time acoustic emission sensors.');
    expect(texts).toContain('Hardware');
    expect(texts).toContain(88);
  });

  it('triggers onPress callback when tapped', () => {
    const onPress = jest.fn();
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <IdeaCard idea={mockIdea} onPress={onPress} />
      );
    });

    const card = renderer.root.findByProps({ testID: 'idea-card-test-idea-123' });
    act(() => {
      card.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders custom testID and formatted date text when provided', () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <IdeaCard
          idea={mockIdea}
          onPress={jest.fn()}
          testID="custom-card-id"
          dateText="2 hours ago"
        />
      );
    });

    const card = renderer.root.findByProps({ testID: 'custom-card-id' });
    expect(card).toBeTruthy();

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('2 hours ago');
  });
});
