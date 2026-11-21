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

      case 'info':
        Alert.alert(
          tool.name,
          'In-depth market research, TAM · SAM · SOM, and persona analysis are being prepared for an upcoming release. Validate your idea or generate your Lean Canvas and Pitch Deck today!',
          [{ text: 'OK' }]
        );
        break;

      case 'premium-info':
        Alert.alert(
          'PitchMint Premium',
          'PitchMint Premium unlocks the curated Investor Directory, AI Matchmaking, and full exports.\n\nIn-app subscriptions will be available via Google Play Billing in an upcoming release.',
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
          {TOOL_DEFINITIONS.map((tool) => (
            <Pressable
              key={tool.id}
              testID={`toolkit-card-${tool.id}`}
              onPress={() => handleToolPress(tool)}
              style={({ pressed }) => [
                styles.toolCard,
                pressed && styles.toolCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${tool.name}: ${tool.desc}`}
            >
              {tool.badge && (
                <View style={styles.premiumPill}>
                  <Text style={styles.premiumPillText}>{tool.badge}</Text>
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
                <Text style={styles.costText}>{tool.cost ?? 'Included'}</Text>
              </View>
            </Pressable>
          ))}
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
