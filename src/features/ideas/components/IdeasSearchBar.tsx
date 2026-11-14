import React from 'react';
import { View, TextInput, ScrollView, Pressable, Text } from 'react-native';
import { Icon } from '../../../components';
import { colors } from '../../../theme';
import { styles } from '../screens/IdeasScreen.styles';

export type FilterType = 'all' | 'top' | 'deck' | 'none';

export interface IdeasSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  totalIdeas: number;
}

export const IdeasSearchBar: React.FC<IdeasSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onSelectFilter,
  totalIdeas,
}) => {
  const filters: Array<{ key: FilterType; label: string }> = [
    { key: 'all', label: `All (${totalIdeas})` },
    { key: 'top', label: 'Top scored (80+)' },
    { key: 'deck', label: 'Has pitch deck' },
    { key: 'none', label: 'Not explored' },
  ];

  return (
    <>
      {/* 2. Search Input */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={16}
          color={colors.text.muted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ideas, categories…"
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* 3. Horizontal Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipScroll}
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => onSelectFilter(f.key)}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={f.label}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
};
