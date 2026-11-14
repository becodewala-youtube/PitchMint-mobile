import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Modal, Text, ActivityIndicator } from 'react-native';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('DeleteConfirmationModal Component', () => {
  const defaultProps = {
    visible: true,
    ideaTitle: 'AI Pitch Deck Generator',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    confirmTestID: 'test-delete-confirm',
    cancelTestID: 'test-delete-cancel',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, description, and idea title preview correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<DeleteConfirmationModal {...defaultProps} />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('Delete Saved Idea?');
    expect(textNodes).toContain('permanently delete this startup idea');
    expect(textNodes).toContain('AI Pitch Deck Generator');
    expect(textNodes).toContain('This action cannot be undone');
  });

  it('honors visible=false on Modal', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<DeleteConfirmationModal {...defaultProps} visible={false} />);
    });

    const root = renderer!.root;
    const modal = root.findByType(Modal);
    expect(modal.props.visible).toBe(false);
  });

  it('invokes onConfirm when confirm button is pressed', async () => {
    const onConfirmMock = jest.fn().mockResolvedValue(undefined);
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <DeleteConfirmationModal {...defaultProps} onConfirm={onConfirmMock} />
      );
    });

    const root = renderer!.root;
    const confirmButton = root.findByProps({ testID: 'test-delete-confirm' });

    await act(async () => {
      confirmButton.props.onPress();
    });

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('protects against duplicate taps when already tapped', async () => {
    let resolveConfirm: () => void;
    const confirmPromise = new Promise<void>((resolve) => {
      resolveConfirm = resolve;
    });
    const onConfirmMock = jest.fn().mockImplementation(() => confirmPromise);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <DeleteConfirmationModal {...defaultProps} onConfirm={onConfirmMock} />
      );
    });

    const root = renderer!.root;
    const confirmButton = root.findByProps({ testID: 'test-delete-confirm' });

    act(() => {
      confirmButton.props.onPress();
      // Second tap while first is pending
      confirmButton.props.onPress();
    });

    expect(onConfirmMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveConfirm!();
      await confirmPromise;
    });
  });

  it('shows ActivityIndicator and disables button when isLoading is true', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <DeleteConfirmationModal {...defaultProps} isLoading={true} />
      );
    });

    const root = renderer!.root;
    const indicators = root.findAllByType(ActivityIndicator);
    expect(indicators.length).toBeGreaterThan(0);

    const confirmButton = root.findByProps({ testID: 'test-delete-confirm' });
    expect(confirmButton.props.disabled).toBe(true);
  });

  it('invokes onCancel when cancel button is pressed and not loading', () => {
    const onCancelMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <DeleteConfirmationModal {...defaultProps} onCancel={onCancelMock} />
      );
    });

    const root = renderer!.root;
    const cancelButton = root.findByProps({ testID: 'test-delete-cancel' });

    act(() => {
      cancelButton.props.onPress();
    });

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onCancel when isLoading is true', () => {
    const onCancelMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <DeleteConfirmationModal {...defaultProps} isLoading={true} onCancel={onCancelMock} />
      );
    });

    const root = renderer!.root;
    const cancelButton = root.findByProps({ testID: 'test-delete-cancel' });

    act(() => {
      cancelButton.props.onPress();
    });

    expect(onCancelMock).not.toHaveBeenCalled();
  });
});
