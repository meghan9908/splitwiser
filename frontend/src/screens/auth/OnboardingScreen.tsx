import React, { useState, useEffect, useRef } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  View, 
  Dimensions, 
  Animated, 
  StatusBar,
  TouchableOpacity,
  Vibration 
} from 'react-native';
import { Button, Text, useTheme, Surface, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppDispatch } from '../../store/hooks';
import { useAuth } from '../../contexts/AuthContext';
import { completeOnboarding } from '../../store/slices/authSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Haptics } from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradient: string[];
  features: Array<{
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    text: string;
    highlight?: boolean;
  }>;
  stats?: {
    number: string;
    label: string;
  };
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Smart Expense',
    subtitle: 'Intelligence',
    description: 'AI-powered receipt scanning and automatic categorization. Never manually enter expenses again.',
    icon: 'scan-helper',
    gradient: ['#667eea', '#764ba2'],
    features: [
      { icon: 'camera-plus', text: 'AI Receipt Scanning', highlight: true },
      { icon: 'currency-usd', text: 'Multi-Currency Support' },
      { icon: 'cloud-sync', text: 'Real-time Cloud Sync' },
      { icon: 'chart-pie', text: 'Smart Categorization' }
    ],
    stats: { number: '99%', label: 'Accuracy Rate' }
  },
  {
    id: '2',
    title: 'Flexible',
    subtitle: 'Splitting Magic',
    description: 'Advanced algorithms for fair splitting. Equal, percentage, custom amounts, or consumption-based.',
    icon: 'math-compass',
    gradient: ['#f093fb', '#f5576c'],
    features: [
      { icon: 'equal', text: 'Equal Distribution' },
      { icon: 'percent', text: 'Percentage-based', highlight: true },
      { icon: 'calculator-variant', text: 'Custom Amounts' },
      { icon: 'food', text: 'Item-specific Splits' }
    ],
    stats: { number: '12+', label: 'Split Methods' }
  },
  {
    id: '3',
    title: 'Debt Settlement',
    subtitle: 'Optimization',
    description: 'Minimizes transactions using graph theory. Settle complex group debts with fewer payments.',
    icon: 'graph',
    gradient: ['#4facfe', '#00f2fe'],
    features: [
      { icon: 'timeline-check', text: 'Optimized Settlements', highlight: true },
      { icon: 'bank-transfer', text: 'Integrated Payments' },
      { icon: 'history', text: 'Transaction History' },
      { icon: 'shield-check', text: 'Secure Processing' }
    ],
    stats: { number: '87%', label: 'Fewer Transactions' }
  },
  {
    id: '4',
    title: 'Group',
    subtitle: 'Ecosystem',
    description: 'Create unlimited groups for any occasion. Invite friends, track spending, and build financial harmony.',
    icon: 'account-group-outline',
    gradient: ['#43e97b', '#38f9d7'],
    features: [
      { icon: 'account-multiple-plus', text: 'Unlimited Groups' },
      { icon: 'qrcode-scan', text: 'QR Code Invites', highlight: true },
      { icon: 'bell-ring', text: 'Smart Notifications' },
      { icon: 'chart-timeline-variant', text: 'Spending Analytics' }
    ],
    stats: { number: '∞', label: 'Groups Supported' }
  },
  {
    id: '5',
    title: 'Ready to',
    subtitle: 'Start Splitting?',
    description: 'Join thousands of users who have simplified their group expenses. Your financial harmony awaits!',
    icon: 'rocket-launch',
    gradient: ['#fa709a', '#fee140'],
    features: [
      { icon: 'star', text: '4.9★ App Store Rating', highlight: true },
      { icon: 'account-heart', text: '50K+ Happy Users' },
      { icon: 'lightning-bolt', text: 'Lightning Fast Setup' },
      { icon: 'security', text: 'Bank-level Security' }
    ],
    stats: { number: '2min', label: 'Setup Time' }
  }
];

