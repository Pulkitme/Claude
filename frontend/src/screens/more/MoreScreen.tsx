import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, spacing } from '../../config/theme';

const MoreScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Display Name</Text>
          <Text style={styles.value}>{user?.displayName || 'Not set'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Paired Status</Text>
          <Text style={[styles.value, { color: user?.isPaired ? colors.success : colors.warning }]}>
            {user?.isPaired ? 'Paired' : 'Not Paired'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.actionButtonText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>OURS App v1.0.0</Text>
        <Text style={styles.footerText}>Your relationship, beautifully organized</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body1,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  actionButtonText: {
    ...typography.body1,
    marginLeft: spacing.md,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textLight,
  },
});

export default MoreScreen;
