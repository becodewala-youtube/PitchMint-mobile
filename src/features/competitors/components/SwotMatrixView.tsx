import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../../../components';
import { colors } from '../../../theme';
import { CompetitorItem } from '../../../services/api/ideasApi';
import { styles } from '../screens/CompetitorScreen.styles';

export interface SwotMatrixViewProps {
  competitors: CompetitorItem[];
}

interface SwotSectionConfig {
  key: 'S' | 'W' | 'O' | 'T';
  title: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  items: string[];
}

export const SwotMatrixView: React.FC<SwotMatrixViewProps> = ({ competitors }) => {
  // Aggregate items across competitors
  const strengthsSet = new Set<string>();
  const weaknessesSet = new Set<string>();
  const opportunitiesSet = new Set<string>();
  const threatsSet = new Set<string>();

  competitors.forEach((c) => {
    c.swot?.strengths?.forEach((s) => s?.trim() && strengthsSet.add(s.trim()));
    c.swot?.weaknesses?.forEach((w) => w?.trim() && weaknessesSet.add(w.trim()));
    c.swot?.opportunities?.forEach((o) => o?.trim() && opportunitiesSet.add(o.trim()));
    c.swot?.threats?.forEach((t) => t?.trim() && threatsSet.add(t.trim()));
  });

  // Fallbacks if backend only populated per-competitor strengths/weaknesses
  const strengths = Array.from(strengthsSet);
  const weaknesses = Array.from(weaknessesSet);
  const opportunities =
    opportunitiesSet.size > 0
      ? Array.from(opportunitiesSet)
      : ['Underserved niche customer segments', 'AI lowers cost of personalisation', 'Partnership-led distribution'];
  const threats =
    threatsSet.size > 0
      ? Array.from(threatsSet)
      : ['Incumbents copying features', 'Rising customer acquisition costs', 'Regulatory shifts in local markets'];

  const sections: SwotSectionConfig[] = [
    {
      key: 'S',
      title: 'Strengths',
      color: '#34D399', // Emerald
      borderColor: 'rgba(16, 185, 129, 0.3)',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      items: strengths.length > 0 ? strengths : ['Focused value proposition', 'Fast iteration speed', 'Fresh angle on the problem'],
    },
    {
      key: 'W',
      title: 'Weaknesses',
      color: '#F87171', // Red
      borderColor: 'rgba(239, 68, 68, 0.3)',
      badgeBg: 'rgba(239, 68, 68, 0.12)',
      items: weaknesses.length > 0 ? weaknesses : ['No brand awareness yet', 'Limited capital vs incumbents', 'Unproven retention data'],
    },
    {
      key: 'O',
      title: 'Opportunities',
      color: '#22D3EE', // Cyan
      borderColor: 'rgba(6, 182, 212, 0.3)',
      badgeBg: 'rgba(6, 182, 212, 0.12)',
      items: opportunities,
    },
    {
      key: 'T',
      title: 'Threats',
      color: '#FBBF24', // Amber
      borderColor: 'rgba(245, 158, 11, 0.3)',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      items: threats,
    },
  ];

  return (
    <View testID="swot-matrix-view">
      {sections.map((section) => (
        <Card
          key={section.key}
          style={[styles.swotCard, { borderColor: section.borderColor }]}
          testID={`swot-card-${section.key.toLowerCase()}`}
        >
          <View style={styles.swotHeader}>
            <View
              style={[
                styles.swotLetterBadge,
                { backgroundColor: section.badgeBg, borderColor: section.borderColor },
              ]}
            >
              <Text style={[styles.swotLetterText, { color: section.color }]}>
                {section.key}
              </Text>
            </View>
            <Text style={[styles.swotTitle, { color: section.color }]}>
              {section.title}
            </Text>
          </View>

          <View style={styles.swotItemList}>
            {section.items.map((item, idx) => (
              <View key={idx} style={styles.swotItemRow}>
                <Text style={[styles.swotItemBullet, { color: section.color }]}>•</Text>
                <Text style={styles.swotItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>
      ))}
    </View>
  );
};
