import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer, IconBadge } from '../../../components';
import { RootStackNavigationProp } from '../../../navigation/types';
import {
  TOOL_DEFINITIONS,
  ToolDefinition,
  PickIdeaTarget,
} from '../constants/toolkitConstants';
import { ToolkitHeader } from '../components/ToolkitHeader';
import { PickIdeaModal } from '../components/PickIdeaModal';
import { styles } from './ToolkitScreen.styles';

export const ToolkitScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [pickModalVisible, setPickModalVisible] = useState<boolean>(false);
  const [activeTargetTool, setActiveTargetTool] = useState<PickIdeaTarget | null>(null);

  const handleToolPress = (tool: ToolDefinition) => {
    switch (tool.actionKind) {
      case 'validate':
        navigation.navigate('ValidateModal');
        break;

      case 'pick-idea':
        if (tool.targetTool) {
          setActiveTargetTool(tool.targetTool);
          setPickModalVisible(true);
        }
        break;

      case 'coming-soon':
        Alert.alert(
          'Coming Soon',
          `${tool.name} is currently under development and will be available in an upcoming release.`,
          [{ text: 'OK' }]
        );
        break;
    }
  };

  const handleSelectIdeaForTool = (idea: { id: string; title: string }) => {
    setPickModalVisible(false);
    if (!activeTargetTool) return;

    switch (activeTargetTool) {
      case 'deck':
        navigation.navigate('PitchDeck', {
          ideaId: idea.id,
          ideaTitle: idea.title,
        });
        break;

      case 'canvas':
        navigation.navigate('Canvas', {
          ideaId: idea.id,
          ideaTitle: idea.title,
        });
        break;

      case 'competitors':
        navigation.navigate('Competitor', {
          ideaId: idea.id,
          ideaTitle: idea.title,
        });
        break;

      case 'simulator':
        navigation.navigate('PitchSimulator', {
          ideaId: idea.id,
          ideaTitle: idea.title,
        });
        break;
    }
  };

  return (
    <ScreenContainer withHeaderOffset={true}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ToolkitHeader />

        <View style={styles.grid}>
          {TOOL_DEFINITIONS.map((tool) => {
            const isComingSoon = tool.actionKind === 'coming-soon';
            return (
              <Pressable
                key={tool.id}
                testID={`toolkit-card-${tool.id}`}
                onPress={() => handleToolPress(tool)}
                style={({ pressed }) => [
                  styles.toolCard,
                  isComingSoon && styles.toolCardComingSoon,
                  pressed && styles.toolCardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${tool.name}${tool.badge ? ` (${tool.badge})` : ''}: ${tool.desc}`}
              >
                {tool.badge && (
                  <View
                    style={[
                      styles.premiumPill,
                      tool.badge === 'Coming Soon' && styles.comingSoonPill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.premiumPillText,
                        tool.badge === 'Coming Soon' && styles.comingSoonPillText,
                      ]}
                    >
                      {tool.badge}
                    </Text>
                  </View>
                )}

                <View style={styles.cardTopRow}>
                  <IconBadge name={tool.icon} tone={tool.tone} size={40} />
                </View>

                <View style={styles.cardMiddle}>
                  <Text style={styles.toolName}>{tool.name}</Text>
                  <Text style={styles.toolDesc} numberOfLines={2}>
                    {tool.desc}
                  </Text>
                </View>

                <View style={styles.cardBottom}>
                  <Text
                    style={[
                      styles.costText,
                      isComingSoon && styles.comingSoonCostText,
                    ]}
                  >
                    {tool.cost ?? '1 credit'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <PickIdeaModal
        visible={pickModalVisible}
        targetTool={activeTargetTool}
        onClose={() => setPickModalVisible(false)}
        onSelectIdea={handleSelectIdeaForTool}
        onLaunchValidate={() => navigation.navigate('ValidateModal')}
      />
    </ScreenContainer>
  );
};
