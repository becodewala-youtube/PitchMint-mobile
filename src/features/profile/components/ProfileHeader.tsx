import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Card, Icon } from '../../../components';
import { colors } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { styles } from '../screens/ProfileScreen.styles';

export interface ProfileHeaderProps {
  initialLetter: string;
  displayName: string;
  displayEmail: string;
  displayPlan: string;
  displayCredits: number;
  totalIdeasCount: number;
  isPremium?: boolean;
  onUpdateName?: (name: string) => Promise<any>;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  initialLetter,
  displayName,
  displayEmail,
  displayPlan,
  displayCredits,
  totalIdeasCount,
  isPremium = false,
  onUpdateName,
}) => {
  const auth = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(displayName);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!isEditing) {
      setEditedName(displayName);
    }
  }, [displayName, isEditing]);

  const handleStartEditing = () => {
    setEditedName(displayName);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditedName(displayName);
    setIsEditing(false);
  };

  const handleSaveName = async () => {
    const trimmed = editedName.trim();
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Name cannot be empty.');
      return;
    }
    if (trimmed === displayName) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      if (onUpdateName) {
        await onUpdateName(trimmed);
      } else {
        await auth.updateName(trimmed);
      }
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert(
        'Update Failed',
        err?.message || 'Unable to update profile name. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeroRow}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLetter}>{initialLetter}</Text>
        </View>

        {isEditing ? (
          <>
            <View style={styles.profileDetailsCol}>
              <TextInput
                testID="profile-name-input"
                value={editedName}
                onChangeText={setEditedName}
                style={styles.nameInput}
                autoFocus
                selectTextOnFocus
                maxLength={50}
                placeholder="Enter your name"
                placeholderTextColor={colors.text.muted}
                editable={!isSaving}
                accessibilityLabel="Name input"
              />
              <View style={styles.emailRow}>
                <Icon name="mail" size={12} color={colors.text.muted} />
                <Text style={styles.userEmail} numberOfLines={1}>
                  {displayEmail}
                </Text>
              </View>
            </View>

            <View style={styles.editActionGroup}>
              <Pressable
                testID="profile-cancel-name-button"
                onPress={handleCancelEditing}
                disabled={isSaving}
                style={styles.cancelBtn}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing name"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={14} color={colors.tones.red.text} />
              </Pressable>
              <Pressable
                testID="profile-save-name-button"
                onPress={handleSaveName}
                disabled={isSaving}
                style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Save display name"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.tones.emerald.text} />
                ) : (
                  <Icon name="check" size={14} color={colors.tones.emerald.text} />
                )}
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.profileDetailsCol}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {displayName}
                </Text>
                {isPremium ? (
                  <View style={styles.crownBadge} testID="profile-crown-badge">
                    <Icon name="crown" size={16} color={colors.tones.amber.dot} />
                  </View>
                ) : null}
              </View>
              <View style={styles.emailRow}>
                <Icon name="mail" size={12} color={colors.text.muted} />
                <Text style={styles.userEmail} numberOfLines={1}>
                  {displayEmail}
                </Text>
              </View>
            </View>

            <Pressable
              testID="profile-edit-name-button"
              onPress={handleStartEditing}
              style={styles.pencilBtn}
              accessibilityRole="button"
              accessibilityLabel="Edit display name"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="pencil" size={14} color={colors.text.secondary} />
            </Pressable>
          </>
        )}
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
