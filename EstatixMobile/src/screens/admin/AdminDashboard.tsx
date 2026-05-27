import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingProperties, approveProperty, rejectProperty } from '../../api/admin';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helpers
const isTablet = SCREEN_WIDTH >= 768;
const cardWidth = isTablet ? Math.min(SCREEN_WIDTH * 0.7, 600) : SCREEN_WIDTH - 32;
const imageHeight = isTablet ? 260 : 200;

// Animated card component with entrance effect
const AnimatedCard = ({
  item,
  colors,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  index,
}: any) => {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Staggered animation based on index
    const delay = Math.min(index * 80, 600);
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 450,
        delay,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const imageUrl = item.images?.[0]?.url;
  const ownerName = item.owner?.name || 'Unknown';
  const ownerEmail = item.owner?.email || '';

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        },
      ]}
    >
      {/* Property Images */}
      {item.images?.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={[styles.imageScroller, { height: imageHeight }]}
        >
          {item.images.map((img: any, idx: number) => (
            <Image
              key={img.id || idx}
              source={{ uri: img.url }}
              style={[styles.propertyImage, { width: cardWidth, height: imageHeight }]}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.noImageBox, { backgroundColor: colors.border, height: imageHeight }]}>
          <Ionicons name="image-outline" size={50} color={colors.muted} />
          <Text style={{ color: colors.muted, marginTop: 8 }}>No Images</Text>
        </View>
      )}

      {/* Image count badge with animation */}
      {item.images?.length > 0 && (
        <View style={styles.imageBadge}>
          <Ionicons name="images" size={12} color="#fff" />
          <Text style={styles.imageBadgeText}>{item.images.length} photos</Text>
        </View>
      )}

      {/* Property Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
          </View>
        </View>

        <Text style={[styles.price, { color: colors.primary }]}>
          ₹{item.price?.toLocaleString()}
          {item.type === 'RENT' ? <Text style={styles.priceUnit}> /month</Text> : null}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={[styles.metaText, { color: colors.muted }]} numberOfLines={1}>
              {[item.address, item.city, item.state].filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          {item.bedrooms != null && (
            <View style={styles.metaItem}>
              <Ionicons name="bed-outline" size={14} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>{item.bedrooms} Beds</Text>
            </View>
          )}
          {item.bathrooms != null && (
            <View style={styles.metaItem}>
              <Ionicons name="water-outline" size={14} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>{item.bathrooms} Baths</Text>
            </View>
          )}
          {item.area > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="resize-outline" size={14} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>{item.area} sqft</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="home-outline" size={14} color={colors.muted} />
            <Text style={[styles.metaText, { color: colors.muted }]}>{item.type}</Text>
          </View>
        </View>

        {/* Description with gradient fade if needed */}
        {item.description ? (
          <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Owner Info with modern design */}
        <View style={[styles.ownerRow, { borderTopColor: colors.border + '40' }]}>
          <Image
            source={{ uri: item.owner?.avatar || `https://ui-avatars.com/api/?name=${ownerName}&background=random` }}
            style={styles.ownerAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.ownerName, { color: colors.text }]}>{ownerName}</Text>
            <Text style={[styles.ownerEmail, { color: colors.muted }]}>{ownerEmail}</Text>
          </View>
          <Ionicons name="mail-outline" size={16} color={colors.muted} />
        </View>

        {/* Action Buttons with gradient and press animation */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => onApprove(item.id, item.title)}
            disabled={isApproving}
          >
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>
                {isApproving ? 'Approving...' : 'Approve'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => onReject(item.id, item.title)}
            disabled={isRejecting}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default function AdminDashboard({ navigation }: any) {
  const { colors } = useTheme();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animation for the whole dashboard
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['pendingProperties'],
    queryFn: () => getPendingProperties().then(res => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: approveProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProperties'] });
      Alert.alert('✅ Approved', 'Property has been approved and is now live.');
    },
    onError: (err: any) => Alert.alert('Error', err.response?.data?.error || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProperties'] });
      Alert.alert('❌ Rejected', 'Property has been rejected.');
    },
    onError: (err: any) => Alert.alert('Error', err.response?.data?.error || 'Failed to reject'),
  });

  const handleApprove = (id: string, title: string) => {
    Alert.alert('Approve Property', `Are you sure you want to approve "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => approveMutation.mutate(id) },
    ]);
  };

  const handleReject = (id: string, title: string) => {
    Alert.alert('Reject Property', `Are you sure you want to reject "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => rejectMutation.mutate(id) },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerGreeting}>Welcome back,</Text>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Reports')}
                style={styles.iconBtn}
              >
                <Ionicons name="flag-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
                <Ionicons name="log-out-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color="#fff" />
              <Text style={styles.statNumber}>{properties?.length || 0}</Text>
              <Text style={styles.statLabel}>Pending Approvals</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={24} color="#fff" />
              <Text style={styles.statNumber}>{properties?.length || 0}</Text>
              <Text style={styles.statLabel}>Active Properties</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Property List with Staggered Animation */}
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AnimatedCard
              item={item}
              colors={colors}
              onApprove={handleApprove}
              onReject={handleReject}
              isApproving={approveMutation.isPending}
              isRejecting={rejectMutation.isPending}
              index={index}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Animated.View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={80} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.text }]}>All caught up! 🎉</Text>
              <Text style={[styles.emptySubtext, { color: colors.muted }]}>
                No pending properties to review
              </Text>
            </Animated.View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 130,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
    ...(isTablet && {
      alignSelf: 'center',
      width: '100%',
      maxWidth: 700,
    }),
  },
  card: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  imageScroller: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  propertyImage: {
    resizeMode: 'cover',
  },
  noImageBox: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    // backdropFilter: 'blur(4px)',
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.8,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    gap: 12,
  },
  ownerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  ownerEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  approveBtn: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  rejectBtn: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 15,
    marginTop: 8,
  },
});