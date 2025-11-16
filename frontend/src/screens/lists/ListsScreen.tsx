import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../config/theme';

const ListsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Lists Feature - Coming Soon</Text>
      <Text style={styles.subtext}>Shared lists (To-Do, Shopping, Bucket List) will be displayed here</Text>
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

export default ListsScreen;
