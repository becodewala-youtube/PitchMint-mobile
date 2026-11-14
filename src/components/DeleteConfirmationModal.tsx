import React, { useState, useRef } from 'react';
import { Modal, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { Card } from './Card';
import { IconBadge } from './IconBadge';
import { styles } from './DeleteConfirmationModal.styles';

export interface DeleteConfirmationModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Idea title to show in confirmation prompt */
  ideaTitle?: string;
  /** Custom title heading (defaults to 'Delete Saved Idea?') */
  title?: string;
  /** Custom description (defaults to permanent deletion message) */
  description?: string;
  /** Label for confirm delete button */
  confirmText?: string;
  /** Label for cancel button */
  cancelText?: string;
  /** Loading state for delete operation */
  isLoading?: boolean;
  /** Callback fired when deletion is confirmed */
  onConfirm: () => void | Promise<void>;
  /** Callback fired on cancellation */
  onCancel: () => void;
  /** Optional container testID */
  testID?: string;
  /** Confirm button testID */
  confirmTestID?: string;
  /** Cancel button testID */
  cancelTestID?: string;
}

/**
 * DeleteConfirmationModal adhering to Arena dark tokens:
 * - Surface: #0A0A0A card background
 * - Danger accent: #EF4444
 * - 48dp minimum touch targets
 * - Duplicate-tap protection to prevent multiple simultaneous deletions
 */
export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  ideaTitle,
  title = 'Delete Saved Idea?',
  description = 'Are you sure you want to permanently delete this startup idea? All generated pitch decks, business model canvases, competitor analyses, and pitch simulations will be permanently removed.',
  confirmText = 'Delete Idea',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
  testID = 'delete-confirmation-modal',
  confirmTestID = 'delete-confirm-button',
  cancelTestID = 'delete-cancel-button',
}) => {
  const [hasTapped, setHasTapped] = useState<boolean>(false);
  const isTappingRef = useRef<boolean>(false);

  // Reset duplicate-tap guard when modal becomes visible or finishes loading
  React.useEffect(() => {
    if (visible && !isLoading) {
      isTappingRef.current = false;
      setHasTapped(false);
    }
  }, [visible, isLoading]);

  const handleConfirmPress = async () => {
    if (isTappingRef.current || hasTapped || isLoading) return;
    isTappingRef.current = true;
    setHasTapped(true);
    try {
      await onConfirm();
    } catch {
      // Re-enable if parent handler threw without updating isLoading
      isTappingRef.current = false;
      setHasTapped(false);
    }
  };

  const handleCancelPress = () => {
    if (isLoading) return;
    onCancel();
  };

  const isActionDisabled = isLoading || hasTapped;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancelPress}
    >
      <View style={styles.modalBackdrop} testID={testID}>
        <Card style={styles.modalCard}>
          <View style={styles.iconWrapper}>
            <IconBadge name="trash" tone="red" size={48} />
          </View>

          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description}</Text>

          {ideaTitle ? (
            <View style={styles.ideaPreviewBox}>
              <Text style={styles.ideaPreviewTitle} numberOfLines={2}>
                "{ideaTitle}"
              </Text>
              <Text style={styles.ideaPreviewWarning}>⚠️ This action cannot be undone.</Text>
            </View>
          ) : null}

          <View style={styles.buttonColumn}>
            <Pressable
              testID={confirmTestID}
              onPress={handleConfirmPress}
              disabled={isActionDisabled}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && !isActionDisabled && styles.deleteButtonPressed,
                isActionDisabled && styles.deleteButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
              accessibilityState={{ disabled: isActionDisabled }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>{confirmText}</Text>
              )}
            </Pressable>

            <Pressable
              testID={cancelTestID}
              onPress={handleCancelPress}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && !isLoading && styles.cancelButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
              accessibilityState={{ disabled: isLoading }}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </Modal>
  );
};
