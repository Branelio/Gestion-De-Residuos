import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

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
  // Mock data - TODO: Integrar con API
  const [user] = useState<UserProfile>({
    name: 'Usuario Demo',
    email: 'usuario@ejemplo.com',
    avatar: '👤',
    points: 240,
    reportsCount: 12,
    memberSince: 'Noviembre 2024',
    rank: 'Ciudadano Activo'
  });

  const [reports] = useState<Report[]>([
    { id: '1', type: 'Contenedor Lleno', date: '15 Ene', status: 'RESOLVED', points: 10 },
    { id: '2', type: 'Basurero Clandestino', date: '12 Ene', status: 'IN_PROGRESS', points: 15 },
    { id: '3', type: 'Contenedor Dañado', date: '08 Ene', status: 'RESOLVED', points: 10 }
  ]);

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
    if (user.points < reward.pointsCost) {
      Alert.alert(
        'Puntos Insuficientes',
        `Necesitas ${reward.pointsCost - user.points} puntos más para canjear esta recompensa.`,
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
          onPress: () => {
            // TODO: Implementar logout
            Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{user.avatar}</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>⭐ {user.rank}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.memberSince}>Miembro desde {user.memberSince}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.points}</Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.reportsCount}</Text>
              <Text style={styles.statLabel}>Reportes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.floor(user.reportsCount * 0.8)}</Text>
              <Text style={styles.statLabel}>Resueltos</Text>
            </View>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Reportes Recientes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todos</Text>
            </TouchableOpacity>
          </View>
          {reports.map((report) => (
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
          ))}
        </View>

        {/* Rewards Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎁 Recompensas Disponibles</Text>
            <Text style={styles.pointsBalance}>💎 {user.points} pts</Text>
          </View>
          {rewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>{reward.icon}</Text>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
                <View style={styles.rewardFooter}>
                  <Text style={styles.rewardCost}>💎 {reward.pointsCost} puntos</Text>
                  {!reward.available && (
                    <Text style={styles.unavailableText}>No disponible</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  (user.points < reward.pointsCost || !reward.available) && styles.redeemButtonDisabled
                ]}
                onPress={() => handleRedeemReward(reward)}
                disabled={user.points < reward.pointsCost || !reward.available}
              >
                <Text
                  style={[
                    styles.redeemButtonText,
                    (user.points < reward.pointsCost || !reward.available) && styles.redeemButtonTextDisabled
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
          <Text style={styles.sectionTitle}>🌍 Tu Impacto Ambiental</Text>
          <View style={styles.impactCard}>
            <View style={styles.impactRow}>
              <Text style={styles.impactIcon}>♻️</Text>
              <View style={styles.impactInfo}>
                <Text style={styles.impactValue}>~{user.reportsCount * 5} kg</Text>
                <Text style={styles.impactLabel}>Residuos gestionados</Text>
              </View>
            </View>
            <View style={styles.impactRow}>
              <Text style={styles.impactIcon}>🌳</Text>
              <View style={styles.impactInfo}>
                <Text style={styles.impactValue}>~{Math.floor(user.reportsCount * 0.3)} kg CO₂</Text>
                <Text style={styles.impactLabel}>Emisiones evitadas</Text>
              </View>
            </View>
            <View style={styles.impactRow}>
              <Text style={styles.impactIcon}>👥</Text>
              <View style={styles.impactInfo}>
                <Text style={styles.impactValue}>Top 15%</Text>
                <Text style={styles.impactLabel}>Entre usuarios activos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configuración</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>📝 Editar Perfil</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>🔔 Notificaciones</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>🌙 Modo Oscuro</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>❓ Ayuda y Soporte</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>📄 Términos y Condiciones</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
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
