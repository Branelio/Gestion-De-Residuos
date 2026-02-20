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
    Achievement
} from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

interface GamificationScreenProps {
    navigation: any;
}

export default function GamificationScreen({ navigation }: GamificationScreenProps) {
    const { user } = useAuth();
    const userId = user?.id || '1';

    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'leaderboard' | 'achievements'>('profile');

    const loadData = async () => {
        try {
            const [profileData, leaderboardData, achievementsData] = await Promise.all([
                gamificationService.getUserProfile(userId),
                gamificationService.getLeaderboard(),
                gamificationService.getAchievements(),
            ]);

            setProfile(profileData);
            setLeaderboard(leaderboardData);
            setAchievements(achievementsData);
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
                        <Text style={styles.discountText}>🎉 ¡Puedes canjear descuentos!</Text>
                    </View>
                )}
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.reportsCount || 0}</Text>
                    <Text style={styles.statLabel}>Reportes</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.verifiedReportsCount || 0}</Text>
                    <Text style={styles.statLabel}>Verificados</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.badges?.length || 0}</Text>
                    <Text style={styles.statLabel}>Badges</Text>
                </View>
            </View>

            {/* My Badges */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏅 Mis Badges</Text>
                {profile?.badges && profile.badges.length > 0 ? (
                    <View style={styles.badgesGrid}>
                        {achievements
                            .filter(a => profile.badges.includes(a.code))
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="trophy" size={22} color="#F59E0B" />
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
                                <Text style={styles.rankText}>
                                    {index === 0 ? <Ionicons name="medal" size={16} color="#F59E0B" /> : index === 1 ? <Ionicons name="medal" size={16} color="#C0C0C0" /> : index === 2 ? <Ionicons name="medal" size={16} color="#CD7F32" /> : <Text>{`#${entry.rank}`}</Text>}
                                </Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="ribbon" size={22} color="#8B5CF6" />
                    <Text style={styles.achievementsTitle}>Logros Disponibles</Text>
                </View>
                <Text style={styles.achievementsSubtitle}>
                    {profile?.badges?.length || 0} / {achievements.length} desbloqueados
                </Text>
            </View>

            <View style={styles.achievementsList}>
                {achievements.map((achievement) => {
                    const isUnlocked = profile?.badges?.includes(achievement.code);
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
                                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );

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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="arrow-back" size={18} color={colors.primary[600]} />
                            <Text style={styles.backButtonText}>Atrás</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="trophy" size={24} color={colors.neutral[900]} />
                        <Text style={styles.title}>Mis Logros</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Gana puntos y desbloquea recompensas
                    </Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
                        onPress={() => setActiveTab('profile')}
                    >
                        <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                            Perfil
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
                        onPress={() => setActiveTab('leaderboard')}
                    >
                        <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
                            Ranking
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
                        onPress={() => setActiveTab('achievements')}
                    >
                        <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
                            Logros
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'leaderboard' && renderLeaderboardTab()}
                {activeTab === 'achievements' && renderAchievementsTab()}

                {/* Info Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        💡 Tip: Reporta problemas de residuos para ganar más puntos
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: spacing.md,
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
    footer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: colors.neutral[600],
        textAlign: 'center',
    },
});
