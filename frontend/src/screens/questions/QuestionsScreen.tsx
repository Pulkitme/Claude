import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../config/theme';

const QuestionsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Daily Questions - Coming Soon</Text>
      <Text style={styles.subtext}>Daily relationship questions and answers will be displayed here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  text: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  subtext: {
    ...typography.body2,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default QuestionsScreen;
