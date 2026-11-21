import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
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
import { ToolStartingChoiceModal } from '../components/ToolStartingChoiceModal';
import { styles } from './ToolkitScreen.styles';

export const ToolkitScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [choiceModalVisible, setChoiceModalVisible] = useState<boolean>(false);
  const [pickModalVisible, setPickModalVisible] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [activeTargetTool, setActiveTargetTool] = useState<PickIdeaTarget | null>(null);

  const handleToolPress = (tool: ToolDefinition) => {
    switch (tool.actionKind) {
      case 'validate':
        navigation.navigate('ValidateModal');
        break;

      case 'directory':
        navigation.navigate('InvestorDirectory');
        break;

      case 'dual-choice':
        setActiveTool(tool);
        setActiveTargetTool(tool.targetTool || null);
        setChoiceModalVisible(true);
        break;
    }
  };

  const handleSelectStandalone = () => {
    setChoiceModalVisible(false);
    if (!activeTargetTool) return;

    switch (activeTargetTool) {
      case 'deck':
      case 'canvas':
        navigation.navigate('ValidateModal');
        break;

      case 'competitors':
        navigation.navigate('Competitor', {});
        break;

      case 'simulator':
        navigation.navigate('PitchSimulator', {});
        break;

      case 'market':
        navigation.navigate('MarketResearch', {});
        break;

      case 'matchmaking':
        navigation.navigate('InvestorMatchmaking', {});
        break;
    }
  };

  const handleSelectImportIdea = () => {
    setChoiceModalVisible(false);
    setPickModalVisible(true);
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

      case 'market':
        navigation.navigate('MarketResearch', {
          ideaId: idea.id,
          ideaTitle: idea.title,
        });
        break;

      case 'matchmaking':
        navigation.navigate('InvestorMatchmaking', {
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
            return (
              <Pressable
                key={tool.id}
                testID={`toolkit-card-${tool.id}`}
                onPress={() => handleToolPress(tool)}
                style={({ pressed }) => [
                  styles.toolCard,
                  pressed && styles.toolCardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${tool.name}${tool.badge ? ` (${tool.badge})` : ''}: ${tool.desc}`}
              >
                {tool.badge && (
                  <View style={styles.premiumPill}>
                    <Text style={styles.premiumPillText}>
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
                  <Text style={styles.costText}>
                    {tool.cost ?? '1 credit'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <ToolStartingChoiceModal
        visible={choiceModalVisible}
        tool={activeTool}
        onClose={() => setChoiceModalVisible(false)}
        onSelectStandalone={handleSelectStandalone}
        onSelectImportIdea={handleSelectImportIdea}
      />

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
