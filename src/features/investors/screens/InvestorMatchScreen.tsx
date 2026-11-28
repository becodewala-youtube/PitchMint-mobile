import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import {
  ScreenContainer,
  Card,
  Icon,
  Button,
  CreditConfirmationModal,
} from '../../../components';
import { colors } from '../../../theme';
import { toolkitApi } from '../../../services/api/toolkitApi';
import { ideasApi } from '../../../services/api/ideasApi';
import { MatchedInvestor } from '../../../services/api/ideasApi.types';
import { useAuth } from '../../../context/AuthContext';
import { logDevWarning } from '../../../utils/logger';
import { styles } from './InvestorMatchScreen.styles';

type MatchRouteProp = RouteProp<RootStackParamList, 'InvestorMatchmaking'>;

export const InvestorMatchScreen: React.FC = () => {
  const route = useRoute<MatchRouteProp>();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();

  const [description, setDescription] = useState<string>(route.params?.ideaText || '');
  const [industry, setIndustry] = useState<string>('Artificial Intelligence');
  const [stage, setStage] = useState<string>('Seed');
  const [fundingAmount, setFundingAmount] = useState<string>('$1,000,000');
  const [location, setLocation] = useState<string>('Global');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCreditModal, setShowCreditModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchedInvestor[]>([]);

  useEffect(() => {
    if (route.params?.ideaId && !description) {
      ideasApi
        .getIdeaById(route.params.ideaId)
        .then((data) => {
          if (data?.ideaText) setDescription(data.ideaText);
        })
        .catch(() => {});
    }
  }, [route.params?.ideaId, description]);

  const handleStartMatching = () => {
    if (!description.trim()) {
      setError('Please provide your startup pitch or idea description.');
      return;
    }
    if (!industry.trim() || !stage.trim()) {
      setError('Please provide industry and funding stage.');
      return;
    }
    setError(null);
    setShowCreditModal(true);
  };

  const handleConfirmExecute = async () => {
    setShowCreditModal(false);
    setIsLoading(true);
    setError(null);

    try {
      const response = await toolkitApi.matchInvestors({
        description: description.trim(),
        industry: industry.trim(),
        stage: stage.trim(),
        fundingAmount: fundingAmount.trim(),
        location: location.trim(),
      });
      setMatches(response.matches || []);
      await refreshUser().catch(() => {});
    } catch (err: any) {
      logDevWarning('InvestorMatchScreen', 'Investor match error', err);
      setError(err?.message || 'Failed to match investors.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer withHeaderOffset={false}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable
            testID="investor-match-back-btn"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>AI Investor Match</Text>
            <Text style={styles.topBarSubtitle}>Algorithmic VC & Angel Pairing</Text>
          </View>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>2 Credits</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input Form Card */}
        <Card style={styles.formCard}>
          <Text style={styles.label}>Startup Pitch / Value Proposition</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            maxLength={2000}
            placeholder="Describe what your startup does and your unfair advantage..."
            placeholderTextColor={colors.text.muted}
            value={description}
            onChangeText={setDescription}
            testID="investor-match-desc-input"
          />

          <Text style={styles.label}>Target Industry / Sector</Text>
          <TextInput
            style={styles.input}
            maxLength={100}
            placeholder="e.g. AI, B2B SaaS, FinTech, BioTech"
            placeholderTextColor={colors.text.muted}
            value={industry}
            onChangeText={setIndustry}
            testID="investor-match-industry-input"
          />

          <Text style={styles.label}>Funding Stage</Text>
          <TextInput
            style={styles.input}
            maxLength={100}
            placeholder="e.g. Pre-Seed, Seed, Series A"
            placeholderTextColor={colors.text.muted}
            value={stage}
            onChangeText={setStage}
            testID="investor-match-stage-input"
          />

          <Text style={styles.label}>Target Check / Raise Amount</Text>
          <TextInput
            style={styles.input}
            maxLength={50}
            placeholder="e.g. $500K - $1.5M"
            placeholderTextColor={colors.text.muted}
            value={fundingAmount}
            onChangeText={setFundingAmount}
            testID="investor-match-amount-input"
          />

          <Button
            title={isLoading ? 'Finding Investor Matches...' : 'Find Top Matches (2 Credits)'}
            onPress={handleStartMatching}
            disabled={isLoading || !description.trim()}
            style={styles.submitBtn}
            testID="investor-match-submit-btn"
          />
        </Card>

        {isLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={{ color: colors.text.muted, marginTop: 8 }}>
              Analyzing investor portfolio mandates with Gemini AI...
            </Text>
          </View>
        )}

        {/* Results List */}
        {matches.length > 0 && (
          <View style={styles.resultsSection} testID="investor-matches-container">
            <Text style={styles.sectionTitle}>Top Investor Matches ({matches.length})</Text>
            {matches.map((item, idx) => (
              <Card key={`match-${idx}`} style={styles.matchCard} testID={`investor-match-card-${idx}`}>
                <View style={styles.cardHeader}>
                  <Text style={styles.investorName}>{item.name}</Text>
                  <View style={styles.matchScoreBadge}>
                    <Text style={styles.matchScoreText}>{item.type || 'VC'}</Text>
                  </View>
                </View>

                {item.stage || item.ticketSize ? (
                  <Text style={styles.metaText}>
                    {[item.stage, item.ticketSize].filter(Boolean).join(' • ')}
                  </Text>
                ) : null}

                <Text style={styles.descText} numberOfLines={3}>
                  {item.description}
                </Text>

                {item.matchReason && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Match Rationale</Text>
                    <Text style={styles.reasonText}>{item.matchReason}</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <CreditConfirmationModal
        visible={showCreditModal}
        title="Find Investor Matches?"
        description="PitchMint AI will scan venture databases and score alignment with partner thesis."
        costCredits={2}
        currentCredits={user?.credits ?? 0}
        confirmText="Match (2 Credits)"
        onConfirm={handleConfirmExecute}
        onCancel={() => setShowCreditModal(false)}
        confirmTestID="investor-match-confirm-btn"
        cancelTestID="investor-match-cancel-btn"
      />
    </ScreenContainer>
  );
};
