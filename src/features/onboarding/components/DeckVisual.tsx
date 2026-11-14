import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from '../../../components';
import { BARS } from '../constants/onboardingData';
import { styles } from '../screens/OnboardingScreen.styles';

export const DeckVisual: React.FC = () => {
  return (
    <View style={styles.deckContainer}>
      {/* Main Pitch Deck Card */}
      <View style={styles.deckCard}>
        <Text style={styles.deckSlideMeta}>SLIDE 4 · MARKET</Text>
        <Text style={styles.deckCardTitle}>A fast-growing opportunity</Text>

        <View style={styles.chartRow}>
          <View style={styles.barsGroup}>
            {BARS.map((height, i) => (
              <View
                key={i}
                style={[
                  styles.chartBar,
                  {
                    height,
                    backgroundColor:
                      i >= 4 ? '#A855F7' : i >= 2 ? '#8B5CF6' : '#6D28D9',
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.tamBox}>
            <Text style={styles.tamValue}>$48B</Text>
            <Text style={styles.tamLabel}>TAM</Text>
          </View>
        </View>
      </View>

      {/* Floating Idea Score Badge */}
      <View style={styles.ideaScoreBadge}>
        <Icon name="award" size={16} color="#34D399" />
        <View style={styles.scoreTextCol}>
          <Text style={styles.scoreLabel}>Idea score</Text>
          <Text style={styles.scoreValue}>86 / 100</Text>
        </View>
      </View>

      {/* Floating AI Generation Badge */}
      <View style={styles.generationBadge}>
        <Icon name="sparkles" size={13} color="#A78BFA" />
        <Text style={styles.generationText}>Generated in 12s</Text>
      </View>
    </View>
  );
};

export const ChatVisual: React.FC = () => {
  return (
    <View style={styles.chatContainer}>
      {/* Investor Question */}
      <View style={styles.chatRow}>
        <View style={styles.investorAvatar}>
          <Icon name="messageSquare" size={14} color="#A78BFA" />
        </View>
        <View style={styles.questionBubble}>
          <Text style={styles.questionMeta}>INVESTOR QUESTION</Text>
          <Text style={styles.questionText}>
            What stops a bigger player from copying you?
          </Text>
        </View>
      </View>

      {/* Founder Quantified Answer */}
      <View style={styles.answerBubble}>
        <Text style={styles.answerText}>
          Our proprietary conversation data compounds with every user — 3.4M
          sessions so far.
        </Text>
      </View>

      {/* Scored Feedback Card */}
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackLeft}>
          <Icon name="trendingUp" size={15} color="#34D399" />
          <Text style={styles.feedbackLabel}>Great, quantified answer</Text>
        </View>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <Icon
              key={starIndex}
              name="star"
              size={12}
              color={starIndex <= 4 ? '#FBBF24' : '#4B5563'}
              style={styles.starIcon}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
