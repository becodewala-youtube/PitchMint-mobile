import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Modal, Text } from 'react-native';
import { CreditConfirmationModal } from '../CreditConfirmationModal';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('CreditConfirmationModal Component', () => {
  const defaultProps = {
    visible: true,
    title: 'Validate Startup Idea?',
    description: 'PitchMint AI will analyze your startup idea.',
    currentCredits: 5,
    costCredits: 1,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    confirmTestID: 'test-confirm-button',
    cancelTestID: 'test-cancel-button',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, description, and credit calculations correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<CreditConfirmationModal {...defaultProps} />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('Validate Startup Idea?');
    expect(textNodes).toContain('PitchMint AI will analyze your startup idea.');
    expect(textNodes).toContain('1 Credit');   // Cost
    expect(textNodes).toContain('5 Credits');  // Current
    expect(textNodes).toContain('4 Credits');  // Remaining
  });

  it('supports modal visibility flag', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal {...defaultProps} visible={false} />
      );
    });

    const root = renderer!.root;
    const modal = root.findByType(Modal);
    expect(modal.props.visible).toBe(false);
  });

  it('invokes onConfirm when confirm button is pressed', async () => {
    const onConfirmMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal {...defaultProps} onConfirm={onConfirmMock} />
      );
    });

    const root = renderer!.root;
    const confirmBtn = root.findByProps({ testID: 'test-confirm-button' });

    await act(async () => {
      confirmBtn.props.onPress();
    });

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('invokes onCancel when cancel button is pressed', async () => {
    const onCancelMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal {...defaultProps} onCancel={onCancelMock} />
      );
    });

    const root = renderer!.root;
    const cancelBtn = root.findByProps({ testID: 'test-cancel-button' });

    await act(async () => {
      cancelBtn.props.onPress();
    });

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('invokes onCancel when modal triggers onRequestClose (Android back button)', async () => {
    const onCancelMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal {...defaultProps} onCancel={onCancelMock} />
      );
    });

    const root = renderer!.root;
    const modal = root.findByType(Modal);

    await act(async () => {
      modal.props.onRequestClose();
    });

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('handles zero and insufficient balance without showing negative remaining credits', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal
          {...defaultProps}
          currentCredits={0}
          costCredits={1}
        />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('1 Credit');   // Cost
    expect(textNodes).toContain('0 Credits');  // Current
    // Remaining should be clamped to 0 Credits, never -1 Credits
    expect(textNodes).not.toContain('-1');
  });

  it('safely handles negative or invalid currentCredits input', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal
          {...defaultProps}
          currentCredits={-5}
          costCredits={1}
        />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('0 Credits');
    expect(textNodes).not.toContain('-5');
    expect(textNodes).not.toContain('-6');
  });

  it('correctly reflects loading and disabled state on confirm and cancel buttons', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal
          {...defaultProps}
          isLoading={true}
        />
      );
    });

    const root = renderer!.root;
    const confirmBtn = root.findByProps({ testID: 'test-confirm-button' });
    const cancelBtn = root.findByProps({ testID: 'test-cancel-button' });

    expect(confirmBtn.props.loading).toBe(true);
    expect(confirmBtn.props.disabled).toBe(true);
    expect(cancelBtn.props.disabled).toBe(true);
  });

  it('supports isConfirmDisabled independently from isLoading', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal
          {...defaultProps}
          isLoading={false}
          isConfirmDisabled={true}
        />
      );
    });

    const root = renderer!.root;
    const confirmBtn = root.findByProps({ testID: 'test-confirm-button' });
    const cancelBtn = root.findByProps({ testID: 'test-cancel-button' });

    expect(confirmBtn.props.disabled).toBe(true);
    expect(confirmBtn.props.loading).toBe(false);
    expect(cancelBtn.props.disabled).toBe(false);
  });

  it('supports custom confirm and cancel button text', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal
          {...defaultProps}
          confirmText="Deduct & Generate Deck"
          cancelText="Dismiss Dialog"
        />
      );
    });

    const root = renderer!.root;
    const confirmBtn = root.findByProps({ testID: 'test-confirm-button' });
    const cancelBtn = root.findByProps({ testID: 'test-cancel-button' });

    expect(confirmBtn.props.title).toBe('Deduct & Generate Deck');
    expect(cancelBtn.props.title).toBe('Dismiss Dialog');
  });

  it('supports costCredits greater than 1 with pluralization', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CreditConfirmationModal
          {...defaultProps}
          costCredits={3}
          currentCredits={10}
        />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('3 Credits');   // Cost
    expect(textNodes).toContain('10 Credits');  // Current
    expect(textNodes).toContain('7 Credits');   // Remaining
  });
});
