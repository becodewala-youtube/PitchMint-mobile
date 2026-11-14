import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Card, IconBadge, Icon, Pill, Badge, Button } from '../../../components';
import { colors } from '../../../theme';
import { BackendIdea } from '../../../services/api/ideasApi';
import { SLIDE_DEFINITIONS } from '../../pitch-deck/constants/slideDefinitions';
import { CANVAS_BLOCK_DEFINITIONS } from '../../canvas/constants/blockDefinitions';
import { CompetitorActionModule } from './CompetitorActionModule';
import { PitchSimulationActionModule } from './PitchSimulationActionModule';
import { styles } from '../screens/IdeaDetailsScreen.styles';

export interface IdeaActionModulesProps {
  idea: BackendIdea;
  hasPitchDeck: boolean;
  hasCanvas: boolean;
  hasCompetitors: boolean;
  hasSimulation: boolean;
  userCredits: number;
  isGeneratingDeck: boolean;
  isGeneratingCanvas: boolean;
  onViewPitchDeck: (initialSlideIndex?: number) => void;
  onOpenDeckConfirm: () => void;
  onViewCanvas: (initialBlockIndex?: number) => void;
  onOpenCanvasConfirm: () => void;
  onViewCompetitors?: () => void;
  onAnalyzeCompetitors?: () => void;
  onViewPitchSimulation?: () => void;
  onStartPitchSimulation?: () => void;
  onDeleteIdea?: () => void;
  onValidateAnother: () => void;
  onBack: () => void;
}

