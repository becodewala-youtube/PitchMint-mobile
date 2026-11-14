import React from 'react';
import { View, Text, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { ScreenContainer, Card, Badge, Button, Icon, IconBadge, CreditConfirmationModal } from '../../../components';
import { colors } from '../../../theme';
import { styles } from '../screens/CanvasScreen.styles';

export interface CanvasEmptyStateProps {
  displayTitle: string;
  isRefreshing: boolean;
  isSubmitting: boolean;
  currentCredits: number;
  showConfirmModal: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onOpenConfirmModal: () => void;
  onConfirmAction: () => void;
  onCloseConfirmModal: () => void;
}

export const CanvasEmptyState: React.FC<CanvasEmptyStateProps> = ({
  displayTitle,
  isRefreshing,
  isSubmitting,
  currentCredits,
  showConfirmModal,
  onRefresh,
  onBack,
  onOpenConfirmModal,
  onConfirmAction,
  onCloseConfirmModal,
}) => {
  return (
    <ScreenContainer
      withHeaderOffset={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
    >
      <View style={styles.topBar}>
        <Pressable
          testID="canvas-back-button"
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="chevronLeft" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {displayTitle}
          </Text>
          <Text style={styles.topBarSubtitle}>
            Business Model Canvas — Lean Startup Methodology
          </Text>
        </View>
        <Badge label="NOT GENERATED" variant="gray" />
      </View>

      <Card style={styles.emptyCard}>
        <IconBadge name="panelsTopLeft" tone="emerald" size={54} />
        <Text style={styles.emptyTitle}>No Business Model Canvas Generated</Text>
        <Text style={styles.emptyBody}>
          PitchMint AI uses lean startup methodology to produce a comprehensive 9-block business model canvas covering problem, solution, unique value proposition, metrics, and revenue streams.
        </Text>

        <View style={styles.costBox}>
          <Text style={styles.costLabel}>Generation Cost:</Text>
          <Text style={styles.costValue}>1 Credit</Text>
        </View>
        <Text style={styles.balanceText}>
          {`Your Available Balance: ${currentCredits} ${currentCredits === 1 ? 'Credit' : 'Credits'}`}
        </Text>

        <Button
          testID="canvas-empty-generate-button"
          title={isSubmitting ? 'Generating Canvas…' : 'Generate Canvas (1 Credit)'}
          variant="primary"
          onPress={onOpenConfirmModal}
          disabled={isSubmitting}
          leftIcon={
            isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="sparkles" size={16} color="#FFFFFF" />
            )
          }
          style={styles.emptyGenerateBtn}
        />

        <Button
          testID="canvas-empty-back-button"
          title="Back to Idea Details"
          variant="ghost"
          onPress={onBack}
          style={styles.emptyBackBtn}
        />
      </Card>

      {/* 1-Credit Pre-Flight Confirmation Modal */}
      <CreditConfirmationModal
        visible={showConfirmModal}
        title="Generate Business Model Canvas?"
        description="PitchMint AI will analyze this startup idea using lean startup principles to create a comprehensive 9-block model."
        costCredits={1}
        currentCredits={currentCredits}
        confirmTestID="canvas-confirm-generate-button"
        cancelTestID="canvas-cancel-generate-button"
        onConfirm={onConfirmAction}
        onCancel={onCloseConfirmModal}
      />
    </ScreenContainer>
  );
};
