import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { collectionPointService } from '../services/collectionPointService';
import FeedbackModal from '../components/FeedbackModal';
// import StatsCard from '../components/StatsCard'; // No existe, usar componentes nativos o crear si es necesario.
// import CustomMap from '../components/CustomMap';
import NearbyPointsList from '../components/NearbyPointsList';
import { FeedbackType } from '../services/feedbackService';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();
  const userPoints = user?.points || 0;
  const userId = user?.id || '1';
  const [stats, setStats] = useState({ total: 0, available: 0, full: 0, averageFillPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Calcular progreso hacia el siguiente nivel
  const nextMilestone = userPoints < 50 ? 50 : userPoints < 100 ? 100 : userPoints < 250 ? 250 : userPoints < 500 ? 500 : 1000;
  const prevMilestone = userPoints < 50 ? 0 : userPoints < 100 ? 50 : userPoints < 250 ? 100 : userPoints < 500 ? 250 : 500;
  const progressPercent = ((userPoints - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  const loadStats = async () => {
    try {
      const statsData = await collectionPointService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Refrescar datos del usuario cuando la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => { });
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadStats(),
      refreshUser().catch(() => { }),
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="leaf" size={28} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Latacunga Limpia</Text>
              <Text style={styles.headerSubtitle}>Gestión Inteligente de Residuos</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tarjeta de puntos con barra de progreso */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Text style={styles.pointsLabel}>Tus Puntos Limpios</Text>
            <View style={styles.badge}>
              <Ionicons name="trophy" size={12} color="#fff" />
              <Text style={styles.badgeText}> Nivel {userPoints >= 500 ? '8+' : userPoints >= 250 ? '6' : userPoints >= 100 ? '4' : userPoints >= 50 ? '3' : userPoints >= 20 ? '2' : '1'}</Text>
            </View>
          </View>
          <Text style={styles.pointsValue}>{userPoints}</Text>

          {/* Barra de progreso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {userPoints >= 1000 ? '¡Nivel máximo!' : `${nextMilestone - userPoints} pts para siguiente nivel`}
            </Text>
          </View>

          <Text style={styles.pointsSubtext}>
            {userPoints >= 100 ? '¡Puedes canjear descuentos!' : `${100 - userPoints} puntos para descuento`}
          </Text>
        </View>

        {/* Acciones rápidas */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.actionPrimary]}
            onPress={() => navigation.navigate('Map')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="location" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Punto Más Cercano</Text>
            <Text style={styles.actionDescription}>
              Encuentra el basurero más cercano a tu ubicación
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.actionSecondary]}
            onPress={() => navigation.navigate('Report')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Reportar Residuos</Text>
            <Text style={styles.actionDescription}>
              Ayuda reportando contenedores llenos o basura
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nuevas Acciones */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#10B981' }]}
            onPress={() => navigation.navigate('Education')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="book" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Aprende Reciclaje</Text>
            <Text style={styles.actionDescription}>
              Tips y guías para reciclar correctamente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#8B5CF6' }]}
            onPress={() => navigation.navigate('Gamification')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="trophy" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Mis Logros</Text>
            <Text style={styles.actionDescription}>
              Puntos, badges y ranking
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#F59E0B' }]}
            onPress={() => navigation.navigate('MyRoutes')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="bus" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Rutas de Recolección</Text>
            <Text style={styles.actionDescription}>
              Horarios y puntos cercanos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#06B6D4' }]}
            onPress={() => navigation.navigate('Stats')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="stats-chart" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Mi Impacto</Text>
            <Text style={styles.actionDescription}>
              Estadísticas ambientales
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#EC4899' }]}
            onPress={() => navigation.navigate('MyReports')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="document-text" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Mis Reportes</Text>
            <Text style={styles.actionDescription}>
              Historial de tus reportes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#EF4444' }]}
            onPress={() => navigation.navigate('Activity')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="time" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Actividad</Text>
            <Text style={styles.actionDescription}>
              Acciones y puntos ganados
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mapa de Puntos Cercanos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Puntos Cercanos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map')}>
              <Text style={styles.seeAllText}>Ver Mapa Completo</Text>
            </TouchableOpacity>
          </View>

          {/* <CustomMap
            style={styles.mapContainer}
            initialRegion={{
                latitude: -0.9346,
                longitude: -78.6157,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }}
            markers={[
                {
                    id: '1',
                    coordinate: { latitude: -0.9346, longitude: -78.6157 },
                    title: 'Punto Latacunga Centro',
                    description: 'Recolección diaria',
                    pinColor: colors.primary[500]
                },
                {
                    id: '2', 
                    coordinate: { latitude: -0.9320, longitude: -78.6140 },
                    title: 'Punto San Felipe',
                    description: 'Recolección Lun-Mie-Vie',
                    pinColor: colors.secondary[500]
                }
            ]}
            scrollEnabled={false} // Mapa estático preview
            zoomEnabled={false}
          /> */}
        </View>

        {/* Estadísticas */}
        <Text style={styles.sectionTitle}>Impacto de la Comunidad</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.total || 0}</Text>
            <Text style={styles.statLabel}>Puntos de Acopio</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.available || 0}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats?.averageFillPercentage != null ? Math.round(stats.averageFillPercentage) : 0}%
            </Text>
            <Text style={styles.statLabel}>Capacidad Promedio</Text>
          </View>
        </View>

        {/* Información educativa */}
        <View style={styles.infoCard}>
          <View style={styles.infoTitleRow}>
            <Ionicons name="bulb" size={20} color={colors.primary[600]} />
            <Text style={styles.infoTitle}>¿Sabías que?</Text>
          </View>
          <Text style={styles.infoText}>
            Al reportar correctamente los residuos ayudas a optimizar las rutas de recolección,
            reduciendo el consumo de combustible en un 11.6% y las distancias en un 9.4%.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            En colaboración con EPAGAL y el Municipio de Latacunga
          </Text>
        </View>

        {/* Espacio extra para que no quede tapado por el bottom tab */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Botón flotante de feedback */}
      <TouchableOpacity
        style={styles.feedbackButton}
        onPress={() => setShowFeedbackModal(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Feedback */}
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userId={userId}
        initialType={FeedbackType.APP_USABILITY}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary[900],
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary[700],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  logoText: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[100],
  },
  profileButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary[700],
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  pointsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    marginBottom: spacing.sm,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pointsLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  badge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  progressContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  loader: {
    marginTop: spacing.xl,
  },
  mapContainer: {
    height: 180,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: '600',
  },
  pointsSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  actionPrimary: {
    backgroundColor: colors.primary[500],
  },
  actionSecondary: {
    backgroundColor: colors.secondary[500],
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.info + '15',
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  feedbackButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  feedbackButtonText: {
    fontSize: 28,
  },
});