export const IdeaActionModules: React.FC<IdeaActionModulesProps> = ({
  idea,
  hasPitchDeck,
  hasCanvas,
  hasCompetitors,
  hasSimulation,
  userCredits,
  isGeneratingDeck,
  isGeneratingCanvas,
  onViewPitchDeck,
  onOpenDeckConfirm,
  onViewCanvas,
  onOpenCanvasConfirm,
  onViewCompetitors,
  onAnalyzeCompetitors,
  onViewPitchSimulation,
  onStartPitchSimulation,
  onDeleteIdea,
  onValidateAnother,
  onBack,
}) => {
  return (
    <>
      <Text style={styles.sectionHeaderTitle}>Saved Action Modules</Text>

      {/* Module A: Competitor Analysis */}
      <CompetitorActionModule
        idea={idea}
        hasCompetitors={hasCompetitors}
        onViewCompetitors={onViewCompetitors}
        onAnalyzeCompetitors={onAnalyzeCompetitors}
      />

      {/* Module B: Pitch Deck Presentation */}
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeaderRow}>
          <IconBadge name="fileText" tone="blue" size={32} />
          <View style={styles.moduleHeaderTitleCol}>
            <Text style={styles.moduleTitle}>Pitch Deck Presentation</Text>
            <Text style={styles.moduleSubtitle}>
              {hasPitchDeck ? '10-slide investor presentation ready' : 'Not generated yet'}
            </Text>
          </View>
          <Badge
            label={hasPitchDeck ? 'ACTIVE' : 'NOT GENERATED'}
            variant={hasPitchDeck ? 'emerald' : 'gray'}
          />
        </View>

        {hasPitchDeck ? (
          <View style={styles.moduleContentArea}>
            <View style={styles.deckActionRow}>
              <Button
                testID="idea-details-view-pitch-deck-button"
                title="View Pitch Deck"
                variant="primary"
                onPress={() => onViewPitchDeck(0)}
                leftIcon={<Icon name="fileText" size={16} color="#FFFFFF" />}
                style={styles.viewDeckBtn}
              />
              <Button
                testID="idea-details-regenerate-pitch-deck-button"
                title={isGeneratingDeck ? 'Regenerating…' : 'Regenerate (1 Credit)'}
                variant="secondary"
                disabled={isGeneratingDeck}
                onPress={onOpenDeckConfirm}
                leftIcon={
                  isGeneratingDeck ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Icon name="sparkles" size={16} color={colors.brand.primary} />
                  )
                }
                style={styles.regenerateDeckBtn}
              />
            </View>

            {SLIDE_DEFINITIONS.map((slide, sIdx) => {
              const content = idea.pitchDeckContent?.[slide.key];
              if (!content) return null;
              const slideLabel = `${sIdx + 1}. ${slide.key === 'goToMarket' ? 'Go-to-Market Strategy' : slide.title}`;

              return (
                <Pressable
                  key={slide.key}
                  testID={`idea-details-slide-preview-${sIdx}`}
                  onPress={() => onViewPitchDeck(sIdx)}
                  style={styles.slideCard}
                  accessibilityRole="button"
                  accessibilityLabel={`Open slide ${slideLabel}`}
                >
                  <View style={styles.slideCardHeader}>
                    <Text style={styles.slideTitle}>{slideLabel}</Text>
                    <Icon name="chevronRight" size={14} color={colors.text.muted} />
                  </View>
                  <Text style={styles.slideBody} numberOfLines={2}>
                    {content}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.moduleEmptyState}>
            <Text style={styles.moduleEmptyText}>
              A 10-slide investor pitch deck has not been generated for this idea yet.
            </Text>
            <View style={styles.uncreatedCreditRow}>
              <Text style={styles.uncreatedCreditText}>
                {`Cost: 1 Credit • Your Balance: ${userCredits} ${userCredits === 1 ? 'Credit' : 'Credits'}`}
              </Text>
            </View>
            <Button
              testID="idea-details-generate-pitch-deck-button"
              title={isGeneratingDeck ? 'Generating Deck with AI…' : 'Generate Pitch Deck (1 Credit)'}
              variant="primary"
              disabled={isGeneratingDeck}
              onPress={onOpenDeckConfirm}
              leftIcon={
                isGeneratingDeck ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon name="sparkles" size={16} color="#FFFFFF" />
                )
              }
              style={styles.generateDeckBtn}
            />
          </View>
        )}
      </Card>

      {/* Module C: Business Model Canvas (Lean Canvas) */}
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeaderRow}>
          <IconBadge name="panelsTopLeft" tone="emerald" size={32} />
          <View style={styles.moduleHeaderTitleCol}>
            <Text style={styles.moduleTitle}>Business Model Canvas</Text>
            <Text style={styles.moduleSubtitle}>
              {hasCanvas ? '9-block business model model ready' : 'Not generated yet'}
            </Text>
          </View>
          <Badge
            label={hasCanvas ? 'ACTIVE' : 'NOT GENERATED'}
            variant={hasCanvas ? 'emerald' : 'gray'}
          />
        </View>

        {hasCanvas ? (
          <View style={styles.moduleContentArea}>
            <View style={styles.deckActionRow}>
              <Button
                testID="idea-details-view-canvas-button"
                title="View Full Canvas"
                variant="primary"
                onPress={() => onViewCanvas(0)}
                leftIcon={<Icon name="panelsTopLeft" size={16} color="#FFFFFF" />}
                style={styles.viewDeckBtn}
              />
              <Button
                testID="idea-details-regenerate-canvas-button"
                title={isGeneratingCanvas ? 'Regenerating…' : 'Regenerate (1 Credit)'}
                variant="secondary"
                disabled={isGeneratingCanvas}
                onPress={onOpenCanvasConfirm}
                leftIcon={
                  isGeneratingCanvas ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Icon name="sparkles" size={16} color={colors.brand.primary} />
                  )
                }
                style={styles.regenerateDeckBtn}
              />
            </View>

            <View style={styles.canvasGrid}>
              {CANVAS_BLOCK_DEFINITIONS.map((block, bIdx) => {
                const text = idea.canvasContent?.[block.key];
                if (!text) return null;

                return (
                  <Pressable
                    key={block.key}
                    testID={`idea-details-canvas-preview-${bIdx}`}
                    onPress={() => onViewCanvas(bIdx)}
                    style={[
                      styles.canvasBox,
                      { borderColor: colors.tones[block.tone].border },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Open canvas block ${block.title}`}
                  >
                    <Text style={[styles.canvasBoxLabel, { color: colors.tones[block.tone].text }]}>
                      {block.title}
                    </Text>
                    <Text style={styles.canvasBoxText} numberOfLines={3}>
                      {text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.moduleEmptyState}>
            <Text style={styles.moduleEmptyText}>
              A 9-block business model canvas has not been generated for this idea yet.
            </Text>
            <View style={styles.uncreatedCreditRow}>
              <Text style={styles.uncreatedCreditText}>
                {`Cost: 1 Credit • Your Balance: ${userCredits} ${userCredits === 1 ? 'Credit' : 'Credits'}`}
              </Text>
            </View>
            <Button
              testID="idea-details-generate-canvas-button"
              title={isGeneratingCanvas ? 'Generating Canvas with AI…' : 'Generate Canvas (1 Credit)'}
              variant="primary"
              disabled={isGeneratingCanvas}
              onPress={onOpenCanvasConfirm}
              leftIcon={
                isGeneratingCanvas ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon name="sparkles" size={16} color="#FFFFFF" />
                )
              }
              style={styles.generateDeckBtn}
            />
          </View>
        )}
      </Card>

      {/* Module D: Pitch Simulation & Investor Q&A */}
      <PitchSimulationActionModule
        idea={idea}
        hasSimulation={hasSimulation}
        onViewPitchSimulation={onViewPitchSimulation}
        onStartPitchSimulation={onStartPitchSimulation}
      />

      {/* Action Hub */}
      <Text style={styles.sectionHeaderTitle}>Action Hub</Text>
      <Card style={styles.actionHubCard}>
        <View style={styles.actionHubHeader}>
          <IconBadge name="zap" tone="violet" size={38} />
          <View style={styles.actionHubTitleCol}>
            <Text style={styles.actionHubTitle}>Idea Next Steps</Text>
            <Text style={styles.actionHubSubtitle}>
              Validate new ideas, manage your portfolio, or remove this idea.
            </Text>
          </View>
        </View>

        <Button
          testID="idea-details-validate-another-button"
          title="Validate Another Idea"
          variant="primary"
          onPress={onValidateAnother}
          leftIcon={<Icon name="zap" size={16} color="#FFFFFF" />}
          style={styles.actionBtnPrimary}
        />

        <Button
          testID="idea-details-back-to-saved-ideas-button"
          title="Back to Saved Ideas"
          variant="secondary"
          onPress={onBack}
          leftIcon={<Icon name="chevronLeft" size={16} color={colors.text.primary} />}
          style={styles.actionBtnSecondary}
        />

        {onDeleteIdea ? (
          <Button
            testID="idea-details-action-hub-delete-button"
            title="Delete Saved Idea"
            variant="ghost"
            onPress={onDeleteIdea}
            leftIcon={<Icon name="trash" size={16} color={colors.tones.red.text} />}
            style={[styles.actionBtnSecondary, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}
            textStyle={{ color: colors.tones.red.text }}
          />
        ) : null}

        <Text style={styles.actionHubFooter}>
          All data is backed by your cloud MongoDB account.
        </Text>
      </Card>
    </>
  );
};