const OnboardingScreen: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  const [backgroundAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  const currentSlide = onboardingSlides[currentSlideIndex];

  useEffect(() => {
    console.log('💰 Splitwiser Onboarding - Next Level Experience');
    animateSlideIn();
    animateProgress();
  }, [currentSlideIndex]);

  const animateSlideIn = () => {
    slideAnim.setValue(0);
    backgroundAnim.setValue(0);
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      })
    ]).start();
  };

  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: (currentSlideIndex + 1) / onboardingSlides.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderFeatureItem = (feature: OnboardingSlide['features'][0], index: number) => (
    <Animated.View 
      key={index}
      style={[
        styles.featureItem,
        {
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <Surface 
        style={[
          styles.featureIcon, 
          feature.highlight && styles.highlightFeature,
          { backgroundColor: feature.highlight ? currentSlide.gradient[0] : theme.colors.surfaceVariant }
        ]} 
        elevation={feature.highlight ? 3 : 1}
      >
        <MaterialCommunityIcons 
          name={feature.icon} 
          size={20} 
          color={feature.highlight ? 'white' : theme.colors.primary}
        />
      </Surface>
      <Text 
        variant="bodyMedium" 
        style={[
          styles.featureText, 
          { color: theme.colors.onSurface },
          feature.highlight && { fontWeight: '600', color: theme.colors.primary }
        ]}
      >
        {feature.text}
      </Text>
      {feature.highlight && (
        <View style={[styles.newBadge, { backgroundColor: currentSlide.gradient[1] }]}>
          <Text variant="labelSmall" style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderItem = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const isActive = index === currentSlideIndex;
    
    return (
      <LinearGradient
        colors={[`${item.gradient[0]}15`, `${item.gradient[1]}15`]}
        style={[styles.slide, { width: screenWidth }]}
      >
        <Animated.View 
          style={[
            styles.slideContent,
            {
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
                {
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Hero Icon with Floating Animation */}
          <Animated.View
            style={[
              styles.heroContainer,
              {
                transform: [
                  {
                    rotate: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['10deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={item.gradient}
              style={styles.iconGradient}
            >
              <MaterialCommunityIcons 
                name={item.icon} 
                size={100} 
                color="white"
              />
              
              {/* Floating particles effect */}
              <View style={styles.particlesContainer}>
                {[...Array(6)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.particle,
                      {
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        opacity: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.6],
                        }),
                        transform: [
                          {
                            scale: slideAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
            
            {/* Stats Badge */}
            {item.stats && (
              <Animated.View
                style={[
                  styles.statsBadge,
                  {
                    opacity: slideAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <BlurView intensity={80} style={styles.statsBlur}>
                  <Text variant="headlineSmall" style={[styles.statsNumber, { color: item.gradient[0] }]}>
                    {item.stats.number}
                  </Text>
                  <Text variant="labelSmall" style={styles.statsLabel}>
                    {item.stats.label}
                  </Text>
                </BlurView>
              </Animated.View>
            )}
          </Animated.View>

          {/* Enhanced Title Section */}
          <Animated.View 
            style={[
              styles.titleContainer,
              {
                opacity: slideAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text variant="displaySmall" style={[styles.title, { color: theme.colors.onSurface }]}>
              {item.title}
            </Text>
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subtitleGradient}
            >
              <Text variant="displaySmall" style={styles.subtitle}>
                {item.subtitle}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Enhanced Description */}
          <Animated.Text 
            variant="bodyLarge" 
            style={[
              styles.description, 
              { color: theme.colors.onSurface },
              {
                opacity: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
              },
            ]}
          >
            {item.description}
          </Animated.Text>

          {/* Enhanced Features Grid */}
          <View style={styles.featuresGrid}>
            {item.features.map((feature, featureIndex) => 
              renderFeatureItem(feature, featureIndex)
            )}
          </View>
        </Animated.View>
      </LinearGradient>
    );
  };

  const handleCompleteOnboarding = async () => {
    try {
      console.log('🎉 Welcome to the Splitwiser Universe!');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch(completeOnboarding());
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Fallback without haptics
      dispatch(completeOnboarding());
    }
  };

  const handleNext = async () => {
    try {
      console.log('Next button pressed, current index:', currentSlideIndex);
      
      // Add haptics with error handling
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (hapticsError) {
        console.log('Haptics not available:', hapticsError);
      }
      
      if (currentSlideIndex < onboardingSlides.length - 1) {
        const nextIndex = currentSlideIndex + 1;
        console.log('Moving to slide:', nextIndex);
        setCurrentSlideIndex(nextIndex);
        
        // Scroll to next slide with error handling
        try {
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        } catch (scrollError) {
          console.error('Error scrolling to index:', scrollError);
          // Try alternative scroll method
          flatListRef.current?.scrollToOffset({ offset: nextIndex * screenWidth, animated: true });
        }
      } else {
        console.log('Completing onboarding...');
        handleCompleteOnboarding();
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      if (currentSlideIndex > 0) {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (hapticsError) {
          console.log('Haptics not available:', hapticsError);
        }
        
        const prevIndex = currentSlideIndex - 1;
        setCurrentSlideIndex(prevIndex);
        
        try {
          flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
        } catch (scrollError) {
          console.error('Error scrolling to previous index:', scrollError);
          flatListRef.current?.scrollToOffset({ offset: prevIndex * screenWidth, animated: true });
        }
      }
    } catch (error) {
      console.error('Error in handlePrevious:', error);
    }
  };

  const handleSkip = async () => {
    try {
      console.log('⚡ Fast-tracking to Splitwiser!');
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (hapticsError) {
        console.log('Haptics not available:', hapticsError);
      }
      handleCompleteOnboarding();
    } catch (error) {
      console.error('Error in handleSkip:', error);
    }
  };

  const handleDotPress = async (index: number) => {
    try {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (hapticsError) {
        console.log('Haptics not available:', hapticsError);
      }
      
      setCurrentSlideIndex(index);
      
      try {
        flatListRef.current?.scrollToIndex({ index, animated: true });
      } catch (scrollError) {
        console.error('Error scrolling to dot index:', scrollError);
        flatListRef.current?.scrollToOffset({ offset: index * screenWidth, animated: true });
      }
    } catch (error) {
      console.error('Error in handleDotPress:', error);
    }
  };

  // Add scroll event handler to sync with manual scrolling
  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(contentOffset / screenWidth);
    
    if (slideIndex !== currentSlideIndex && slideIndex >= 0 && slideIndex < onboardingSlides.length) {
      setCurrentSlideIndex(slideIndex);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[`${currentSlide.gradient[0]}10`, `${currentSlide.gradient[1]}05`]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Enhanced Header */}
          <BlurView intensity={20} style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.logoGradient}
                >
                  <Text variant="headlineSmall" style={styles.logo}>
                    💰 Splitwiser
                  </Text>
                </LinearGradient>
                <Text variant="labelSmall" style={[styles.tagline, { color: theme.colors.outline }]}>
                  Smart Expense Splitting
                </Text>
              </View>
              
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text variant="labelLarge" style={[styles.skipText, { color: currentSlide.gradient[0] }]}>
                  Skip →
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Animated Progress Bar */}
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: currentSlide.gradient[0],
                  },
                ]}
              />
            </View>
          </BlurView>
          
          {/* Enhanced Slides */}
          <FlatList
            ref={flatListRef}
            data={onboardingSlides}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            scrollEnabled={true}
            style={styles.slidesList}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            removeClippedSubviews={false}
            initialNumToRender={onboardingSlides.length}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
          />
          
          {/* Interactive Page Indicators */}
          <View style={styles.indicatorContainer}>
            {onboardingSlides.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                style={styles.indicatorTouchable}
              >
                <Animated.View
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: index === currentSlideIndex 
                        ? currentSlide.gradient[0]
                        : theme.colors.surfaceVariant,
                      transform: [
                        {
                          scale: index === currentSlideIndex ? 1.5 : 1,
                        },
                      ],
                      width: index === currentSlideIndex ? 24 : 8,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Enhanced Action Buttons */}
          <BlurView intensity={40} style={styles.buttonsContainer}>
            <View style={styles.buttonRow}>
              {currentSlideIndex > 0 && (
                <Button
                  mode="outlined"
                  onPress={handlePrevious}
                  style={[styles.navButton, styles.previousButton]}
                  contentStyle={styles.buttonContent}
                  buttonColor="transparent"
                  textColor={currentSlide.gradient[0]}
                >
                  ← Previous
                </Button>
              )}
              
              <LinearGradient
                colors={currentSlide.gradient}
                style={[
                  styles.nextButtonGradient,
                  currentSlideIndex === 0 && styles.fullWidthButton
                ]}
              >
                <Button
                  mode="contained"
                  onPress={handleNext}
                  style={styles.nextButton}
                  contentStyle={styles.buttonContent}
                  buttonColor="transparent"
                  textColor="white"
                >
                  {currentSlideIndex < onboardingSlides.length - 1 
                    ? 'Continue →' 
                    : '🚀 Start Your Journey!'
                  }
                </Button>
              </LinearGradient>
            </View>
            
            {/* Enhanced Progress Text */}
            <View style={styles.progressTextContainer}>
              <Text variant="bodySmall" style={[styles.progressText, { color: theme.colors.outline }]}>
                Step {currentSlideIndex + 1} of {onboardingSlides.length}
              </Text>
              <Text variant="labelSmall" style={[styles.progressDescription, { color: currentSlide.gradient[0] }]}>
                {currentSlideIndex === onboardingSlides.length - 1 
                  ? 'Ready to revolutionize expense splitting?'
                  : 'Discover what makes Splitwiser special'
                }
              </Text>
            </View>
          </BlurView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logo: {
    fontWeight: 'bold',
    color: 'white',
  },
  tagline: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '500',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontWeight: '600',
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  slidesList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  heroContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  iconGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  statsBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statsNumber: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  statsLabel: {
    opacity: 0.8,
    fontSize: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 20,
  },
  subtitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  featuresGrid: {
    width: '100%',
    maxWidth: 320,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  highlightFeature: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  newBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  indicatorTouchable: {
    padding: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    overflow: 'hidden',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    borderRadius: 25,
    minWidth: 120,
  },
  previousButton: {
    marginRight: 12,
    borderWidth: 2,
  },
  nextButtonGradient: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  fullWidthButton: {
    flex: 1,
  },
  nextButton: {
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressDescription: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default OnboardingScreen;