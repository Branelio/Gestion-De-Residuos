import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import {
    gamificationService,
    GamificationProfile,
    LeaderboardEntry,
    Achievement,
    Mission,
    Reward,
    UserMissions,
} from '../services/gamificationService';

interface GamificationScreenProps {
    navigation: any;
}

export default function GamificationScreen({ navigation }: GamificationScreenProps) {
    const userId = '1'; // TODO: Obtener del contexto de autenticación

    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [missions, setMissions] = useState<UserMissions | null>(null);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'leaderboard' | 'achievements' | 'missions' | 'rewards'>('profile');

    const loadData = async () => {
        try {
            const [profileData, leaderboardData, achievementsData, missionsData, rewardsData] = await Promise.all([
                gamificationService.getUserProfile(userId),
                gamificationService.getLeaderboard(),
                gamificationService.getAchievements(),
                gamificationService.getUserMissions(userId),
                gamificationService.getRewards(),
            ]);

            setProfile(profileData);
            setLeaderboard(leaderboardData);
            setAchievements(achievementsData);
            setMissions(missionsData);
            setRewards(rewardsData);
        } catch (error) {
            console.error('Error cargando datos de gamificación:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={styles.loadingText}>Cargando logros...</Text>
            </View>
        );
    }

    const renderProfileTab = () => (
        <View style={styles.tabContent}>
            {/* Points Card */}
            <View style={styles.pointsCard}>
                <View style={styles.pointsHeader}>
                    <Text style={styles.levelBadge}>
                        Nivel {profile?.level || 1}
                    </Text>
                    <Text style={styles.levelName}>
                        {gamificationService.getLevelName(profile?.level || 1)}
                    </Text>
                </View>
                <Text style={styles.pointsValue}>{profile?.totalPoints || 0}</Text>
                <Text style={styles.pointsLabel}>Puntos Limpios</Text>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${profile?.progressToNextLevel || 0}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {profile?.pointsToNextLevel || 0} puntos para siguiente nivel
                    </Text>
                </View>

                {profile?.canRedeemDiscount && (
                    <View style={styles.discountBanner}>
                        <Ionicons name="gift" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.discountText}>¡Puedes canjear descuentos!</Text>
                    </View>
                )}
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View key="stat-reports" style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.reportsCount || 0}</Text>
                    <Text style={styles.statLabel}>Reportes</Text>
                </View>
                <View key="stat-verified" style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.verifiedReportsCount || 0}</Text>
                    <Text style={styles.statLabel}>Verificados</Text>
                </View>
                <View key="stat-badges" style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.badges?.length || 0}</Text>
                    <Text style={styles.statLabel}>Badges</Text>
                </View>
            </View>

            {/* Streak Info */}
            {profile?.streak && (
                <View style={styles.streakCard}>
                    <View style={styles.streakHeader}>
                        <Ionicons name="flame" size={24} color={profile.streak.isActive ? '#F97316' : '#D1D5DB'} />
                        <Text style={styles.streakTitle}>
                            {profile.streak.isActive ? '🔥 ¡Racha Activa!' : 'Racha Inactiva'}
                        </Text>
                    </View>
                    <View style={styles.streakStats}>
                        <View key="streak-current" style={styles.streakStat}>
                            <Text style={styles.streakValue}>{profile.streak.currentStreak}</Text>
                            <Text style={styles.streakLabel}>Días actuales</Text>
                        </View>
                        <View key="streak-longest" style={styles.streakStat}>
                            <Text style={styles.streakValue}>{profile.streak.longestStreak}</Text>
                            <Text style={styles.streakLabel}>Récord</Text>
                        </View>
                    </View>
                    {profile.streak.isActive && (
                        <Text style={styles.streakBonus}>
                            +{Math.min(50, profile.streak.currentStreak * 5)}% bonus de puntos
                        </Text>
                    )}
                </View>
            )}

            {/* My Badges */}
            <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name="medal" size={24} color={colors.primary[600]} style={{ marginRight: 8 }} />
                    <Text style={styles.sectionTitle}>Mis Badges</Text>
                </View>
                {profile?.badges && profile.badges.length > 0 ? (
                    <View style={styles.badgesGrid}>
                        {achievements
                            .filter(a => profile.badges.some(b => b.code === a.code))
                            .map((badge) => (
                                <View key={badge.code} style={styles.badgeItem}>
                                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                                    <Text style={styles.badgeName}>{badge.name}</Text>
                                </View>
                            ))}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>
                        Aún no tienes badges. ¡Haz tu primer reporte para ganar uno!
                    </Text>
                )}
            </View>
        </View>
    );

    const renderLeaderboardTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.leaderboardHeader}>
                <View style={styles.leaderboardTitleContainer}>
                    <Ionicons name="trophy" size={28} color={colors.warning} style={{ marginRight: 8 }} />
                    <Text style={styles.leaderboardTitle}>Top 10 Ciudadanos</Text>
                </View>
                <Text style={styles.leaderboardSubtitle}>Los más comprometidos con Latacunga</Text>
            </View>

            {leaderboard.length > 0 ? (
                <View style={styles.leaderboardList}>
                    {leaderboard.map((entry, index) => (
                        <View
                            key={entry.userId}
                            style={[
                                styles.leaderboardItem,
                                entry.userId === userId && styles.leaderboardItemCurrent,
                            ]}
                        >
                            <View style={[
                                styles.rankBadge,
                                index === 0 && styles.rankGold,
                                index === 1 && styles.rankSilver,
                                index === 2 && styles.rankBronze,
                            ]}>
                                {index < 3 ? (
                                    <Ionicons 
                                        name="medal" 
                                        size={24} 
                                        color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} 
                                    />
                                ) : (
                                    <Text style={styles.rankText}>#{entry.rank}</Text>
                                )}
                            </View>
                            <View style={styles.leaderboardInfo}>
                                <Text style={styles.leaderboardName}>
                                    {entry.userId === userId ? 'Tú' : `Usuario ${entry.userId}`}
                                </Text>
                                <Text style={styles.leaderboardStats}>
                                    Nivel {entry.level} • {entry.reportsCount} reportes
                                </Text>
                            </View>
                            <Text style={styles.leaderboardPoints}>{entry.totalPoints} pts</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.emptyText}>No hay usuarios en el ranking aún.</Text>
            )}
        </View>
    );

    const renderAchievementsTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.achievementsHeader}>
                <View style={styles.achievementsTitleContainer}>
                    <Ionicons name="ribbon" size={26} color={colors.secondary[600]} style={{ marginRight: 8 }} />
                    <Text style={styles.achievementsTitle}>Logros Disponibles</Text>
                </View>
                <Text style={styles.achievementsSubtitle}>
                    {profile?.badges?.length || 0} / {achievements.length} desbloqueados
                </Text>
            </View>

            <View style={styles.achievementsList}>
                {achievements.map((achievement) => {
                    const isUnlocked = profile?.badges?.some(b => b.code === achievement.code);
                    return (
                        <View
                            key={achievement.code}
                            style={[
                                styles.achievementItem,
                                !isUnlocked && styles.achievementLocked,
                            ]}
                        >
                            <Text style={[
                                styles.achievementIcon,
                                !isUnlocked && styles.achievementIconLocked,
                            ]}>
                                {achievement.icon}
                            </Text>
                            <View style={styles.achievementInfo}>
                                <Text style={[
                                    styles.achievementName,
                                    !isUnlocked && styles.achievementNameLocked,
                                ]}>
                                    {achievement.name}
                                </Text>
                                <Text style={styles.achievementDescription}>
                                    {achievement.description}
                                </Text>
                                <View style={styles.achievementCategory}>
                                    <Text style={styles.categoryText}>
                                        {gamificationService.getCategoryIcon(achievement.category)} {achievement.category}
                                    </Text>
                                </View>
                            </View>
                            {isUnlocked && (
                                <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );

    const renderMissionsTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.missionsHeader}>
                <View style={styles.missionsTitleContainer}>
                    <Ionicons name="trophy-outline" size={26} color={colors.primary[600]} style={{ marginRight: 8 }} />
                    <Text style={styles.missionsTitle}>Misiones</Text>
                </View>
                <Text style={styles.missionsSubtitle}>
                    Completa misiones para ganar puntos extra
                </Text>
            </View>

            {missions?.activeMissions && missions.activeMissions.length > 0 ? (
                <View style={styles.missionsList}>
                    <Text style={styles.missionsCategoryTitle}>⚡ Activas</Text>
                    {missions.activeMissions.map((mission) => (
                        <View key={mission.id} style={styles.missionCard}>
                            <View style={styles.missionHeader}>
                                <View style={styles.missionTitleRow}>
                                    <Text style={styles.missionTypeIcon}>
                                        {mission.type === 'daily' ? '📅' : mission.type === 'weekly' ? '📆' : '📋'}
                                    </Text>
                                    <Text style={styles.missionTitle}>{mission.title}</Text>
                                </View>
                                <Text style={styles.missionReward}>+{mission.reward} pts</Text>
                            </View>
                            <Text style={styles.missionDescription}>{mission.description}</Text>
                            
                            {/* Progress Bar */}
                            <View style={styles.missionProgressContainer}>
                                <View style={styles.missionProgressBar}>
                                    <View
                                        style={[
                                            styles.missionProgressFill,
                                            { width: `${gamificationService.getMissionProgress(mission)}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.missionProgressText}>
                                    {mission.currentValue} / {mission.targetValue}
                                </Text>
                            </View>

                            <Text style={styles.missionExpiry}>
                                ⏱️ {gamificationService.formatMissionExpiry(mission.expiresAt)}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.emptyText}>
                    No tienes misiones activas. Vuelve mañana para nuevas misiones.
                </Text>
            )}

            {missions?.completedMissions && missions.completedMissions.length > 0 && (
                <View style={styles.missionsList}>
                    <Text style={styles.missionsCategoryTitle}>✅ Completadas</Text>
                    {missions.completedMissions.slice(0, 5).map((mission) => (
                        <View key={mission.id} style={[styles.missionCard, styles.missionCompleted]}>
                            <View style={styles.missionHeader}>
                                <Text style={styles.missionTitle}>{mission.title}</Text>
                                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                            </View>
                            <Text style={styles.missionCompletedText}>
                                +{mission.reward} puntos ganados
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const renderRewardsTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.rewardsHeader}>
                <View style={styles.rewardsTitleContainer}>
                    <Ionicons name="gift" size={26} color={colors.secondary[600]} style={{ marginRight: 8 }} />
                    <Text style={styles.rewardsTitle}>Recompensas</Text>
                </View>
                <Text style={styles.rewardsSubtitle}>
                    Tus puntos: {profile?.totalPoints || 0} pts
                </Text>
            </View>

            {rewards.length > 0 ? (
                <View style={styles.rewardsList}>
                    {rewards.map((reward) => {
                        const canAfford = (profile?.totalPoints || 0) >= reward.pointsCost;
                        const hasRedeemed = profile?.redeemedRewards?.includes(reward._id);

                        return (
                            <View
                                key={reward._id}
                                style={[
                                    styles.rewardCard,
                                    !reward.available && styles.rewardUnavailable,
                                ]}
                            >
                                <View style={styles.rewardHeader}>
                                    <Text style={styles.rewardIcon}>
                                        {gamificationService.getRewardTypeIcon(reward.type)}
                                    </Text>
                                    <View style={styles.rewardTitleContainer}>
                                        <Text style={styles.rewardTitle}>{reward.title}</Text>
                                        <Text style={styles.rewardType}>{reward.typeName}</Text>
                                    </View>
                                </View>

                                <Text style={styles.rewardDescription}>{reward.description}</Text>

                                {reward.partner && (
                                    <Text style={styles.rewardPartner}>
                                        🤝 {reward.partner}
                                    </Text>
                                )}

                                <View style={styles.rewardFooter}>
                                    <Text style={[
                                        styles.rewardCost,
                                        canAfford ? styles.rewardCostAffordable : styles.rewardCostExpensive
                                    ]}>
                                        💎 {reward.pointsCost} puntos
                                    </Text>

                                    {reward.stock !== null && (
                                        <Text style={styles.rewardStock}>
                                            📦 Stock: {reward.stock}
                                        </Text>
                                    )}
                                </View>

                                {reward.expiringSoon && (
                                    <Text style={styles.rewardExpiring}>
                                        ⚠️ Expira pronto
                                    </Text>
                                )}

                                {!reward.available && (
                                    <View style={styles.rewardUnavailableBadge}>
                                        <Text style={styles.rewardUnavailableText}>No disponible</Text>
                                    </View>
                                )}

                                {hasRedeemed && (
                                    <View style={styles.rewardRedeemedBadge}>
                                        <Text style={styles.rewardRedeemedText}>✓ Canjeado</Text>
                                    </View>
                                )}

                                {reward.available && canAfford && !hasRedeemed && (
                                    <TouchableOpacity
                                        style={styles.rewardRedeemButton}
                                        onPress={() => handleRedeemReward(reward._id)}
                                    >
                                        <Text style={styles.rewardRedeemButtonText}>Canjear</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>
            ) : (
                <Text style={styles.emptyText}>
                    No hay recompensas disponibles en este momento.
                </Text>
            )}
        </View>
    );

    const handleRedeemReward = async (rewardId: string) => {
        try {
            const result = await gamificationService.redeemReward(userId, rewardId);
            
            if (result.success) {
                // Actualizar perfil
                await loadData();
                
                // Mostrar alerta de éxito (puedes usar Alert de react-native)
                console.log('✅ Recompensa canjeada:', result.message);
                console.log('🎫 Código:', result.rewardCode);
            }
        } catch (error: any) {
            console.error('❌ Error canjeando recompensa:', error);
            // Mostrar alerta de error
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary[600]} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Ionicons name="trophy" size={32} color={colors.primary[600]} style={{ marginRight: 10 }} />
                        <Text style={styles.title}>Mis Logros</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Gana puntos y desbloquea recompensas
                    </Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        key="tab-profile"
                        style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
                        onPress={() => setActiveTab('profile')}
                    >
                        <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                            Perfil
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        key="tab-missions"
                        style={[styles.tab, activeTab === 'missions' && styles.tabActive]}
                        onPress={() => setActiveTab('missions')}
                    >
                        <Text style={[styles.tabText, activeTab === 'missions' && styles.tabTextActive]}>
                            Misiones
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        key="tab-rewards"
                        style={[styles.tab, activeTab === 'rewards' && styles.tabActive]}
                        onPress={() => setActiveTab('rewards')}
                    >
                        <Text style={[styles.tabText, activeTab === 'rewards' && styles.tabTextActive]}>
                            Recompensas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        key="tab-achievements"
                        style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
                        onPress={() => setActiveTab('achievements')}
                    >
                        <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
                            Logros
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        key="tab-leaderboard"
                        style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
                        onPress={() => setActiveTab('leaderboard')}
                    >
                        <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
                            Ranking
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'missions' && renderMissionsTab()}
                {activeTab === 'rewards' && renderRewardsTab()}
                {activeTab === 'achievements' && renderAchievementsTab()}
                {activeTab === 'leaderboard' && renderLeaderboardTab()}

                {/* Info Footer */}
                <View style={styles.footer}>
                    <Ionicons name="bulb" size={20} color={colors.warning} style={{ marginRight: 8 }} />
                    <Text style={styles.footerText}>
                        Tip: Reporta problemas de residuos para ganar más puntos
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.neutral[50],
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 16,
        color: colors.neutral[600],
    },
    header: {
        padding: spacing.lg,
        backgroundColor: '#fff',
    },
    backButton: {
        marginBottom: spacing.sm,
    },
    backButtonText: {
        fontSize: 16,
        color: colors.primary[600],
        fontWeight: '500',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: borderRadius.lg,
        backgroundColor: colors.neutral[100],
    },
    tabActive: {
        backgroundColor: colors.primary[500],
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[600],
    },
    tabTextActive: {
        color: '#fff',
    },
    tabContent: {
        paddingHorizontal: spacing.lg,
    },
    pointsCard: {
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        ...shadows.lg,
    },
    pointsHeader: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    levelBadge: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    levelName: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    pointsValue: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#fff',
    },
    pointsLabel: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: spacing.lg,
    },
    progressContainer: {
        width: '100%',
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    discountBanner: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        marginTop: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    discountText: {
        color: '#fff',
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        gap: spacing.md,
    },
    statItem: {
        flex: 1,
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    statLabel: {
        fontSize: 12,
        color: colors.neutral[600],
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    badgeItem: {
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        minWidth: 80,
        ...shadows.sm,
    },
    badgeIcon: {
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    badgeName: {
        fontSize: 10,
        color: colors.neutral[700],
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: colors.neutral[500],
        textAlign: 'center',
        padding: spacing.lg,
    },
    leaderboardHeader: {
        marginBottom: spacing.lg,
    },
    leaderboardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    leaderboardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    leaderboardSubtitle: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    leaderboardList: {
        gap: spacing.sm,
    },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.md,
        ...shadows.sm,
    },
    leaderboardItemCurrent: {
        borderWidth: 2,
        borderColor: colors.primary[500],
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[200],
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankGold: {
        backgroundColor: '#FCD34D',
    },
    rankSilver: {
        backgroundColor: '#D1D5DB',
    },
    rankBronze: {
        backgroundColor: '#F59E0B',
    },
    rankText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    leaderboardInfo: {
        flex: 1,
    },
    leaderboardName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[900],
    },
    leaderboardStats: {
        fontSize: 12,
        color: colors.neutral[500],
    },
    leaderboardPoints: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    achievementsHeader: {
        marginBottom: spacing.lg,
    },
    achievementsTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    achievementsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    achievementsSubtitle: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    achievementsList: {
        gap: spacing.sm,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.md,
        ...shadows.sm,
    },
    achievementLocked: {
        opacity: 0.6,
    },
    achievementIcon: {
        fontSize: 36,
    },
    achievementIconLocked: {
        opacity: 0.5,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[900],
    },
    achievementNameLocked: {
        color: colors.neutral[500],
    },
    achievementDescription: {
        fontSize: 12,
        color: colors.neutral[600],
        marginTop: 2,
    },
    achievementCategory: {
        marginTop: spacing.xs,
    },
    categoryText: {
        fontSize: 10,
        color: colors.neutral[500],
    },
    unlockedBadge: {
        fontSize: 20,
    },
    // Streak Styles
    streakCard: {
        backgroundColor: '#fff',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginTop: spacing.md,
        ...shadows.md,
    },
    streakHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    streakTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginLeft: spacing.sm,
    },
    streakStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.neutral[200],
    },
    streakStat: {
        alignItems: 'center',
    },
    streakValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    streakLabel: {
        fontSize: 12,
        color: colors.neutral[600],
        marginTop: spacing.xs,
    },
    streakBonus: {
        fontSize: 14,
        color: colors.success,
        textAlign: 'center',
        marginTop: spacing.md,
        fontWeight: '600',
    },
    // Missions Styles
    missionsHeader: {
        marginBottom: spacing.lg,
    },
    missionsTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    missionsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    missionsSubtitle: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    missionsList: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    missionsCategoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.neutral[700],
        marginBottom: spacing.sm,
    },
    missionCard: {
        backgroundColor: '#fff',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.md,
    },
    missionCompleted: {
        opacity: 0.7,
        borderWidth: 1,
        borderColor: colors.success,
    },
    missionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    missionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    missionTypeIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    missionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[900],
        flex: 1,
    },
    missionReward: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary[600],
        backgroundColor: colors.primary[50],
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    missionDescription: {
        fontSize: 14,
        color: colors.neutral[600],
        marginBottom: spacing.md,
    },
    missionProgressContainer: {
        marginBottom: spacing.sm,
    },
    missionProgressBar: {
        height: 8,
        backgroundColor: colors.neutral[200],
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    },
    missionProgressFill: {
        height: '100%',
        backgroundColor: colors.primary[500],
    },
    missionProgressText: {
        fontSize: 12,
        color: colors.neutral[600],
        textAlign: 'right',
    },
    missionExpiry: {
        fontSize: 12,
        color: colors.warning,
        fontStyle: 'italic',
    },
    missionCompletedText: {
        fontSize: 14,
        color: colors.success,
        fontWeight: '600',
    },
    // Rewards Styles
    rewardsHeader: {
        marginBottom: spacing.lg,
    },
    rewardsTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    rewardsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    rewardsSubtitle: {
        fontSize: 16,
        color: colors.primary[600],
        fontWeight: '600',
    },
    rewardsList: {
        gap: spacing.md,
    },
    rewardCard: {
        backgroundColor: '#fff',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.md,
    },
    rewardUnavailable: {
        opacity: 0.6,
    },
    rewardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    rewardIcon: {
        fontSize: 32,
        marginRight: spacing.sm,
    },
    rewardTitleContainer: {
        flex: 1,
    },
    rewardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[900],
    },
    rewardType: {
        fontSize: 12,
        color: colors.neutral[500],
        marginTop: 2,
    },
    rewardDescription: {
        fontSize: 14,
        color: colors.neutral[600],
        marginBottom: spacing.sm,
    },
    rewardPartner: {
        fontSize: 12,
        color: colors.primary[600],
        fontStyle: 'italic',
        marginBottom: spacing.sm,
    },
    rewardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    rewardCost: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    rewardCostAffordable: {
        color: colors.success,
    },
    rewardCostExpensive: {
        color: colors.neutral[400],
    },
    rewardStock: {
        fontSize: 12,
        color: colors.neutral[600],
    },
    rewardExpiring: {
        fontSize: 12,
        color: colors.warning,
        marginTop: spacing.xs,
        fontWeight: '600',
    },
    rewardUnavailableBadge: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        backgroundColor: colors.neutral[500],
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    rewardUnavailableText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    rewardRedeemedBadge: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        backgroundColor: colors.success,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    rewardRedeemedText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    rewardRedeemButton: {
        marginTop: spacing.md,
        backgroundColor: colors.primary[500],
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    rewardRedeemButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    footer: {
        padding: spacing.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 14,
        color: colors.neutral[600],
        textAlign: 'center',
    },
});
