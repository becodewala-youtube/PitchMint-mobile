import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Icon } from '../../../components/Icon';
import { STACK_CARDS } from '../constants/onboardingData';
import { styles } from '../screens/OnboardingScreen.styles';

export const StackVisual: React.FC = () => {
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const timer = setInterval(() => {
      setOrder((current) => [...current.slice(1), current[0]]);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.stackContainer}>
      {STACK_CARDS.map((card, idx) => {
        const n = order.indexOf(idx);
        return (
          <View
            key={card.title}
            style={[
              styles.stackCard,
              {
                transform: [
                  { translateY: n * -16 },
                  { scale: Math.max(0.75, 1 - n * 0.05) },
                ],
                opacity: Math.max(0.2, 1 - n * 0.22),
                zIndex: 10 - n,
              },
            ]}
          >
            <View style={styles.stackCardHeader}>
              <View
                style={[
                  styles.stackCardIconBox,
                  {
                    backgroundColor: card.iconBg,
                    borderColor: card.iconBorder,
                  },
                ]}
              >
                <Icon name={card.icon} size={12} color={card.iconColor} />
              </View>
              <Text style={styles.stackCardFilterText}>
                FILTER BY: {card.title}
              </Text>
            </View>

            <View style={styles.stackChipsRow}>
              {card.items.map((it) => (
                <View key={it.label} style={styles.stackChip}>
                  <View
                    style={[
                      styles.chipLetterBadge,
                      { backgroundColor: it.badgeBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipLetterText,
                        { color: it.badgeText },
                      ]}
                    >
                      {it.l}
                    </Text>
                  </View>
                  <Text style={styles.chipLabel}>{it.label}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};
