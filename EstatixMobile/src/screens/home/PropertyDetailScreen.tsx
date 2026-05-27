import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getProperty } from '../../api/property';
import AnimatedHeart from '../../components/AnimatedHeart';
import { useFavoriteStore } from '../../store/favoriteStore';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorView from '../../components/ErrorView';

const { width, height } = Dimensions.get('window');

export default function PropertyDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const {
    data: property,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id).then((res) => res.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView message="Failed to load property" onRetry={refetch} />;

  const images = property?.images?.length
    ? property.images
    : [{ url: 'https://via.placeholder.com/800x600?text=No+Image' }];

  const handleShare = async () => {
    await Share.share({
      message: `Check out this property: ${property.title} - $${property.price.toLocaleString()}\n${property.address}, ${property.city}`,
    });
  };

  const renderImageItem = ({ item }: { item: { url: string } }) => (
    <Image source={{ uri: item.url }} style={styles.carouselImage} resizeMode="cover" />
  );

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setActiveImageIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(_, idx) => idx.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          />
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {images.map((_:unknown, idx:number) => (
              <View
                key={idx}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: idx === activeImageIndex ? colors.primary : colors.muted,
                    width: idx === activeImageIndex ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content below carousel */}
        <View style={styles.content}>
          {/* Title & Heart */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{property.title}</Text>
            <AnimatedHeart
              isLiked={isFavorite(property.id)}
              onPress={() => toggleFavorite(property.id)}
              // size={28}
            />
          </View>

          {/* Address */}
          <Text style={[styles.address, { color: colors.muted }]}>
            <Ionicons name="location-outline" size={16} color={colors.muted} /> {property.address}, {property.city}
          </Text>

          {/* Price */}
          <Text style={[styles.price, { color: colors.primary }]}>
            ${property.price.toLocaleString()}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text }]}>{property.description}</Text>

          {/* Specs Row */}
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={22} color={colors.primary} />
              <Text style={[styles.specValue, { color: colors.text }]}>{property.bedrooms}</Text>
              <Text style={[styles.specLabel, { color: colors.muted }]}>Bedrooms</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={22} color={colors.primary} />
              <Text style={[styles.specValue, { color: colors.text }]}>{property.bathrooms}</Text>
              <Text style={[styles.specLabel, { color: colors.muted }]}>Bathrooms</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="resize-outline" size={22} color={colors.primary} />
              <Text style={[styles.specValue, { color: colors.text }]}>{property.area}</Text>
              <Text style={[styles.specLabel, { color: colors.muted }]}>sq ft</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.requestButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Booking', { propertyId: id })}
          >
            <Text style={styles.requestButtonText}>Request Visit</Text>
            <Ionicons name="calendar-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactButton, { borderColor: colors.primary }]}
            onPress={() =>
              navigation.navigate('ChatRoom', {
                propertyId: id,
                otherUserId: property.ownerId,
                otherUserName: property.owner?.name || 'Owner',
              })
            }
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={[styles.contactButtonText, { color: colors.primary }]}>Contact Owner</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={colors.muted} />
              <Text style={[styles.shareButtonText, { color: colors.muted }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={() => setReportModalVisible(true)}
            >
              <Ionicons name="warning-outline" size={20} color={colors.error} />
              <Text style={[styles.shareButtonText, { color: colors.error }]}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Report Modal */}
      {isReportModalVisible && (
        <View style={StyleSheet.absoluteFill}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: colors.cardBg, padding: 20, borderRadius: 12, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: colors.text }}>Report Property</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: colors.border, padding: 10, borderRadius: 8, color: colors.text, marginBottom: 15 }}
                placeholder="Why are you reporting this?"
                placeholderTextColor={colors.muted}
                value={reportReason}
                onChangeText={setReportReason}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                <TouchableOpacity onPress={() => setReportModalVisible(false)} style={{ padding: 10 }}>
                  <Text style={{ color: colors.muted }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    if (!reportReason) return;
                    import('../../api/property').then(({ createReport }) => {
                      createReport(property.id, property.ownerId, reportReason)
                        .then(() => {
                           import('react-native').then(({ Alert }) => Alert.alert('Success', 'Property reported.'));
                           setReportModalVisible(false);
                           setReportReason('');
                        })
                        .catch(() => {
                           import('react-native').then(({ Alert }) => Alert.alert('Error', 'Failed to report.'));
                           setReportModalVisible(false);
                        });
                    });
                  }} 
                  style={{ padding: 10, backgroundColor: colors.error, borderRadius: 8 }}
                >
                  <Text style={{ color: '#fff' }}>Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: height * 0.5,
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  address: {
    fontSize: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  specLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 12,
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    marginBottom: 12,
  },
  contactButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  shareButtonText: {
    fontSize: 14,
  },
});