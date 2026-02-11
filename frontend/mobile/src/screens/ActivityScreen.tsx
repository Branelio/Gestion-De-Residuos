import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContext';

interface ActivityItem {
    id: string;
    type: 'REPORT' | 'POINTS' | 'BADGE' | 'LEVEL_UP';
    title: string;
    description: string;
    points?: number;
    date: Date;
    icon: string;
    color: string;
}

export default function ActivityScreen({ navigation }: any) {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'REPORTS' | 'POINTS'>('ALL');

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        setLoading(true);
        try {
            // Simular carga de actividades
            // En producción, esto vendría del API
            await new Promise(resolve => setTimeout(resolve, 800));

            // Generar actividades de ejemplo basadas en el usuario
            const mockActivities: ActivityItem[] = [
                {
                    id: '1',
                    type: 'REPORT',
                    title: 'Reporte enviado',
                    description: 'Contenedor desbordado en Av. Amazonas',
                    points: 10,
                    date: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
                    icon: '📋',
                    color: '#3B82F6',
                },
                {
                    id: '2',
                    type: 'POINTS',
                    title: 'Puntos recibidos',
                    description: 'Tu reporte fue verificado',
                    points: 5,
                    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                    icon: '⭐',
                    color: '#F59E0B',
                },
                {
                    id: '3',
                    type: 'BADGE',
                    title: 'Nuevo logro',
                    description: 'Obtu viste "Primer Reporte"',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                    icon: '🏆',
                    color: '#10B981',
                },
                {
                    id: '4',
                    type: 'LEVEL_UP',
                    title: 'Subiste de nivel',
                    description: 'Ahora eres Ciudadano Activo',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
                    icon: '🚀',
                    color: '#8B5CF6',
                },
                {
                    id: '5',
                    type: 'REPORT',
                    title: 'Reporte enviado',
                    description: 'Botadero ilegal cerca del parque',
                    points: 15,
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
                    icon: '📋',
                    color: '#3B82F6',
                },
                {
                    id: '6',
                    type: 'POINTS',
                    title: 'Bonificación semanal',
                    description: 'Por reportar 3 veces esta semana',
                    points: 20,
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
                    icon: '🎁',
                    color: '#EC4899',
                },
            ];

            setActivities(mockActivities);
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} horas`;
        if (days === 1) return 'Ayer';
        if (days < 7) return `Hace ${days} días`;
        return date.toLocaleDateString('es-EC');
    };

    const filteredActivities = activities.filter(activity => {
        if (filter === 'ALL') return true;
        if (filter === 'REPORTS') return activity.type === 'REPORT';
        if (filter === 'POINTS') return ['POINTS', 'BADGE', 'LEVEL_UP'].includes(activity.type);
        return true;
    });

    const FilterButton = ({ label, value }: { label: string; value: typeof filter }) => (
        <TouchableOpacity
            style={[styles.filterButton, filter === value && styles.filterButtonActive]}
            onPress={() => setFilter(value)}
        >
            <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const ActivityCard = ({ item }: { item: ActivityItem }) => (
        <View style={[styles.activityCard, { borderLeftColor: item.color }]}>
            <Text style={styles.activityIcon}>{item.icon}</Text>
            <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    {item.points && (
                        <Text style={styles.activityPoints}>+{item.points} pts</Text>
                    )}
                </View>
                <Text style={styles.activityDescription}>{item.description}</Text>
                <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
            </View>
        </View>
    );

    const getTotalPoints = () => {
        return activities.reduce((sum, a) => sum + (a.points || 0), 0);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>Cargando historial...</Text>
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
                <Text style={styles.title}>📜 Historial de Actividad</Text>
            </View>

            {/* Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{activities.length}</Text>
                    <Text style={styles.summaryLabel}>Actividades</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{getTotalPoints()}</Text>
                    <Text style={styles.summaryLabel}>Puntos ganados</Text>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <FilterButton label="Todo" value="ALL" />
                <FilterButton label="Reportes" value="REPORTS" />
                <FilterButton label="Puntos" value="POINTS" />
            </View>

            {/* Activities List */}
            {filteredActivities.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>No hay actividades aún</Text>
                    <Text style={styles.emptySubtext}>
                        Realiza tu primer reporte para comenzar
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredActivities}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ActivityCard item={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
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
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
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
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    summaryLabel: {
        fontSize: 13,
        color: colors.neutral[600],
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: colors.neutral[200],
        marginHorizontal: spacing.md,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    filterButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[100],
    },
    filterButtonActive: {
        backgroundColor: colors.primary[500],
    },
    filterButtonText: {
        fontSize: 14,
        color: colors.neutral[600],
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: 0,
    },
    activityCard: {
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    activityIcon: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    activityContent: {
        flex: 1,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    activityPoints: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    activityDescription: {
        fontSize: 14,
        color: colors.neutral[600],
        marginBottom: 4,
    },
    activityDate: {
        fontSize: 12,
        color: colors.neutral[400],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: spacing.sm,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.neutral[500],
        textAlign: 'center',
    },
});
