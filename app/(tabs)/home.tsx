import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useUser } from '@clerk/clerk-expo';
import { usePosts } from '@/contexts/posts';
import { CreatePostModal } from '@/components/CreatePostModal';
import { NotificationModal } from '@/components/NotificationModal';
import { MessagesModal } from '@/components/MessagesModal';
import { StoryModal } from '@/components/StoryModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_SIZE = 70;

interface RecommendedUser {
  id: string;
  username: string;
  imageUrl: string;
  description: string;
}

export default function Home() {
  const { user } = useUser();
  const { posts, addPost } = usePosts();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);

  // Dummy data for stories
  const stories = [
    { id: 'add', type: 'add' },
    { id: '1', username: 'user1', imageUrl: 'https://picsum.photos/200' },
    { id: '2', username: 'user2', imageUrl: 'https://picsum.photos/201' },
    // Add more stories...
  ];

  const recommendedUsers: RecommendedUser[] = [
    {
      id: '1',
      username: 'john_doe',
      imageUrl: 'https://picsum.photos/200',
      description: 'Product Designer'
    },
    {
      id: '2',
      username: 'jane_smith',
      imageUrl: 'https://picsum.photos/201',
      description: 'Photographer'
    },
    // Add more recommended users...
  ];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch new posts here
      await fetchLatestPosts();
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Combine existing posts with any new ones
    setFeedPosts(prevPosts => {
      const allPosts = [...posts];
      // Sort by date, newest first
      allPosts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return allPosts;
    });
  }, [posts]);

  const fetchLatestPosts = async () => {
    // For now, just return the existing posts
    // In a real app, this would fetch new posts from an API
    return posts;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diff = now.getTime() - posted.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>AppName</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowMessages(true)}
          >
            <Ionicons name="paper-plane-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowCreatePost(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            titleColor="#fff"
          />
        }
      >
        {/* Stories Section */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.storiesContainer}
        >
          {/* Add Story Button */}
          <TouchableOpacity 
            style={styles.storyItem} 
            onPress={() => {
              setIsCreatingStory(true);
              setShowStoryModal(true);
            }}
          >
            <View style={styles.addStoryButton}>
              <LinearGradient
                colors={['#4CAF50', '#2196F3']}
                style={styles.storyRing}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.storyImageContainer}>
                  <Image 
                    source={{ uri: user?.imageUrl }}
                    style={styles.storyImage}
                  />
                  <LinearGradient
                    colors={['#2196F3', '#4CAF50']}
                    style={styles.addIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons 
                      name="add" 
                      size={20} 
                      color="#fff" 
                      style={{ 
                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2
                      }} 
                    />
                  </LinearGradient>
                </View>
              </LinearGradient>
              <Text style={styles.storyUsername}>Your Story</Text>
            </View>
          </TouchableOpacity>

          {/* Other Stories */}
          {stories.map(story => {
            if (story.type === 'add') return null;
            return (
              <TouchableOpacity key={story.id} style={styles.storyItem}>
                <LinearGradient
                  colors={['#E91E63', '#2196F3']}
                  style={styles.storyRing}
                >
                  <View style={styles.storyImageContainer}>
                    <Image 
                      source={{ uri: story.imageUrl }}
                      style={styles.storyImage}
                    />
                  </View>
                </LinearGradient>
                <Text style={styles.storyUsername}>{story.username}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Feed Section */}
        <View style={styles.feedSection}>
          {feedPosts.length === 0 ? (
            <View style={styles.emptyFeed}>
              <Ionicons name="images-outline" size={48} color="#666" />
              <Text style={styles.emptyFeedText}>No posts yet</Text>
              <Text style={styles.emptyFeedSubtext}>
                Follow people or create your first post
              </Text>
            </View>
          ) : (
            feedPosts.map((post) => (
              <View key={post.id} style={styles.feedPost}>
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <View style={styles.postUserInfo}>
                    <Image 
                      source={{ uri: post.userImage }} 
                      style={styles.postUserImage} 
                    />
                    <View style={styles.userMeta}>
                      <Text style={styles.postUsername}>{post.username}</Text>
                      <Text style={styles.postTime}>{getTimeAgo(post.createdAt)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Post Caption */}
                <View style={styles.captionContainer}>
                  <Text style={styles.postDescription}>
                    {post.description}
                  </Text>
                </View>

                {/* Post Image */}
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: post.imageUri }}
                    style={styles.postImage}
                    resizeMode="cover"
                    resizeMethod="scale"
                  />
                </View>

                {/* Post Actions */}
                <View style={styles.postActions}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons 
                        name={post.isLiked ? "heart" : "heart-outline"} 
                        size={28} 
                        color={post.isLiked ? "#FF3B30" : "#fff"} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="chatbubble-outline" size={26} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-social-outline" size={26} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Recommended Section */}
          <View style={styles.recommendedSection}>
            <Text style={styles.recommendedTitle}>RECOMMENDED FOR YOU</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.recommendedList}
            >
              {recommendedUsers.map((user) => (
                <View key={user.id} style={styles.recommendedUser}>
                  <Image 
                    source={{ uri: user.imageUrl }} 
                    style={styles.recommendedUserImage} 
                  />
                  <Text style={styles.recommendedUsername}>{user.username}</Text>
                  <Text style={styles.recommendedDescription}>{user.description}</Text>
                  <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followButtonText}>FOLLOW</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <CreatePostModal 
        isVisible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
      <NotificationModal
        isVisible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <MessagesModal
        isVisible={showMessages}
        onClose={() => setShowMessages(false)}
      />
      <StoryModal
        isVisible={showStoryModal}
        onClose={() => {
          setShowStoryModal(false);
          setSelectedStory(null);
          setIsCreatingStory(false);
        }}
        storyImage={selectedStory}
        isCreating={isCreatingStory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    marginTop: Platform.OS === 'android' ? 35 : 0,
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
  },
  storiesContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  storyRing: {
    width: STORY_SIZE + 4,
    height: STORY_SIZE + 4,
    borderRadius: (STORY_SIZE + 4) / 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  storyImageContainer: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#000',
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  addIconContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#000',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storyUsername: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  feedSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  feedPost: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#222',
    borderRadius: 16,
    margin: 8,
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postUserImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  userMeta: {
    flex: 1,
  },
  postUsername: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  postTime: {
    color: '#666',
    fontSize: 12,
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  postDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  postImage: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
  },
  postActions: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#222',
    marginTop: 8,
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
  },
  actionButton: {
    padding: 4,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedSection: {
    padding: 16,
    backgroundColor: '#111',
    marginTop: 16,
  },
  recommendedTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  recommendedList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  recommendedUser: {
    width: 150,
    marginRight: 16,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  recommendedUserImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  recommendedUsername: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendedDescription: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  followButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyFeed: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyFeedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyFeedSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  moreButton: {
    padding: 4,
  },
}); 