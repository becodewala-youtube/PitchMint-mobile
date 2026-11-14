import React from 'react';
import { Modal, Text, View } from 'react-native';
import { Card } from './Card';
import { IconBadge } from './IconBadge';
import { Button } from './Button';
import { colors } from '../theme';
import { styles } from './CreditConfirmationModal.styles';

export interface CreditConfirmationModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Modal title heading */
  title: string;
  /** Modal descriptive explanation */
  description: string;
  /** Cost in credits (defaults to 1) */
  costCredits?: number;
  /** Current credit balance of the user */
  currentCredits: number;
  /** Label for confirm button (defaults to 'Confirm & Deduct 1 Credit' or dynamic if costCredits !== 1) */
  confirmText?: string;
  /** Label for cancel button (defaults to 'Cancel') */
  cancelText?: string;
  /** testID for confirm button */
  confirmTestID?: string;
  /** testID for cancel button */
  cancelTestID?: string;
  /** Loading indicator state for confirm button */
  isLoading?: boolean;
  /** Disabled state for confirm button */
  isConfirmDisabled?: boolean;
  /** Callback fired on confirmation */
  onConfirm: () => void;
  /** Callback fired on cancellation or Android hardware back dismissal */
  onCancel: () => void;
  /** Optional container testID */
  testID?: string;
}

const formatCreditValue = (amount: number): string => {
  return `${amount} ${amount === 1 ? 'Credit' : 'Credits'}`;
};

/**
 * Reusable pre-flight credit confirmation modal.
 * UX safeguard to present operation details, costs, and estimated remaining balance
 * before deducting user credits.
 */
export const CreditConfirmationModal: React.FC<CreditConfirmationModalProps> = ({
  visible,
  title,
  description,
  costCredits = 1,
  currentCredits,
  confirmText,
  cancelText = 'Cancel',
  confirmTestID,
  cancelTestID,
  isLoading = false,
  isConfirmDisabled = false,
  onConfirm,
  onCancel,
  testID,
}) => {
  const safeCurrent =
    typeof currentCredits === 'number' && !isNaN(currentCredits)
      ? Math.max(0, currentCredits)
      : 0;
  const safeCost =
    typeof costCredits === 'number' && !isNaN(costCredits)
      ? Math.max(0, costCredits)
      : 1;
  const remainingCredits = Math.max(0, safeCurrent - safeCost);

  const defaultConfirmText =
    safeCost === 1 ? 'Confirm & Deduct 1 Credit' : `Confirm & Deduct ${safeCost} Credits`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackdrop} testID={testID}>
        <Card style={styles.confirmModalCard}>
          <IconBadge name="sparkles" tone="violet" size={44} />
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalBody}>{description}</Text>

          <View style={styles.modalCreditBox}>
            <View style={styles.modalCreditRow}>
              <Text style={styles.modalCreditLabel}>Cost:</Text>
              <Text style={styles.modalCreditValue}>{formatCreditValue(safeCost)}</Text>
            </View>
            <View style={styles.modalCreditRow}>
              <Text style={styles.modalCreditLabel}>Current Balance:</Text>
              <Text style={styles.modalCreditValue}>{formatCreditValue(safeCurrent)}</Text>
            </View>
            <View style={[styles.modalCreditRow, styles.modalCreditRowLast]}>
              <Text style={styles.modalCreditLabel}>Remaining After:</Text>
              <Text style={[styles.modalCreditValue, { color: colors.tones.emerald.text }]}>
                {formatCreditValue(remainingCredits)}
              </Text>
            </View>
          </View>

          <Button
            testID={confirmTestID}
            title={confirmText || defaultConfirmText}
            variant="primary"
            onPress={onConfirm}
            style={styles.modalConfirmBtn}
            loading={isLoading}
            disabled={isLoading || isConfirmDisabled}
          />
          <Button
            testID={cancelTestID}
            title={cancelText}
            variant="ghost"
            onPress={onCancel}
            style={styles.modalCancelBtn}
            disabled={isLoading}
          />
        </Card>
      </View>
    </Modal>
  );
};
