import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { User, Lock, Bell, LogOut, ChevronRight, HelpCircle, Moon, Globe, Shield, Settings } from 'react-native-feather';
import { SafeAreaView } from 'react-native-safe-area-context';

const Setting = ({ navigation }) => {
  const handleLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const accountSettings = [
    { icon: User, title: 'Profile', action: () => navigation.navigate('UserProfile') },
    { icon: Lock, title: 'Password', action: () => {} },
    { icon: Bell, title: 'Notifications', action: () => {} },
  ];

  const appSettings = [
    { icon: Moon, title: 'Dark Mode', action: () => {} },
    { icon: Globe, title: 'Language', action: () => {} },
    { icon: Shield, title: 'Privacy', action: () => {} },
  ];

  const supportSettings = [
    { icon: HelpCircle, title: 'Help Center', action: () => {} },
    { icon: User, title: 'Contact Us', action: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Settings stroke="#4A5568" width={24} height={24} />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutIconButton}>
            <LogOut stroke="#E53E3E" width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {accountSettings.map((item, index) => (
            <TouchableOpacity 
              key={`account-${index}`} 
              style={[styles.item, index === accountSettings.length - 1 && styles.lastItem]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <item.icon stroke="#4A5568" width={20} height={20} />
              </View>
              <Text style={styles.itemText}>{item.title}</Text>
              <ChevronRight stroke="#A0AEC0" width={20} height={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          {appSettings.map((item, index) => (
            <TouchableOpacity 
              key={`app-${index}`} 
              style={[styles.item, index === appSettings.length - 1 && styles.lastItem]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <item.icon stroke="#4A5568" width={20} height={20} />
              </View>
              <Text style={styles.itemText}>{item.title}</Text>
              <ChevronRight stroke="#A0AEC0" width={20} height={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Support</Text>
          {supportSettings.map((item, index) => (
            <TouchableOpacity 
              key={`support-${index}`} 
              style={[styles.item, index === supportSettings.length - 1 && styles.lastItem]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <item.icon stroke="#4A5568" width={20} height={20} />
              </View>
              <Text style={styles.itemText}>{item.title}</Text>
              <ChevronRight stroke="#A0AEC0" width={20} height={20} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },
  logoutIconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
 
});

export default Setting;