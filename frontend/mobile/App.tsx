import React from 'react';
import { View, Platform, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import ReportScreen from './src/screens/ReportScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import PointsListScreen from './src/screens/PointsListScreen';
import EducationScreen from './src/screens/EducationScreen';
import GamificationScreen from './src/screens/GamificationScreen';
import MyRoutesScreen from './src/screens/MyRoutesScreen';
import StatsScreen from './src/screens/StatsScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 8,
          backgroundColor: theme.colors.primary[600],
          borderRadius: 20,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 15,
              backgroundColor: focused ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            }}>
              <Ionicons name={iconName} size={focused ? 28 : 24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Mapa',
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarLabel: 'Reportar',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Pantalla de carga mientras se verifica la sesión guardada
 */
function SplashScreen() {
  return (
    <View style={splashStyles.container}>
      <View style={splashStyles.content}>
        <Ionicons name="leaf" size={80} color={theme.colors.primary[500]} />
        <Text style={splashStyles.title}>Latacunga</Text>
        <Text style={splashStyles.subtitle}>Gestión de Residuos</Text>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary[500]}
          style={splashStyles.loader}
        />
        <Text style={splashStyles.loadingText}>Verificando sesión...</Text>
      </View>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary[700],
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    marginTop: 4,
  },
  loader: {
    marginTop: 40,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    marginTop: 12,
  },
});

/**
 * Navegación raíz que decide entre Login y la app
 * basándose en el estado de autenticación persistido
 */
function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  // Mientras carga datos de AsyncStorage, mostrar splash
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Rutas autenticadas
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PointsList" component={PointsListScreen} />
            <Stack.Screen name="Education" component={EducationScreen} />
            <Stack.Screen name="Gamification" component={GamificationScreen} />
            <Stack.Screen name="MyRoutes" component={MyRoutesScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="Activity" component={ActivityScreen} />
            <Stack.Screen name="MyReports" component={MyReportsScreen} />
          </>
        ) : (
          // Ruta no autenticada
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
