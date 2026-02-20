import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { wasteReportService, WasteReport } from '../services/wasteReportService';

interface ProfileScreenProps {
  navigation: any;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  points: number;
  reportsCount: number;
  memberSince: string;
  rank: string;
}

interface Report {
  id: string;
  type: string;
  date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  points: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: string;
  available: boolean;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const userId = user?.id || ''; // Obtener userId del contexto de autenticación

  const [reports, setReports] = useState<Report[]>([]);
  const [realReports, setRealReports] = useState<WasteReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0
  });

  // Cargar reportes reales al montar el componente
  useEffect(() => {
    loadUserReports();
  }, []);

  // Cargar reportes del usuario desde la API
  const loadUserReports = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Cargando reportes del usuario desde API...');

      // Intentar cargar reportes, pero continuar si falla (API externa puede no estar disponible)
      const userReports = await wasteReportService.getUserReports(userId);
      setRealReports(userReports);

      // Convertir a formato Report para el componente
      const convertedReports: Report[] = userReports.slice(0, 3).map(report => ({
        id: report.id.toString(),
        type: formatReportType(report.type),
        date: formatDateShort(report.createdAt),
        status: mapStatusToReportStatus(report.status),
        points: calculatePoints(report.severity ?? 1)
      }));
      setReports(convertedReports);

      // Calcular estadísticas
      const resolved = userReports.filter(r => r.status === 'RESUELTA').length;
      const inProgress = userReports.filter(r => r.status === 'EN_PROCESO').length;
      const pending = userReports.filter(r => r.status === 'PENDIENTE').length;

      setStats({
        total: userReports.length,
        resolved,
        inProgress,
        pending
      });

      // Calcular puntos totales basado en reportes resueltos
      const totalPoints = userReports.reduce((sum, report) => {
        return sum + (report.status === 'RESUELTA' ? calculatePoints(report.severity ?? 1) : 0);
      }, 0);

      // NOTA: No mutar user directamente — usar stats locales para mostrar datos

      console.log('✅ Reportes cargados:', userReports.length);
    } catch (error: any) {
      console.error('❌ Error cargando reportes:', error);
      console.log('ℹ️ Usando datos de ejemplo (API externa no disponible)');
      // Si falla, usar datos de ejemplo
      setReports([
        { id: '1', type: 'Contenedor Lleno', date: '15 Ene', status: 'RESOLVED', points: 10 },
        { id: '2', type: 'Basurero Clandestino', date: '12 Ene', status: 'IN_PROGRESS', points: 15 },
        { id: '3', type: 'Contenedor Dañado', date: '08 Ene', status: 'RESOLVED', points: 10 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refrescar reportes
  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadUserReports();
    setIsRefreshing(false);
  };

  // Formatear tipo de reporte
  const formatReportType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'CONTENEDOR_LLENO': 'Contenedor Lleno',
      'BASURA_ESPARCIDA': 'Basurero Ilegal',
      'PUNTO_CRITICO': 'Punto Crítico',
      'FALTA_RECOLECCION': 'Recolección Perdida',
      'RESIDUO_PELIGROSO': 'Residuo Peligroso',
      'OTRO': 'Otro'
    };
    return typeMap[type] || type;
  };

  // Formatear fecha corta
  const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Mapear estado de la API al formato del componente
  const mapStatusToReportStatus = (status: string): Report['status'] => {
    const statusMap: Record<string, Report['status']> = {
      'PENDIENTE': 'PENDING',
      'EN_PROCESO': 'IN_PROGRESS',
      'RESUELTA': 'RESOLVED',
      'RECHAZADA': 'PENDING'
    };
    return statusMap[status] || 'PENDING';
  };

  // Calcular puntos basado en gravedad
  const calculatePoints = (severity: number): number => {
    return severity * 5; // 5 puntos por nivel de gravedad
  };

  const [rewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'Descuento 10% EPAGAL',
      description: 'Descuento en pago de servicios',
      pointsCost: 100,
      icon: '💰',
      available: true
    },
    {
      id: '2',
      title: 'Bolsa Ecológica',
      description: 'Bolsa reutilizable oficial',
      pointsCost: 150,
      icon: '🛍',
      available: true
    },
    {
      id: '3',
      title: 'Planta Nativa',
      description: 'Planta nativa de Latacunga',
      pointsCost: 200,
      icon: '🌱',
      available: true
    },
    {
      id: '4',
      title: 'Visita Guiada Reciclaje',
      description: 'Tour al centro de reciclaje',
      pointsCost: 250,
      icon: '🏭',
      available: false
    }
  ]);

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'RESOLVED':
        return theme.colors.success;
      case 'IN_PROGRESS':
        return theme.colors.warning;
      case 'PENDING':
        return theme.colors.neutral[400];
      default:
        return theme.colors.neutral[400];
    }
  };

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'RESOLVED':
        return 'Resuelto';
      case 'IN_PROGRESS':
        return 'En Proceso';
      case 'PENDING':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const handleRedeemReward = (reward: Reward) => {
    const userPoints = user?.points || 0;
    if (userPoints < reward.pointsCost) {
      Alert.alert(
        'Puntos Insuficientes',
        `Necesitas ${reward.pointsCost - userPoints} puntos más para canjear esta recompensa.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!reward.available) {
      Alert.alert(
        'No Disponible',
        'Esta recompensa no está disponible en este momento.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Canjear Recompensa',
      `¿Deseas canjear "${reward.title}" por ${reward.pointsCost} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Canjear',
          onPress: () => {
            // TODO: Integrar con API
            Alert.alert(
              '🎉 ¡Canjeado!',
              'Tu recompensa ha sido canjeada. Revisa tu correo para más detalles.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // La navegación a Login ocurre automáticamente
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[600]]}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>
                <Ionicons name="star" size={14} color="#F59E0B" /> {user?.role === 'citizen' ? 'Ciudadano Activo' : user?.role === 'operator' ? 'Operador' : 'Administrador'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <Text style={styles.memberSince}>
            Miembro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Hoy'}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user?.points || 0}</Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user?.reportsCount || 0}</Text>
              <Text style={styles.statLabel}>Reportes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resueltos</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                Alert.alert(
                  'Cerrar Sesión',
                  '¿Estás seguro que deseas salir?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Salir',
                      style: 'destructive',
                      onPress: async () => {
                        await logout();
                        // La navegación a Login ocurre automáticamente
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="document-text" size={18} color={theme.colors.text.primary} />
              <Text style={styles.sectionTitle}>Reportes Recientes</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MyReports')}>
              <Text style={styles.seeAllText}>Ver Todos</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Cargando reportes...</Text>
            </View>
          ) : reports.length === 0 ? (
            <View style={styles.emptyReports}>
              <Text style={styles.emptyReportsText}>
                No tienes reportes aún. ¡Crea tu primer reporte!
              </Text>
              <TouchableOpacity
                style={styles.createReportButton}
                onPress={() => navigation.navigate('Report')}
              >
                <Text style={styles.createReportButtonText}><Ionicons name="add-circle" size={16} color="#fff" /> Crear Reporte</Text>
              </TouchableOpacity>
            </View>
          ) : (
            reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportType}>{report.type}</Text>
                    <Text style={styles.reportDate}>{report.date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(report.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                      {getStatusText(report.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.reportFooter}>
                  <Text style={styles.reportPoints}>+{report.points} puntos</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Rewards Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="gift" size={18} color={theme.colors.text.primary} />
              <Text style={styles.sectionTitle}>Recompensas Disponibles</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="diamond" size={14} color={theme.colors.primary[600]} />
              <Text style={styles.pointsBalance}>{user?.points || 0} pts</Text>
            </View>
          </View>
          {rewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>{reward.icon}</Text>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
                <View style={styles.rewardFooter}>
                  <Text style={styles.rewardCost}><Ionicons name="diamond" size={12} color={theme.colors.primary[600]} /> {reward.pointsCost} puntos</Text>
                  {!reward.available && (
                    <Text style={styles.unavailableText}>No disponible</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  ((user?.points || 0) < reward.pointsCost || !reward.available) && styles.redeemButtonDisabled
                ]}
                onPress={() => handleRedeemReward(reward)}
                disabled={(user?.points || 0) < reward.pointsCost || !reward.available}
              >
                <Text
                  style={[
                    styles.redeemButtonText,
                    ((user?.points || 0) < reward.pointsCost || !reward.available) && styles.redeemButtonTextDisabled
                  ]}
                >
                  Canjear
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Impact Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Ionicons name="earth" size={18} color={theme.colors.text.primary} />
            <Text style={styles.sectionTitle}>Tu Impacto Ambiental</Text>
          </View>
          <View style={styles.impactCard}>
            <View style={styles.impactRow}>
              <View style={styles.impactIconCircle}><Ionicons name="sync-circle" size={24} color={theme.colors.primary[600]} /></View>
              <View style={styles.impactInfo}>
                <Text style={styles.impactValue}>~{(user?.reportsCount || 0) * 5} kg</Text>
                <Text style={styles.impactLabel}>Residuos gestionados</Text>
              </View>
            </View>
            <View style={styles.impactRow}>
              <View style={styles.impactIconCircle}><Ionicons name="leaf" size={24} color="#10B981" /></View>
              <View style={styles.impactInfo}>
                <Text style={styles.impactValue}>~{Math.floor((user?.reportsCount || 0) * 0.3)} kg CO₂</Text>
                <Text style={styles.impactLabel}>Emisiones evitadas</Text>
              </View>
            </View>
            <View style={styles.impactRow}>
              <View style={styles.impactIconCircle}><Ionicons name="people" size={24} color="#8B5CF6" /></View>
              <View style={styles.impactInfo}>
                <Text style={styles.impactValue}>Top 15%</Text>
                <Text style={styles.impactLabel}>Entre usuarios activos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Ionicons name="settings" size={18} color={theme.colors.text.primary} />
            <Text style={styles.sectionTitle}>Configuración</Text>
          </View>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="create" size={18} color={theme.colors.text.secondary} /><Text style={styles.settingText}>Editar Perfil</Text></View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="notifications" size={18} color={theme.colors.text.secondary} /><Text style={styles.settingText}>Notificaciones</Text></View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="moon" size={18} color={theme.colors.text.secondary} /><Text style={styles.settingText}>Modo Oscuro</Text></View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="help-circle" size={18} color={theme.colors.text.secondary} /><Text style={styles.settingText}>Ayuda y Soporte</Text></View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="document" size={18} color={theme.colors.text.secondary} /><Text style={styles.settingText}>Términos y Condiciones</Text></View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="log-out" size={18} color={theme.colors.error} /><Text style={styles.logoutText}>Cerrar Sesión</Text></View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sistema de Gestión de Residuos</Text>
          <Text style={styles.footerText}>EPAGAL - Latacunga</Text>
          <Text style={styles.footerVersion}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50]
  },
  scrollView: {
    flex: 1
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: 0
  },
  backButton: {
    marginBottom: theme.spacing.sm
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.primary[600],
    fontWeight: '500'
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: 16,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.md
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md
  },
  avatar: {
    fontSize: 64,
    backgroundColor: theme.colors.primary[100],
    width: 100,
    height: 100,
    borderRadius: 50,
    textAlign: 'center',
    lineHeight: 100,
    overflow: 'hidden'
  },
  rankBadge: {
    position: 'absolute',
    bottom: -5,
    right: -10,
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff'
  },
  rankText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.xs
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs
  },
  memberSince: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginBottom: theme.spacing.lg
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.lg
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.neutral[600]
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.neutral[200]
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: 16,
    padding: theme.spacing.lg,
    ...theme.shadows.sm
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.neutral[900]
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary[600],
    fontWeight: '500'
  },
  pointsBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary[600]
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.sm
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.neutral[600]
  },
  emptyReports: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 12,
    marginTop: theme.spacing.sm
  },
  emptyReportsText: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: theme.spacing.md
  },
  createReportButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8
  },
  createReportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  reportCard: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  reportInfo: {
    flex: 1
  },
  reportType: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 2
  },
  reportDate: {
    fontSize: 12,
    color: theme.colors.neutral[600]
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  reportFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.sm
  },
  reportPoints: {
    fontSize: 12,
    color: theme.colors.primary[600],
    fontWeight: '600'
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md
  },
  rewardIcon: {
    fontSize: 40
  },
  rewardInfo: {
    flex: 1
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 2
  },
  rewardDescription: {
    fontSize: 12,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs
  },
  rewardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  rewardCost: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary[600]
  },
  unavailableText: {
    fontSize: 10,
    color: theme.colors.error,
    fontStyle: 'italic'
  },
  redeemButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8
  },
  redeemButtonDisabled: {
    backgroundColor: theme.colors.neutral[300]
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  redeemButtonTextDisabled: {
    color: theme.colors.neutral[500]
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary[600],
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary[600],
  },
  logoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error,
  },
  impactCard: {
    gap: theme.spacing.md
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 12,
    padding: theme.spacing.md,
    gap: theme.spacing.md
  },
  impactIcon: {
    fontSize: 32
  },
  impactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  impactInfo: {
    flex: 1
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.neutral[900],
    marginBottom: 2
  },
  impactLabel: {
    fontSize: 12,
    color: theme.colors.neutral[600]
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100]
  },
  settingText: {
    fontSize: 14,
    color: theme.colors.neutral[900]
  },
  settingArrow: {
    fontSize: 16,
    color: theme.colors.neutral[400]
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: theme.spacing.sm
  },
  logoutText: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.neutral[600],
    marginBottom: 2
  },
  footerVersion: {
    fontSize: 10,
    color: theme.colors.neutral[400],
    marginTop: theme.spacing.xs
  }
});
