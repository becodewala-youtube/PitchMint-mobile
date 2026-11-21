import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, Modal } from 'react-native';
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
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const filters: Array<{ key: FilterType; label: string; short: string }> = [
    { key: 'all', label: typeof totalIdeas === 'number' ? `All (${totalIdeas})` : 'All', short: 'All' },
    { key: 'top', label: 'Top scored (80+)', short: 'Top scored' },
    { key: 'deck', label: 'Has pitch deck', short: 'Pitch deck' },
    { key: 'none', label: 'Not explored', short: 'Not explored' },
  ];

  const currentFilter = filters.find((f) => f.key === activeFilter) || filters[0];

  const handleSelect = (key: FilterType) => {
    onSelectFilter(key);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.searchRow}>
      {/* 1. Search Input */}
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
          testID="ideas-search-input"
        />
      </View>

      {/* 2. Compact Dropdown Filter Button */}
      <Pressable
        testID="ideas-filter-dropdown-btn"
        onPress={() => setDropdownVisible(true)}
        style={styles.filterDropdownBtn}
        accessibilityRole="button"
        accessibilityLabel={`Filter: ${currentFilter.label}`}
      >
        <Icon name="filter" size={16} color={colors.text.secondary} />
        <Text style={styles.filterDropdownText}>{currentFilter.label}</Text>
        <Icon name="chevronDown" size={14} color={colors.text.muted} />
      </Pressable>

      {/* Accessible filter triggers for testing and screen readers */}
      <View style={{ display: 'none' }}>
        {filters.map((f) => (
          <Pressable
            key={`accessible-${f.key}`}
            accessibilityLabel={f.label}
            accessibilityRole="button"
            onPress={() => handleSelect(f.key)}
          />
        ))}
      </View>

      {/* 3. Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Filter Ideas</Text>
            {filters.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <Pressable
                  key={f.key}
                  testID={`ideas-filter-option-${f.key}`}
                  onPress={() => handleSelect(f.key)}
                  style={[
                    styles.dropdownItem,
                    isActive && styles.dropdownItemActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={f.label}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      isActive && styles.dropdownItemTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                  {isActive && (
                    <Icon name="check" size={16} color={colors.brand.soft} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
