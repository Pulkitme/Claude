/**
 * Shared Hub Screen (Complete Reference Feature)
 * Displays shared timeline with posts (text, photos, videos, voice)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { postsApi } from '../../services/api';
import { colors, typography, spacing, shadows } from '../../config/theme';
import type { SharedPost, CreatePostData } from '../../types';

const HubScreen: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SharedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load posts
  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsApi.getPosts(1, 50);
      setPosts(response.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.isPaired) {
      loadPosts();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  // Create new text post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    try {
      setSubmitting(true);
      const postData: CreatePostData = {
        postType: 'text',
        content: newPostContent.trim(),
      };

      await postsApi.createPost(postData);
      setNewPostContent('');
      setModalVisible(false);
      loadPosts(); // Reload posts
      Alert.alert('Success', 'Post created!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle reaction on post
  const handleReaction = async (postId: string, hasReacted: boolean) => {
    try {
      if (hasReacted) {
        await postsApi.removeReaction(postId);
      } else {
        await postsApi.addReaction(postId, 'like');
      }
      loadPosts(); // Reload to update reactions
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // Delete post
  const handleDeletePost = (postId: string, authorId: string) => {
    if (authorId !== user?.id) {
      Alert.alert('Error', 'You can only delete your own posts');
      return;
    }

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postsApi.deletePost(postId);
              loadPosts();
              Alert.alert('Success', 'Post deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  // Render a single post
  const renderPost = ({ item }: { item: SharedPost }) => {
    const hasReacted = item.reactions.some((r) => r.userId === user?.id);
    const isOwnPost = item.authorId === user?.id;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            {item.author.profilePhotoUrl ? (
              <Image
                source={{ uri: item.author.profilePhotoUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
            )}
            <View>
              <Text style={styles.authorName}>
                {item.author.displayName || 'Unknown'}
              </Text>
              <Text style={styles.postDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          {isOwnPost && (
            <TouchableOpacity
              onPress={() => handleDeletePost(item.id, item.authorId)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        {item.postType === 'text' && item.content && (
          <Text style={styles.postContent}>{item.content}</Text>
        )}

        {item.postType === 'photo' && item.mediaUrl && (
          <Image
            source={{ uri: item.mediaUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.postFooter}>
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => handleReaction(item.id, hasReacted)}
          >
            <Ionicons
              name={hasReacted ? 'heart' : 'heart-outline'}
              size={24}
              color={hasReacted ? colors.love : colors.textSecondary}
            />
            <Text style={styles.reactionCount}>{item.reactions.length}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Show pairing message if not paired
  if (!user?.isPaired) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color={colors.primary} />
        <Text style={styles.emptyTitle}>Pair with Your Partner</Text>
        <Text style={styles.emptyText}>
          You need to pair with your partner to access the shared hub
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with add button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Hub</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Posts list */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first post to start your shared timeline!
            </Text>
          </View>
        }
      />

      {/* Create Post Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind?"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleCreatePost}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    ...typography.body1,
    fontWeight: '600',
  },
  postDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  postContent: {
    ...typography.body1,
    marginBottom: spacing.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionCount: {
    ...typography.body2,
    marginLeft: spacing.xs,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    ...typography.body2,
    color: colors.textLight,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 120,
    marginBottom: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HubScreen;
