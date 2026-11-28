import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ScreenContainer,
  Card,
  Icon,
} from '../../../components';
import { colors } from '../../../theme';
import { toolkitApi } from '../../../services/api/toolkitApi';
import { InvestorItem } from '../../../services/api/ideasApi.types';
import { openSafeExternalUrl } from '../../../utils/safeLinking';
import { styles } from './InvestorDirectoryScreen.styles';

const INVESTOR_TYPES = ['All', 'VC', 'Angel', 'Accelerator', 'Incubator'];

export const InvestorDirectoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [investors, setInvestors] = useState<InvestorItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPremiumRequired, setIsPremiumRequired] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestors = useCallback(async (isPull = false) => {
    if (isPull) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setIsPremiumRequired(false);

    try {
      const data = await toolkitApi.getInvestors();
      setInvestors(data);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.toLowerCase().includes('premium')) {
        setIsPremiumRequired(true);
      } else {
        setError(err?.message || 'Unable to load investors directory.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  const handleOpenLink = async (url?: string) => {
    if (!url) return;
    await openSafeExternalUrl(url, 'investor website', {
      allowHttp: true,
      defaultHttps: true,
    });
  };

  const filteredInvestors = investors.filter((inv) => {
    const matchesType =
      selectedType === 'All' || inv.type?.toLowerCase() === selectedType.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      inv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.industryFocus?.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <ScreenContainer withHeaderOffset={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchInvestors(true)}
            tintColor={colors.brand.primary}
          />
        }
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable
            testID="investor-directory-back-btn"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>Investor Directory</Text>
            <Text style={styles.topBarSubtitle}>Curated VCs, Angels & Accelerators</Text>
          </View>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>Free</Text>
          </View>
        </View>

        {isPremiumRequired && (
          <View style={styles.premiumBanner} testID="investor-premium-banner">
            <Icon name="crown" size={32} color={colors.tones.amber.text} />
            <Text style={styles.premiumTitle}>Premium Directory</Text>
            <Text style={styles.premiumDesc}>
              The full investor directory is accessible with a PitchMint Pro or Premium plan.
              Upgrade your subscription to unlock verified partner emails and check sizes.
            </Text>
          </View>
        )}

        {error && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Notice</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
          </Card>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={16} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by firm, industry or region..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="investor-search-input"
          />
        </View>

        {/* Type Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {INVESTOR_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setSelectedType(type)}
                style={[
                  styles.filterChip,
                  selectedType === type && styles.filterChipActive,
                ]}
                accessibilityRole="button"
                testID={`investor-type-filter-${type.toLowerCase()}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedType === type && styles.filterChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {isLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={{ color: colors.text.muted, marginTop: 12 }}>
              Loading curated investors...
            </Text>
          </View>
        ) : filteredInvestors.length === 0 && !isPremiumRequired ? (
          <Card style={styles.emptyCard} testID="investor-empty-card">
            <Icon name="users" size={32} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>No Investors Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query or filter criteria.
            </Text>
          </Card>
        ) : (
          filteredInvestors.map((inv) => (
            <Card key={inv._id} style={styles.investorCard} testID={`investor-card-${inv._id}`}>
              <View style={styles.cardHeader}>
                <Text style={styles.investorName}>{inv.name}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{inv.type}</Text>
                </View>
              </View>

              {inv.location ? (
                <Text style={styles.locationText}>📍 {inv.location}</Text>
              ) : null}

              <Text style={styles.descText} numberOfLines={3}>
                {inv.description}
              </Text>

              {Array.isArray(inv.industryFocus) && inv.industryFocus.length > 0 && (
                <View style={styles.tagsRow}>
                  {inv.industryFocus.map((tag, idx) => (
                    <View key={`tag-${idx}`} style={styles.tagPill}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {inv.contactLink ? (
                <Pressable
                  style={styles.contactBtn}
                  onPress={() => handleOpenLink(inv.contactLink)}
                  accessibilityRole="button"
                  accessibilityLabel={`Contact ${inv.name}`}
                >
                  <Text style={styles.contactBtnText}>View Website / Portfolio</Text>
                  <Icon name="arrowRight" size={14} color={colors.tones.blue.text} />
                </Pressable>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
};
