import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Card, IconBadge, Icon, Pill, Badge, Button } from '../../../components';
import { colors } from '../../../theme';
import { BackendIdea } from '../../../services/api/ideasApi';
import { SLIDE_DEFINITIONS } from '../../pitch-deck/constants/slideDefinitions';
import { CANVAS_BLOCK_DEFINITIONS } from '../../canvas/constants/blockDefinitions';
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
  onValidateAnother,
  onBack,
}) => {
  return (
    <>
      <Text style={styles.sectionHeaderTitle}>Saved Action Modules</Text>

      {/* Module A: Competitor Analysis */}
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeaderRow}>
          <IconBadge name="users" tone="orange" size={32} />
          <View style={styles.moduleHeaderTitleCol}>
            <Text style={styles.moduleTitle}>Competitor Analysis</Text>
            <Text style={styles.moduleSubtitle}>
              {hasCompetitors
                ? `${idea.competitorAnalysis?.competitors?.length} competitors profiled`
                : 'Not generated yet'}
            </Text>
          </View>
          <Badge
            label={hasCompetitors ? 'ACTIVE' : 'NOT GENERATED'}
            variant={hasCompetitors ? 'emerald' : 'gray'}
          />
        </View>

        {hasCompetitors ? (
          <View style={styles.moduleContentArea}>
            {idea.competitorAnalysis?.summary ? (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Competitive Landscape Summary</Text>
                <Text style={styles.summaryText}>{idea.competitorAnalysis.summary}</Text>
              </View>
            ) : null}

            {idea.competitorAnalysis?.competitors?.map((comp, idx) => (
              <View
                key={`${comp.name || 'comp'}-${idx}`}
                testID={`idea-details-competitor-card-${idx}`}
                style={styles.competitorCard}
              >
                <View style={styles.competitorHeaderRow}>
                  <Text style={styles.competitorName}>{comp.name || `Competitor #${idx + 1}`}</Text>
                  <Pill label={`Competitor #${idx + 1}`} tone="gray" />
                </View>
                {comp.description ? (
                  <Text style={styles.competitorDesc}>{comp.description}</Text>
                ) : null}

                {/* SWOT matrix if available */}
                {comp.swot && (
                  <View style={styles.swotGrid}>
                    {comp.swot.strengths && comp.swot.strengths.length > 0 && (
                      <View style={styles.swotCol}>
                        <Text style={[styles.swotTitle, { color: colors.tones.emerald.text }]}>
                          Strengths
                        </Text>
                        {comp.swot.strengths.map((s, i) => (
                          <Text key={i} style={styles.swotItem}>• {s}</Text>
                        ))}
                      </View>
                    )}
                    {comp.swot.weaknesses && comp.swot.weaknesses.length > 0 && (
                      <View style={styles.swotCol}>
                        <Text style={[styles.swotTitle, { color: colors.tones.red.text }]}>
                          Weaknesses
                        </Text>
                        {comp.swot.weaknesses.map((w, i) => (
                          <Text key={i} style={styles.swotItem}>• {w}</Text>
                        ))}
                      </View>
                    )}
                    {comp.swot.opportunities && comp.swot.opportunities.length > 0 && (
                      <View style={styles.swotCol}>
                        <Text style={[styles.swotTitle, { color: colors.tones.cyan.text }]}>
                          Opportunities
                        </Text>
                        {comp.swot.opportunities.map((o, i) => (
                          <Text key={i} style={styles.swotItem}>• {o}</Text>
                        ))}
                      </View>
                    )}
                    {comp.swot.threats && comp.swot.threats.length > 0 && (
                      <View style={styles.swotCol}>
                        <Text style={[styles.swotTitle, { color: colors.tones.amber.text }]}>
                          Threats
                        </Text>
                        {comp.swot.threats.map((t, i) => (
                          <Text key={i} style={styles.swotItem}>• {t}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.moduleEmptyState}>
            <Text style={styles.moduleEmptyText}>
              Competitor profiles and SWOT matrices have not been generated for this idea yet.
            </Text>
          </View>
        )}
      </Card>

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

      {/* Module C: Business Model Canvas */}
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeaderRow}>
          <IconBadge name="panelsTopLeft" tone="emerald" size={32} />
          <View style={styles.moduleHeaderTitleCol}>
            <Text style={styles.moduleTitle}>Business Model Canvas</Text>
            <Text style={styles.moduleSubtitle}>
              {hasCanvas ? '9-block canvas generated' : 'Not generated yet'}
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
                title="View Canvas"
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
                    style={styles.canvasBox}
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
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeaderRow}>
          <IconBadge name="messageSquare" tone="pink" size={32} />
          <View style={styles.moduleHeaderTitleCol}>
            <Text style={styles.moduleTitle}>Investor Pitch Simulation</Text>
            <Text style={styles.moduleSubtitle}>
              {hasSimulation
                ? `${idea.pitchSimulation?.questions?.length} Q&A questions stored`
                : 'Not simulated yet'}
            </Text>
          </View>
          <Badge
            label={hasSimulation ? 'ACTIVE' : 'NOT GENERATED'}
            variant={hasSimulation ? 'emerald' : 'gray'}
          />
        </View>

        {hasSimulation ? (
          <View style={styles.moduleContentArea}>
            {idea.pitchSimulation?.questions?.map((q, idx) => (
              <View key={q.id || `q-${idx}`} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Pill label={q.category || 'General'} tone="violet" />
                  {q.feedback?.rating ? (
                    <Badge label={`Rating: ${q.feedback.rating}/5`} variant="amber" />
                  ) : null}
                </View>
                <Text style={styles.questionText}>Q: {q.question}</Text>
                {q.answer ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerLabel}>Your Stored Answer:</Text>
                    <Text style={styles.answerText}>{q.answer}</Text>
                  </View>
                ) : (
                  <Text style={styles.noAnswerText}>No response recorded yet.</Text>
                )}
                {q.feedback && (
                  <View style={styles.feedbackBox}>
                    {q.feedback.strengths && q.feedback.strengths.length > 0 && (
                      <View style={styles.feedbackSection}>
                        <Text style={styles.feedbackSectionTitle}>Strengths:</Text>
                        {q.feedback.strengths.map((s, i) => (
                          <Text key={i} style={styles.feedbackBullet}>• {s}</Text>
                        ))}
                      </View>
                    )}
                    {q.feedback.improvements && q.feedback.improvements.length > 0 && (
                      <View style={styles.feedbackSection}>
                        <Text style={styles.feedbackSectionTitle}>Areas for Improvement:</Text>
                        {q.feedback.improvements.map((imp, i) => (
                          <Text key={i} style={styles.feedbackBullet}>• {imp}</Text>
                        ))}
                      </View>
                    )}
                    {q.feedback.additionalAdvice ? (
                      <Text style={styles.adviceText}>💡 {q.feedback.additionalAdvice}</Text>
                    ) : null}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.moduleEmptyState}>
            <Text style={styles.moduleEmptyText}>
              Interactive investor simulation questions have not been generated for this idea yet.
            </Text>
          </View>
        )}
      </Card>

      {/* Action Hub */}
      <Text style={styles.sectionHeaderTitle}>Action Hub</Text>
      <Card style={styles.actionHubCard}>
        <View style={styles.actionHubHeader}>
          <IconBadge name="zap" tone="violet" size={38} />
          <View style={styles.actionHubTitleCol}>
            <Text style={styles.actionHubTitle}>Idea Next Steps</Text>
            <Text style={styles.actionHubSubtitle}>
              Validate new ideas or return to your portfolio.
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

        <Text style={styles.actionHubFooter}>
          All data is backed by your cloud MongoDB account.
        </Text>
      </Card>
    </>
  );
};
