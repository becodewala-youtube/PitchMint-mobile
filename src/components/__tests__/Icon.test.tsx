import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Icon } from '../Icon';
import { IconName } from '../icons/types';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Icon Component', () => {
  const sampleIcons: IconName[] = [
    'home',
    'ideas',
    'plus',
    'activity',
    'profile',
    'wallet',
    'lightbulb',
    'fileText',
    'sparkles',
    'zap',
    'chevronRight',
    'award',
    'crown',
  ];

  sampleIcons.forEach((iconName) => {
    it(`renders ${iconName} icon cleanly with custom size and color`, () => {
      let renderer!: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <Icon name={iconName} size={28} color="#7C3AED" />
        );
      });

      const root = renderer.root;
      const iconNode = root.findByProps({ testID: `icon-${iconName}` });
      expect(iconNode).toBeTruthy();
      expect(iconNode.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: 28,
            height: 28,
          }),
        ])
      );
    });
  });

  it('applies accessibility hidden attributes to prevent screen reader noise from decorative icons', () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<Icon name="wallet" size={20} />);
    });

    const root = renderer.root;
    const iconNode = root.findByProps({ testID: 'icon-wallet' });
    expect(iconNode.props.accessibilityElementsHidden).toBe(true);
    expect(iconNode.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
