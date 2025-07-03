import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  showBackButton = false, 
  rightIcon, 
  onRightIconPress 
}) => {
  const navigation = useNavigation();

  return (
    <Appbar.Header style={styles.header}>
      {showBackButton && (
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      )}
      
      <Appbar.Content title={title} />
      
      {rightIcon && (
        <Appbar.Action icon={rightIcon} onPress={onRightIconPress} />
      )}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 0,
    backgroundColor: 'transparent',
  },
});

export default AppHeader;
