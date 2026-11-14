import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Card, IconBadge, Pill, Button, Icon } from '../../../components';
import { colors } from '../../../theme';
import { config } from '../../../config/env';
import { TIPS, MAX_IDEA_LENGTH } from '../constants/validateConstants';
import { styles } from '../screens/ValidateModalScreen.styles';

export interface ValidateFormStageProps {
  ideaText: string;
  creditBalance: number;
  submitError: string | null;
  isAmbiguousError: boolean;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onTextChange: (text: string) => void;
  onUseExample: () => void;
  onInitiateValidation: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSavedIdeas: () => void;
  onCreditInfo: () => void;
  onClose: () => void;
}

export const ValidateFormStage: React.FC<ValidateFormStageProps> = ({
  ideaText,
  creditBalance,
  submitError,
  isAmbiguousError,
  isSubmitting,
  isSubmitDisabled,
  onTextChange,
  onUseExample,
  onInitiateValidation,
  onNavigateToProfile,
  onNavigateToSavedIdeas,
  onCreditInfo,
  onClose,
}) => {
  return (
    <>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenHeaderTitle}>Submit Idea</Text>
          <Text style={styles.screenHeaderSubtitle}>AI Idea Assessment Engine</Text>
        </View>
        <View style={styles.topBarRight}>
          <Pressable onPress={onCreditInfo}>
            <Pill
              label={`${creditBalance} credits`}
              tone={creditBalance > 0 ? 'gray' : 'red'}
            />
          </Pressable>
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityLabel="Close validation"
          >
            <Icon name="close" size={18} color={colors.text.secondary} />
          </Pressable>
        </View>
      </View>

      {/* PageTitle Header */}
      <View style={styles.pageTitleRow}>
        <IconBadge name="lightbulb" tone="violet" size={48} />
        <View style={styles.pageTitleCol}>
          <Text style={styles.pageTitleText}>Submit Your Startup Idea</Text>
          <Text style={styles.pageSubtitleText}>
            Instant AI validation, competitive analysis and a strategic roadmap
          </Text>
        </View>
      </View>

      {/* Low credit banner if 0 credits */}
      {creditBalance < 1 && (
        <Card style={styles.creditWarningCard}>
          <View style={styles.creditWarningHeader}>
            <Icon name="alertCircle" size={16} color={colors.tones.amber.text} />
            <Text style={styles.creditWarningTitle}>Zero Credits Remaining</Text>
          </View>
          <Text style={styles.creditWarningBody}>
            Validating a startup idea requires 1 credit.{' '}
            {config.features.enableDemoTopUp
              ? 'You can add demo credits in Settings for testing.'
              : 'In-app credit top-ups will be available in the upcoming native app store release.'}
          </Text>
          {config.features.enableDemoTopUp && (
            <Pressable
              testID="demo-topup-navigate-button"
              onPress={onNavigateToProfile}
              style={styles.demoTopUpShortcutBtn}
              accessibilityRole="button"
              accessibilityLabel="Top up demo credits in Settings"
            >
              <Text style={styles.demoTopUpShortcutText}>
                Top Up Demo Credits in Settings →
              </Text>
            </Pressable>
          )}
        </Card>
      )}

      {/* Error message banner */}
      {submitError && (
        <Card
          style={[
            styles.errorCard,
            isAmbiguousError && styles.ambiguousErrorCard,
          ]}
        >
          <View style={styles.errorHeader}>
            <Icon
              name="alertCircle"
              size={18}
              color={
                isAmbiguousError ? colors.tones.amber.text : colors.tones.red.text
              }
            />
            <Text
              style={[
                styles.errorTitle,
                isAmbiguousError && styles.ambiguousErrorTitle,
              ]}
            >
              {isAmbiguousError ? 'Connection Issue' : 'Validation Error'}
            </Text>
          </View>
          <Text style={styles.errorBody}>{submitError}</Text>
          {isAmbiguousError && (
            <Pressable
              testID="check-saved-ideas-button"
              onPress={onNavigateToSavedIdeas}
              style={styles.checkSavedIdeasBtn}
            >
              <Text style={styles.checkSavedIdeasText}>Check Saved Ideas →</Text>
            </Pressable>
          )}
        </Card>
      )}

      {/* Input Card */}
      <Card style={styles.inputCard}>
        <View style={styles.inputHeaderRow}>
          <Text style={styles.inputLabel}>Describe your startup idea</Text>
          <Text
            style={[
              styles.charCounter,
              ideaText.length > MAX_IDEA_LENGTH && styles.charCounterError,
            ]}
          >
            {ideaText.length} / {MAX_IDEA_LENGTH}
          </Text>
        </View>

        <TextInput
          style={[
            styles.textArea,
            ideaText.length > MAX_IDEA_LENGTH && styles.textAreaError,
          ]}
          placeholder="Example: A marketplace that connects freelance designers with early-stage startups for fixed-price, 7-day design sprints..."
          placeholderTextColor={colors.text.muted}
          multiline
          numberOfLines={6}
          value={ideaText}
          onChangeText={onTextChange}
          editable={!isSubmitting}
        />

        <View style={styles.hintRow}>
          <Icon name="sparkles" size={14} color={colors.brand.primary} />
          <Text style={styles.hintText}>
            Be specific about your value proposition, target market and the core
            problem you're solving.
          </Text>
        </View>

        <Pressable
          testID="try-example-button"
          onPress={onUseExample}
          style={styles.exampleButton}
          disabled={isSubmitting}
        >
          <Text style={styles.exampleText}>Try an example →</Text>
        </Pressable>
      </Card>

      {/* Tips for Better Analysis */}
      <Card style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <IconBadge name="check" tone="violet" size={30} />
          <View>
            <Text style={styles.tipsTitle}>Tips for Better Analysis</Text>
            <Text style={styles.tipsSubtitle}>
              Key parts of a high-quality evaluation
            </Text>
          </View>
        </View>

        <View style={styles.tipsGrid}>
          {TIPS.map((tip) => (
            <View key={tip.title} style={styles.tipBox}>
              <Icon
                name={tip.icon}
                size={16}
                color={colors.brand.primary}
                style={{ marginBottom: 6 }}
              />
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Cost indication & 3D Analyze Button */}
      <View style={styles.ctaWrapper}>
        <View style={styles.costRow}>
          <Icon name="zap" size={13} color={colors.brand.soft} />
          <Text style={styles.costText}>Cost: 1 Credit • Backend Verified</Text>
        </View>
        <Button
          testID="submit-idea-button"
          title={
            isSubmitting ? 'Submitting to AI Engine…' : 'Analyze Idea (1 Credit)'
          }
          onPress={onInitiateValidation}
          disabled={isSubmitDisabled}
          loading={isSubmitting}
          variant="primary"
          size="lg"
          rightIcon={
            !isSubmitting ? (
              <Icon name="chevronRight" size={16} color="#FFFFFF" />
            ) : undefined
          }
        />
      </View>
    </>
  );
};
