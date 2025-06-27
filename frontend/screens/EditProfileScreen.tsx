import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, UserProfileUpdate } from '../types/user';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen({ navigation }: any) {
  const { accessToken, user } = useAuth();
  // Fallbacks for user fields
  const initialForm: UserProfileUpdate = {
    name: user?.name || '',
    imageUrl: user?.imageUrl || '',
    currency: user?.currency || '',
  };
  const [form, setForm] = useState<UserProfileUpdate>(initialForm);
  const [loading, setLoading] = useState(false);

  // Check if any field has changed
  const isChanged = useMemo(() => {
    return (
      form.name !== initialForm.name ||
      form.imageUrl !== initialForm.imageUrl ||
      form.currency !== initialForm.currency
    );
  }, [form, initialForm]);

  const handleChange = (key: keyof UserProfileUpdate, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.patch<{ user: UserProfile }>('/users/me', form, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <View style={styles.profileSection}>
        {form.imageUrl ? (
          <Image source={{ uri: form.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color="#2196F3" />
          </View>
        )}
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={text => handleChange('name', text)}
      />
      <Text style={styles.label}>Profile Image URL</Text>
      <TextInput
        style={styles.input}
        placeholder="Profile Image URL"
        value={form.imageUrl}
        onChangeText={text => handleChange('imageUrl', text)}
      />
      <Text style={styles.label}>Currency (e.g. USD)</Text>
      <TextInput
        style={styles.input}
        placeholder="Currency (e.g. USD)"
        value={form.currency}
        onChangeText={text => handleChange('currency', text)}
        autoCapitalize="characters"
        maxLength={3}
      />
      <TouchableOpacity
        style={[styles.saveButton, !isChanged && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!isChanged || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#b3e0fc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
