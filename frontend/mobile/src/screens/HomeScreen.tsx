import React, { useState, useEffect } from 'react';
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
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { collectionPointService } from '../services/collectionPointService';

export default function HomeScreen({ navigation }: any) {
  const userPoints = 150; // Demo data - en el futuro vendrá de la API de usuarios
  const [stats, setStats] = useState({ total: 0, available: 0, full: 0, averageFillPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const statsData = await collectionPointService.getStats();
      console.log('📊 Stats data received:', statsData);
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

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
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
              <Text style={styles.logoText}>🌿</Text>
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
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de puntos */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Text style={styles.pointsLabel}>Tus Puntos Limpios</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🏆 Top 10</Text>
            </View>
          </View>
          <Text style={styles.pointsValue}>{userPoints}</Text>
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
              <Text style={styles.actionIconText}>📍</Text>
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
              <Text style={styles.actionIconText}>📸</Text>
            </View>
            <Text style={styles.actionTitle}>Reportar Residuos</Text>
            <Text style={styles.actionDescription}>
              Ayuda reportando contenedores llenos o basura
            </Text>
          </TouchableOpacity>
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
          <Text style={styles.infoTitle}>💡 ¿Sabías que?</Text>
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
      </ScrollView>
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
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.xl,
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
    margin: spacing.lg,
    marginTop: -spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
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
  pointsSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
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
});
