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
import { MarketResearchResponse } from '../../../services/api/ideasApi.types';
import { useAuth } from '../../../context/AuthContext';
import { styles } from './MarketResearchScreen.styles';

type MarketRouteProp = RouteProp<RootStackParamList, 'MarketResearch'>;

const formatMarketValue = (val: any): string => {
  if (val === undefined || val === null) return 'N/A';
  if (typeof val === 'number') {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
    return `$${val.toLocaleString()}`;
  }
  return String(val);
};

export const MarketResearchScreen: React.FC = () => {
  const route = useRoute<MarketRouteProp>();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();

  const [ideaText, setIdeaText] = useState<string>(route.params?.ideaText || '');
  const [industry, setIndustry] = useState<string>('SaaS / Technology');
  const [targetRegion, setTargetRegion] = useState<string>('Global');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCreditModal, setShowCreditModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MarketResearchResponse | null>(null);

  useEffect(() => {
    if (route.params?.ideaId && !ideaText) {
      ideasApi
        .getIdeaById(route.params.ideaId)
        .then((data) => {
          if (data?.ideaText) setIdeaText(data.ideaText);
        })
        .catch(() => {});
    }
  }, [route.params?.ideaId, ideaText]);

  const handleStartAnalysis = () => {
    if (!ideaText.trim()) {
      setError('Please provide your startup idea description.');
      return;
    }
    if (!industry.trim() || !targetRegion.trim()) {
      setError('Please provide industry and target region.');
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
      const data = await toolkitApi.analyzeMarketResearch({
        ideaText: ideaText.trim(),
        industry: industry.trim(),
        targetRegion: targetRegion.trim(),
      });
      setResult(data);
      await refreshUser().catch(() => {});
    } catch (err: any) {
      console.warn('[MarketResearchScreen] Error:', err);
      setError(err?.message || 'Failed to analyze market.');
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
            testID="market-research-back-btn"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>Market Research</Text>
            <Text style={styles.topBarSubtitle}>TAM · SAM · SOM Analysis</Text>
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
          <Text style={styles.label}>Startup Idea / Concept</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Describe your startup and product offering..."
            placeholderTextColor={colors.text.muted}
            value={ideaText}
            onChangeText={setIdeaText}
            testID="market-research-idea-input"
          />

          <Text style={styles.label}>Industry Sector</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. HealthTech, B2B SaaS, CleanTech"
            placeholderTextColor={colors.text.muted}
            value={industry}
            onChangeText={setIndustry}
            testID="market-research-industry-input"
          />

          <Text style={styles.label}>Target Geographic Region</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. North America, Global, Europe"
            placeholderTextColor={colors.text.muted}
            value={targetRegion}
            onChangeText={setTargetRegion}
            testID="market-research-region-input"
          />

          <Button
            title={isLoading ? 'Analyzing Market...' : 'Run Market Analysis (2 Credits)'}
            onPress={handleStartAnalysis}
            disabled={isLoading || !ideaText.trim()}
            style={styles.submitBtn}
            testID="market-research-submit-btn"
          />
        </Card>

        {isLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={{ color: colors.text.muted, marginTop: 8 }}>
              Analyzing market data with Gemini AI...
            </Text>
          </View>
        )}

        {/* Results View */}
        {result && (
          <View style={styles.resultsContainer} testID="market-research-results">
            <Text style={styles.sectionTitle}>Market Sizing Breakdown</Text>
            <View style={styles.tamGrid}>
              <Card style={[styles.tamCard, styles.tamTamCard]}>
                <View style={styles.tamLabelRow}>
                  <Text style={styles.tamLabel}>TAM (Total Addressable Market)</Text>
                </View>
                <Text style={styles.tamValue}>{formatMarketValue(result.tam?.value)}</Text>
                {result.tam?.description && (
                  <Text style={styles.tamDesc}>{result.tam.description}</Text>
                )}
              </Card>

              <Card style={[styles.tamCard, styles.tamSamCard]}>
                <View style={styles.tamLabelRow}>
                  <Text style={styles.tamLabel}>SAM (Serviceable Addressable Market)</Text>
                </View>
                <Text style={styles.tamValue}>{formatMarketValue(result.sam?.value)}</Text>
                {result.sam?.description && (
                  <Text style={styles.tamDesc}>{result.sam.description}</Text>
                )}
              </Card>

              <Card style={[styles.tamCard, styles.tamSomCard]}>
                <View style={styles.tamLabelRow}>
                  <Text style={styles.tamLabel}>SOM (Serviceable Obtainable Market)</Text>
                </View>
                <Text style={styles.tamValue}>{formatMarketValue(result.som?.value)}</Text>
                {result.som?.description && (
                  <Text style={styles.tamDesc}>{result.som.description}</Text>
                )}
              </Card>
            </View>

            {result.marketGrowthRate && (
              <Card style={styles.itemCard}>
                <Text style={styles.itemTitle}>Projected Growth Rate</Text>
                <Text style={styles.itemDesc}>{result.marketGrowthRate}</Text>
              </Card>
            )}

            {Array.isArray(result.targetAudience) && result.targetAudience.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Target Customer Personas</Text>
                {result.targetAudience.map((audience: any, idx: number) => {
                  const title = typeof audience === 'string' ? audience : audience.segment || `Persona ${idx + 1}`;
                  const desc = typeof audience === 'object' ? audience.description : '';
                  return (
                    <Card key={`persona-${idx}`} style={styles.itemCard}>
                      <Text style={styles.itemTitle}>{title}</Text>
                      {desc ? <Text style={styles.itemDesc}>{desc}</Text> : null}
                    </Card>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <CreditConfirmationModal
        visible={showCreditModal}
        title="Analyze Market Potential?"
        description="PitchMint AI will compute TAM, SAM, SOM vectors and persona profiles based on industry benchmarks."
        costCredits={2}
        currentCredits={user?.credits ?? 0}
        confirmText="Analyze (2 Credits)"
        onConfirm={handleConfirmExecute}
        onCancel={() => setShowCreditModal(false)}
        confirmTestID="market-confirm-btn"
        cancelTestID="market-cancel-btn"
      />
    </ScreenContainer>
  );
};
