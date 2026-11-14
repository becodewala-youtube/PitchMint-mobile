import React from 'react';
import { View, Text } from 'react-native';
import { Card, Badge, Button, Icon, IconBadge } from '../../../components';
import { colors } from '../../../theme';
import { DEMO_PLANS } from '../constants/profileConstants';
import { styles } from '../screens/ProfileScreen.styles';

export interface DemoCreditTopUpProps {
  topUpStatus: { type: 'success' | 'error'; message: string } | null;
  isPurchasing: boolean;
  activePlanId: string | null;
  onTopUpPlan: (planId: string, planName: string, credits: number) => void;
}

export const DemoCreditTopUp: React.FC<DemoCreditTopUpProps> = ({
  topUpStatus,
  isPurchasing,
  activePlanId,
  onTopUpPlan,
}) => {
  return (
    <View style={styles.demoTopUpSection}>
      <View style={styles.demoCategoryHeader}>
        <Text style={styles.sectionCategory}>DEV / DEMO CREDIT TOP-UP</Text>
        <Badge label="DEV ONLY" variant="amber" />
      </View>

      <Card style={styles.demoCard}>
        <View style={styles.demoCardHeader}>
          <IconBadge name="zap" tone="amber" size={38} />
          <View style={styles.demoCardHeaderTextCol}>
            <Text style={styles.demoCardTitle}>Development Credit Top-Up</Text>
            <Text style={styles.demoCardSubtitle}>
              Simulate purchasing credit packs against the development backend without real payments.
            </Text>
          </View>
        </View>

        {/* Status Feedback Banner */}
        {topUpStatus && (
          <View
            testID="demo-topup-status-banner"
            style={[
              styles.statusBanner,
              topUpStatus.type === 'success' ? styles.statusSuccess : styles.statusError,
            ]}
          >
            <Icon
              name={topUpStatus.type === 'success' ? 'check' : 'alertCircle'}
              size={16}
              color={
                topUpStatus.type === 'success'
                  ? colors.tones.emerald.text
                  : colors.tones.red.text
              }
            />
            <Text
              style={[
                styles.statusBannerText,
                {
                  color:
                    topUpStatus.type === 'success'
                      ? colors.tones.emerald.text
                      : colors.tones.red.text,
                },
              ]}
            >
              {topUpStatus.message}
            </Text>
          </View>
        )}

        {/* Plan Options */}
        <View style={styles.plansContainer}>
          {DEMO_PLANS.map((plan, index) => {
            const isCurrentLoading = isPurchasing && activePlanId === plan.id;
            return (
              <View key={plan.id}>
                {index > 0 && <View style={styles.demoDivider} />}
                <View style={styles.planRow}>
                  <View style={styles.planInfoCol}>
                    <View style={styles.planTitleRow}>
                      <Text style={styles.planNameText}>{plan.name}</Text>
                      <Badge label={`+${plan.credits}`} variant="emerald" />
                    </View>
                    <Text style={styles.planDescText}>
                      {plan.description} · ₹{plan.price} (Simulated)
                    </Text>
                  </View>

                  <Button
                    testID={`demo-topup-${plan.id}`}
                    title={isCurrentLoading ? 'Adding...' : `+${plan.credits}`}
                    variant="primary"
                    size="sm"
                    loading={isCurrentLoading}
                    disabled={isPurchasing}
                    onPress={() => onTopUpPlan(plan.id, plan.name, plan.credits)}
                    style={styles.planAddButton}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.demoSecurityDisclaimer}>
          Backend enforces environment validation. Simulated payments are strictly prohibited in production.
        </Text>
      </Card>
    </View>
  );
};
