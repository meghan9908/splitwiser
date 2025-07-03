import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../types';

type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any; // In a real app, you would use a proper type or import actual images
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Track Expenses',
    description: 'Easily track and manage all your group expenses in one place.',
    image: null, // Replace with actual image
  },
  {
    id: '2',
    title: 'Split Bills',
    description: 'Split bills equally or with custom amounts among friends and groups.',
    image: null, // Replace with actual image
  },
  {
    id: '3',
    title: 'Settle Debts',
    description: 'Quickly see who owes what and settle debts with minimal transactions.',
    image: null, // Replace with actual image
  },
];

const OnboardingScreen: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const theme = useTheme();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { isAuthenticated } = useAuth();

  const renderItem = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slide}>
        <View style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          {item.image ? (
            <Image source={item.image} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.colors.primaryContainer }]} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text variant="headlineMedium" style={styles.title}>{item.title}</Text>
          <Text variant="bodyLarge" style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const handleNext = () => {
    if (currentSlideIndex < onboardingSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      // If user is already authenticated, navigate to Main directly
      if (isAuthenticated) {
        // The app navigator will handle this navigation
      } else {
        navigation.navigate('Login');
      }
    }
  };

  const handleSkip = () => {
    if (isAuthenticated) {
      // The app navigator will handle this navigation
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <Button onPress={handleSkip} mode="text">
          Skip
        </Button>
      </View>
      
      <FlatList
        data={onboardingSlides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        scrollEnabled={false}
        contentContainerStyle={{ width: `${100 * onboardingSlides.length}%` }}
        initialScrollIndex={currentSlideIndex}
        getItemLayout={(data, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
      />
      
      <View style={styles.indicatorContainer}>
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              { backgroundColor: index === currentSlideIndex ? theme.colors.primary : theme.colors.surfaceVariant },
            ]}
          />
        ))}
      </View>
      
      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {currentSlideIndex < onboardingSlides.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  skipContainer: {
    alignItems: 'flex-end',
    padding: 16,
  },
  slide: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default OnboardingScreen;
