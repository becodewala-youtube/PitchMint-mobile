import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { CanvasGridOverview } from '../CanvasGridOverview';
import { CANVAS_BLOCK_DEFINITIONS } from '../../constants/blockDefinitions';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('CanvasGridOverview Component', () => {
  const mockOnSelectBlock = jest.fn();

  const mockContent = {
    problem: 'Dental charting takes too long.\nPatients wait extended periods.',
    solution: 'Voice-to-chart AI automation.\nReal-time dental notes.',
    uniqueValueProposition: 'The fastest hands-free dental assistant for clinical teams.',
    unfairAdvantage: 'Proprietary clinical voice model tuned on 50k patient interactions.',
    customerSegments: 'Private dental practices, orthodontists, dental DSOs.',
    keyMetrics: 'Daily active clinicians, charts generated per day, 90-day retention.',
    channels: 'Dental conferences, direct outbound, DSO partnerships.',
    costStructure: 'Inference GPUs, HIPAA-compliant cloud storage, clinical sales reps.',
    revenueStreams: '$299/mo per chair SaaS, enterprise volume pricing.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all nine blocks in the grid overview', () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CanvasGridOverview
          canvasContent={mockContent}
          onSelectBlock={mockOnSelectBlock}
        />
      );
    });

    const root = renderer.root;
    CANVAS_BLOCK_DEFINITIONS.forEach((def) => {
      const card = root.findByProps({ testID: `canvas-grid-card-${def.key}` });
      expect(card).toBeTruthy();
    });
  });

  it('invokes onSelectBlock with block index when a card is tapped', () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CanvasGridOverview
          canvasContent={mockContent}
          onSelectBlock={mockOnSelectBlock}
        />
      );
    });

    const root = renderer.root;
    // Tap block #3 (UVP, index 2)
    const uvpCard = root.findByProps({
      testID: 'canvas-grid-card-uniqueValueProposition',
    });
    act(() => {
      uvpCard.props.onPress();
    });

    expect(mockOnSelectBlock).toHaveBeenCalledWith(2);
  });

  it('displays empty state text when block content is undefined or empty', () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CanvasGridOverview
          canvasContent={{}}
          onSelectBlock={mockOnSelectBlock}
        />
      );
    });

    const root = renderer.root;
    CANVAS_BLOCK_DEFINITIONS.forEach((def) => {
      const card = root.findByProps({ testID: `canvas-grid-card-${def.key}` });
      const emptyText = card.findAll(
        (node) => node.props.children === 'No content recorded for this section.'
      );
      expect(emptyText.length).toBeGreaterThan(0);
    });
  });
});
