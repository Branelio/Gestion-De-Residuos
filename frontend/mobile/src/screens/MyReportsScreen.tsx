import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wasteReportService, WasteReport } from '../services/wasteReportService';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface MyReportsScreenProps {
  navigation: any;
}

export default function MyReportsScreen({ navigation }: MyReportsScreenProps) {
  const userId = 1; // TODO: Obtener del contexto de autenticación
  
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  // Cargar reportes al montar el componente
  useEffect(() => {
    loadReports();
  }, []);

  // Cargar reportes del usuario
  const loadReports = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Cargando reportes del usuario:', userId);
      
      const userReports = await wasteReportService.getUserReports(userId);
      setReports(userReports);
      
      // Calcular estadísticas
      const pending = userReports.filter(r => r.status === 'PENDIENTE').length;
      const inProgress = userReports.filter(r => r.status === 'EN_PROCESO').length;
      const resolved = userReports.filter(r => r.status === 'RESUELTA').length;
      
      setStats({
        total: userReports.length,
        pending,
        inProgress,
        resolved
      });
      
      console.log('✅ Reportes cargados:', userReports.length);
    } catch (error: any) {
      console.error('❌ Error cargando reportes:', error);
      Alert.alert('Error', error.message || 'No se pudieron cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  };

  // Refrescar reportes
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadReports();
    setIsRefreshing(false);
  }, []);

  // Obtener icono según el tipo
  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'CONTENEDOR_LLENO': '🗑️',
      'BASURA_ESPARCIDA': '🚫',
      'PUNTO_CRITICO': '🔧',
      'FALTA_RECOLECCION': '📅',
      'RESIDUO_PELIGROSO': '⚠️',
      'OTRO': '📝'
    };
    return icons[type] || '📝';
  };

  // Obtener color y etiqueta según el estado
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      'PENDIENTE': { 
        label: 'Pendiente', 
        color: colors.warning[700], 
        bgColor: colors.warning[50] 
      },
      'EN_PROCESO': { 
        label: 'En Proceso', 
        color: colors.info[700], 
        bgColor: colors.info[50] 
      },
      'RESUELTA': { 
        label: 'Resuelta', 
        color: colors.success[700], 
        bgColor: colors.success[50] 
      },
      'RECHAZADA': { 
        label: 'Rechazada', 
        color: colors.error, 
        bgColor: '#FFEBEE' 
      }
    };
    return statusMap[status] || statusMap['PENDIENTE'];
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-EC', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Renderizar tarjeta de reporte
  const renderReportCard = ({ item }: { item: WasteReport }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => {
          Alert.alert(
            `Reporte #${item.id}`,
            `Estado: ${statusInfo.label}\n` +
            `Tipo: ${item.type}\n` +
            `Zona: ${item.zone}\n` +
            `Gravedad: ${item.severity}/5\n` +
            `Descripción: ${item.description}\n` +
            `Reportado: ${formatDate(item.createdAt)}`,
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={styles.reportHeader}>
          <View style={styles.reportTitleRow}>
            <Text style={styles.reportIcon}>{getTypeIcon(item.type)}</Text>
            <View style={styles.reportTitleContainer}>
              <Text style={styles.reportId}>Reporte #{item.id}</Text>
              <Text style={styles.reportZone}>📍 {item.zone}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
        
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.reportFooter}>
          <View style={styles.severityContainer}>
            <Text style={styles.severityLabel}>Gravedad:</Text>
            <View style={styles.severityStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text key={star} style={styles.star}>
                  {star <= item.severity ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
          </View>
          <Text style={styles.reportDate}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar mensaje vacío
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No tienes reportes</Text>
      <Text style={styles.emptyText}>
        Aún no has creado ningún reporte. Empieza reportando problemas de residuos en tu zona.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('Report')}
      >
        <Text style={styles.createButtonText}>➕ Crear Primer Reporte</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Reportes</Text>
      </View>

      {/* Estadísticas */}
      {reports.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning[700] }]}>
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.info[700] }]}>
              {stats.inProgress}
            </Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success[700] }]}>
              {stats.resolved}
            </Text>
            <Text style={styles.statLabel}>Resueltas</Text>
          </View>
        </View>
      )}

      {/* Lista de reportes */}
      <FlatList
        data={reports}
        renderItem={renderReportCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[600]]}
          />
        }
      />

      {/* Botón flotante para crear nuevo reporte */}
      {reports.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Report')}
        >
          <Text style={styles.fabText}>➕</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50]
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.neutral[600]
  },
  header: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200]
  },
  backButton: {
    marginBottom: spacing.sm
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary[600],
    fontWeight: '500'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral[900]
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200]
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[600]
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: spacing.xs
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 80
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  reportIcon: {
    fontSize: 32,
    marginRight: spacing.sm
  },
  reportTitleContainer: {
    flex: 1
  },
  reportId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900]
  },
  reportZone: {
    fontSize: 13,
    color: colors.neutral[600],
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  reportDescription: {
    fontSize: 14,
    color: colors.neutral[700],
    lineHeight: 20,
    marginBottom: spacing.sm
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100]
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  severityLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    marginRight: spacing.xs
  },
  severityStars: {
    flexDirection: 'row'
  },
  star: {
    fontSize: 12
  },
  reportDate: {
    fontSize: 12,
    color: colors.neutral[500]
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl * 2
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.sm
  },
  emptyText: {
    fontSize: 15,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl
  },
  createButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg
  },
  fabText: {
    fontSize: 24,
    color: '#fff'
  }
});
