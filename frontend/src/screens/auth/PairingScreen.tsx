/**
 * Pairing Screen
 * Generate or accept invite codes to pair with partner
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { pairingApi } from '../../services/api';
import { colors, typography, spacing } from '../../config/theme';

const PairingScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'generate' | 'accept'>('generate');

  useEffect(() => {
    // Check if user is already paired
    if (user?.isPaired) {
      // User is paired, they can use the app
      Alert.alert('Success', 'You are already paired with your partner!');
    }
  }, [user]);

  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      const response = await pairingApi.generateCode();
      if (response.data) {
        setGeneratedCode(response.data.inviteCode);
        Alert.alert(
          'Code Generated!',
          `Share this code with your partner: ${response.data.inviteCode}`
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCode = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      setLoading(true);
      await pairingApi.acceptCode(inviteCode.trim().toUpperCase());
      await refreshUser();
      Alert.alert('Success!', 'You are now paired with your partner!');
    } catch (error: any) {
      Alert.alert('Pairing Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pair with Your Partner</Text>
        <Text style={styles.subtitle}>
          Generate a code or enter your partner's code to connect
        </Text>

        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'generate' && styles.modeButtonActive]}
            onPress={() => setMode('generate')}
          >
            <Text style={[styles.modeButtonText, mode === 'generate' && styles.modeButtonTextActive]}>
              Generate Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'accept' && styles.modeButtonActive]}
            onPress={() => setMode('accept')}
          >
            <Text style={[styles.modeButtonText, mode === 'accept' && styles.modeButtonTextActive]}>
              Enter Code
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'generate' ? (
          <View style={styles.generateSection}>
            {generatedCode ? (
              <View style={styles.codeDisplay}>
                <Text style={styles.codeLabel}>Your Invite Code:</Text>
                <Text style={styles.code}>{generatedCode}</Text>
                <Text style={styles.codeHint}>Share this code with your partner</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleGenerateCode}>
                <Text style={styles.buttonText}>Generate Invite Code</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.acceptSection}>
            <TextInput
              style={styles.input}
              placeholder="Enter invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.button} onPress={handleAcceptCode}>
              <Text style={styles.buttonText}>Pair with Partner</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: colors.surface,
  },
  modeButtonText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  generateSection: {
    alignItems: 'center',
  },
  acceptSection: {
    width: '100%',
  },
  codeDisplay: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    width: '100%',
  },
  codeLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  code: {
    ...typography.h1,
    color: colors.primary,
    letterSpacing: 4,
  },
  codeHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PairingScreen;
