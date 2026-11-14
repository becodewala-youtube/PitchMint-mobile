import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Card, Icon } from '../../../components';
import { colors } from '../../../theme';
import { styles } from '../screens/ProfileScreen.styles';

export interface ProfileHeaderProps {
  initialLetter: string;
  displayName: string;
  displayEmail: string;
  displayPlan: string;
  displayCredits: number;
  totalIdeasCount: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  initialLetter,
  displayName,
  displayEmail,
  displayPlan,
  displayCredits,
  totalIdeasCount,
}) => {
  return (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeroRow}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLetter}>{initialLetter}</Text>
        </View>
        <View style={styles.profileDetailsCol}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <View style={styles.emailRow}>
            <Icon name="mail" size={12} color={colors.text.muted} />
            <Text style={styles.userEmail}>{displayEmail}</Text>
          </View>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert(
              'User Profile',
              `Name: ${displayName}\nEmail: ${displayEmail}\nPlan: ${displayPlan}`
            )
          }
          style={styles.pencilBtn}
          accessibilityRole="button"
          accessibilityLabel="View profile info"
        >
          <Icon name="user" size={14} color={colors.text.secondary} />
        </Pressable>
      </View>

      {/* 3-Column Stats Sub-bar */}
      <View style={styles.profileStatsBar}>
        <View style={styles.statCol}>
          <Text style={styles.statColValue}>{totalIdeasCount}</Text>
          <Text style={styles.statColLabel}>Ideas</Text>
        </View>
        <View style={[styles.statCol, styles.statColDivider]}>
          <Text style={styles.statColValue}>{displayCredits}</Text>
          <Text style={styles.statColLabel}>Credits</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statColValue}>{displayPlan}</Text>
          <Text style={styles.statColLabel}>Plan</Text>
        </View>
      </View>
    </Card>
  );
};
