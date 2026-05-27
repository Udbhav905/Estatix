import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Dimensions,
  RefreshControl,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProperties } from "../../api/property";
import PropertyCard from "../../components/PropertyCard";
import MoodFilterBar from "../../components/MoodFilterBar";
import SearchBar from "../../components/SearchBar";
import SkeletonCard from "../../components/SkeletonCard";
import { useTheme } from "../../hooks/useTheme";
import { useMoodStore } from "../../store/moodStore";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// --- Carousel Data ---
const CAROUSEL_ITEMS = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    title: "Dream Homes",
    subtitle: "Discover your perfect sanctuary",
    cta: "Explore Now",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    title: "Luxury Living",
    subtitle: "Elegance redefined, just for you",
    cta: "View Listings",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1600585153490-76fb20a32601",
    title: "Urban Oasis",
    subtitle: "Where city meets comfort",
    cta: "Find Your Home",
  },
];

// --- Hero Carousel (unchanged) ---
const HeroCarousel = ({ onCtaPress }: { onCtaPress?: () => void }) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startAutoScroll = () => {
    intervalRef.current = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= CAROUSEL_ITEMS.length) nextIndex = 0;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000);
  };

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        startAutoScroll();
      }
    }
  };

  const renderItem = ({ item }: { item: (typeof CAROUSEL_ITEMS)[0] }) => (
    <View style={{ width, overflow: "hidden" }}>
      <Image source={{ uri: item.image }} style={styles.carouselImage} />
      <View style={styles.overlayGradient}>
        <View style={styles.textContainer}>
          <Text style={styles.carouselTitle}>{item.title}</Text>
          <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity style={styles.carouselButton} onPress={onCtaPress} activeOpacity={0.8}>
            <Text style={styles.carouselButtonText}>{item.cta}</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={CAROUSEL_ITEMS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.paginationContainer}>
        {CAROUSEL_ITEMS.map((_, idx) => (
          <View
            key={idx}
            style={[styles.paginationDot, idx === activeIndex && styles.paginationDotActive]}
          />
        ))}
      </View>
    </View>
  );
};

// --- Wrapper that ignores press if touch moved too much (swipe/scroll) ---
const TouchAwareCard = ({
  property,
  onPress,
  index,
}: {
  property: any;
  onPress: () => void;
  index: number;
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [shouldIgnorePress, setShouldIgnorePress] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        touchStartRef.current = { x: locationX, y: locationY };
        setShouldIgnorePress(false);
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // If the touch moves more than 5 pixels in any direction, consider it a swipe/scroll
        if (touchStartRef.current) {
          const dx = Math.abs(gestureState.dx);
          const dy = Math.abs(gestureState.dy);
          if (dx > 5 || dy > 5) {
            setShouldIgnorePress(true);
          }
        }
      },
      onPanResponderRelease: () => {
        if (!shouldIgnorePress && touchStartRef.current) {
          onPress();
        }
        touchStartRef.current = null;
        setShouldIgnorePress(false);
      },
      onPanResponderTerminate: () => {
        touchStartRef.current = null;
        setShouldIgnorePress(false);
      },
    })
  ).current;

  return (
    <View {...panResponder.panHandlers}>
      <PropertyCard property={property} index={index} onPress={() => {}} />
      {/* Note: The original onPress is ignored; we handle press via the wrapper */}
    </View>
  );
};

// --- Main HomeScreen with touch‑aware cards ---
export default function HomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { activeMood, getFilterParams } = useMoodStore();
  const [search, setSearch] = useState("");
  const filterParams = getFilterParams();
  
  const flatListRef = useRef<FlatList>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["properties", activeMood, search],
    queryFn: ({ pageParam = 1 }) =>
      getProperties({ page: pageParam, limit: 10, search, ...filterParams }).then(
        (res) => res.data
      ),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const properties = data?.pages.flatMap((p) => p.properties) || [];

  const handleCarouselCta = useCallback(() => {
    navigation.navigate("Search");
  }, [navigation]);

  const handlePropertyPress = useCallback(
    (propertyId: string) => {
      navigation.navigate("PropertyDetail", { id: propertyId });
    },
    [navigation]
  );
  
  const handleSearchFocus = useCallback(() => {
    // Scroll past the hero carousel (height * 0.5) so the search bar is at the top
    flatListRef.current?.scrollToOffset({ offset: height * 0.5, animated: true });
  }, []);

  const renderHeader = useCallback(() => (
    <>
      <HeroCarousel onCtaPress={handleCarouselCta} />
      <View style={styles.searchSection}>
        <SearchBar onSearch={setSearch} onFocus={handleSearchFocus} />
      </View>
      <MoodFilterBar />
    </>
  ), [handleCarouselCta, handleSearchFocus]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchAwareCard
            property={item}
            index={index}
            onPress={() => handlePropertyPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={isFetchingNextPage ? <SkeletonCard /> : null}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContainer: {
    height: height * 0.5,
    marginBottom: 8,
  },
  carouselImage: {
    width,
    height: height * 0.5,
    resizeMode: "cover",
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  textContainer: {
    marginBottom: 30,
  },
  carouselTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  carouselSubtitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    marginBottom: 20,
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  carouselButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.6)",
  },
  carouselButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: "#fff",
  },
  searchSection: {
    paddingHorizontal: 16,
    marginTop: -20,
    marginBottom: 8,
    zIndex: 10,
  },
  listContent: {
    paddingBottom: 30,
  },
});