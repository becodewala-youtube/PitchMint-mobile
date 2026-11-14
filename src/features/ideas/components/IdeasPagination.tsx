import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from '../../../components';
import { colors } from '../../../theme';
import { styles } from '../screens/IdeasScreen.styles';

export interface IdeasPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const IdeasPagination: React.FC<IdeasPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <View style={styles.paginationBar}>
      <Pressable
        disabled={currentPage <= 1}
        onPress={() => onPageChange(currentPage - 1)}
        style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Previous page"
      >
        <Icon
          name="chevronLeft"
          size={14}
          color={currentPage <= 1 ? colors.text.muted : colors.text.primary}
        />
        <Text
          style={[
            styles.pageBtnText,
            currentPage <= 1 && styles.pageBtnTextDisabled,
          ]}
        >
          Prev
        </Text>
      </Pressable>

      <Text style={styles.pageInfoText}>
        Page {currentPage} of {totalPages}
      </Text>

      <Pressable
        disabled={currentPage >= totalPages}
        onPress={() => onPageChange(currentPage + 1)}
        style={[
          styles.pageBtn,
          currentPage >= totalPages && styles.pageBtnDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Next page"
      >
        <Text
          style={[
            styles.pageBtnText,
            currentPage >= totalPages && styles.pageBtnTextDisabled,
          ]}
        >
          Next
        </Text>
        <Icon
          name="chevronRight"
          size={14}
          color={currentPage >= totalPages ? colors.text.muted : colors.text.primary}
        />
      </Pressable>
    </View>
  );
};
