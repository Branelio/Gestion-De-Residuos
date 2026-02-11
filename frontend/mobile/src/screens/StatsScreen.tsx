import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContext';

interface StatsData {
    totalReports: number;
    resolvedReports: number;
    totalPoints: number;
    kgReported: number;
    co2Saved: number;
    treesEquivalent: number;
    monthlyReports: number;
    rank: number;
}

export default function StatsScreen({ navigation }: any) {
    const { user } = useAuth();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            // Simular carga de estadísticas del backend
            // En producción, esto vendría del API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Datos calculados basados en puntos del usuario
            const userPoints = user?.points || 0;
            const reportsCount = user?.reportsCount || 0;

            setStats({
                totalReports: reportsCount,
                resolvedReports: Math.floor(reportsCount * 0.7),
                totalPoints: userPoints,
                kgReported: reportsCount * 5.2, // Estimado: 5.2 kg por reporte
                co2Saved: reportsCount * 2.8, // Estimado: 2.8 kg CO2 por reporte
                treesEquivalent: Math.floor(reportsCount * 0.15), // 1 árbol = ~7 reportes
                monthlyReports: Math.min(reportsCount, 5),
                rank: Math.max(1, 100 - userPoints), // Ranking estimado
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({
        icon,
        value,
        label,
        color,
        suffix = ''
    }: {
        icon: string;
        value: number;
        label: string;
        color: string;
        suffix?: string;
    }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color }]}>
                    {value.toFixed(1)}{suffix}
                </Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>Cargando estadísticas...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Atrás</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>📊 Mi Impacto Ambiental</Text>
                    <Text style={styles.subtitle}>
                        Tu contribución a Latacunga Limpia
                    </Text>
                </View>

                {/* User Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryIcon}>🌍</Text>
                    <Text style={styles.summaryTitle}>
                        ¡Gracias por cuidar el planeta!
                    </Text>
                    <Text style={styles.summaryText}>
                        Has contribuido con {stats?.totalReports || 0} reportes para mantener
                        Latacunga más limpia y sostenible.
                    </Text>
                </View>

                {/* Impact Stats */}
                <Text style={styles.sectionTitle}>🌿 Tu Impacto Ecológico</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="📦"
                        value={stats?.kgReported || 0}
                        label="Kg de residuos reportados"
                        color="#10B981"
                        suffix=" kg"
                    />
                    <StatCard
                        icon="💨"
                        value={stats?.co2Saved || 0}
                        label="Kg de CO₂ evitado"
                        color="#3B82F6"
                        suffix=" kg"
                    />
                    <StatCard
                        icon="🌳"
                        value={stats?.treesEquivalent || 0}
                        label="Árboles equivalentes salvados"
                        color="#059669"
                    />
                </View>

                {/* Activity Stats */}
                <Text style={styles.sectionTitle}>📈 Tu Actividad</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="📋"
                        value={stats?.totalReports || 0}
                        label="Reportes totales"
                        color="#6366F1"
                    />
                    <StatCard
                        icon="✅"
                        value={stats?.resolvedReports || 0}
                        label="Reportes resueltos"
                        color="#10B981"
                    />
                    <StatCard
                        icon="⭐"
                        value={stats?.totalPoints || 0}
                        label="Puntos acumulados"
                        color="#F59E0B"
                    />
                </View>

                {/* Ranking */}
                <View style={styles.rankingCard}>
                    <Text style={styles.rankingIcon}>🏆</Text>
                    <View style={styles.rankingInfo}>
                        <Text style={styles.rankingTitle}>Tu Ranking en Latacunga</Text>
                        <Text style={styles.rankingValue}>
                            #{stats?.rank || '--'} de usuarios activos
                        </Text>
                    </View>
                </View>

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>💡 Sigue mejorando</Text>
                    <Text style={styles.tipsText}>
                        • Reporta contenedores llenos cuando los veas{'\n'}
                        • Comparte la app con amigos para multiplicar el impacto{'\n'}
                        • Participa en campañas de limpieza
                    </Text>
                </View>

                {/* Refresh Button */}
                <TouchableOpacity style={styles.refreshButton} onPress={loadStats}>
                    <Text style={styles.refreshButtonText}>🔄 Actualizar estadísticas</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.text.secondary,
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
    summaryCard: {
        backgroundColor: colors.primary[500],
        margin: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        ...shadows.lg,
    },
    summaryIcon: {
        fontSize: 50,
        marginBottom: spacing.md,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    summaryText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[800],
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    statsGrid: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    statIcon: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    statInfo: {
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 13,
        color: colors.neutral[600],
    },
    rankingCard: {
        backgroundColor: '#FEF3C7',
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    rankingIcon: {
        fontSize: 40,
        marginRight: spacing.md,
    },
    rankingInfo: {
        flex: 1,
    },
    rankingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.neutral[800],
    },
    rankingValue: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    tipsCard: {
        backgroundColor: '#E0F2FE',
        margin: spacing.lg,
        marginTop: 0,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: '#0EA5E9',
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.neutral[800],
        marginBottom: spacing.sm,
    },
    tipsText: {
        fontSize: 14,
        color: colors.neutral[700],
        lineHeight: 22,
    },
    refreshButton: {
        backgroundColor: colors.primary[100],
        marginHorizontal: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary[700],
    },
});
