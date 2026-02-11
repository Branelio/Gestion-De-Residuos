import React, { useState, useEffect, useCallback } from 'react';
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
import * as Location from 'expo-location';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { collectionPointService, CollectionPoint } from '../services/collectionPointService';

interface MyRoutesScreenProps {
    navigation: any;
}

interface RouteSchedule {
    zone: string;
    days: string;
    time: string;
    status: 'active' | 'completed' | 'upcoming';
}

// Horarios de recolección por zona (datos de EPAGAL)
const routeSchedules: RouteSchedule[] = [
    { zone: 'Centro Histórico', days: 'Lunes, Miércoles, Viernes', time: '06:00 - 12:00', status: 'active' },
    { zone: 'Zona Norte', days: 'Martes, Jueves, Sábado', time: '07:00 - 13:00', status: 'upcoming' },
    { zone: 'Zona Sur', days: 'Lunes, Miércoles, Viernes', time: '14:00 - 20:00', status: 'completed' },
    { zone: 'Zona Este', days: 'Martes, Jueves, Sábado', time: '06:00 - 12:00', status: 'upcoming' },
    { zone: 'Zona Oeste', days: 'Lunes, Miércoles, Viernes', time: '07:00 - 13:00', status: 'active' },
];

export default function MyRoutesScreen({ navigation }: MyRoutesScreenProps) {
    const [nearbyPoints, setNearbyPoints] = useState<CollectionPoint[]>([]);
    const [userZone, setUserZone] = useState<string>('Centro');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const determineZone = useCallback((lat: number, lon: number): string => {
        const latCenter = -0.9346;
        const lonCenter = -78.6157;

        const latDiff = lat - latCenter;
        const lonDiff = lon - lonCenter;

        const centerThreshold = 0.01;

        if (Math.abs(latDiff) < centerThreshold && Math.abs(lonDiff) < centerThreshold) {
            return 'Centro Histórico';
        }

        const absLatDiff = Math.abs(latDiff);
        const absLonDiff = Math.abs(lonDiff);

        if (absLatDiff > absLonDiff) {
            return latDiff > 0 ? 'Zona Norte' : 'Zona Sur';
        } else {
            return lonDiff > 0 ? 'Zona Este' : 'Zona Oeste';
        }
    }, []);

    const loadData = useCallback(async () => {
        try {
            // Obtener ubicación
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setLocationError('Se requiere permiso de ubicación para mostrar rutas cercanas');
                setLoading(false);
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);

            // Determinar zona del usuario
            const zone = determineZone(
                currentLocation.coords.latitude,
                currentLocation.coords.longitude
            );
            setUserZone(zone);

            // Obtener puntos cercanos
            const points = await collectionPointService.getNearbyPoints(
                currentLocation.coords.latitude,
                currentLocation.coords.longitude,
                5 // 5km radio
            );
            setNearbyPoints(points.slice(0, 5)); // Solo los 5 más cercanos

        } catch (error) {
            console.error('Error cargando datos:', error);
            setLocationError('Error al obtener la ubicación');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [determineZone]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return colors.success[500];
            case 'completed': return colors.neutral[400];
            case 'upcoming': return colors.warning[500];
            default: return colors.neutral[400];
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return '🟢 En Curso';
            case 'completed': return '✅ Completada';
            case 'upcoming': return '🔜 Próxima';
            default: return status;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={styles.loadingText}>Buscando rutas cercanas...</Text>
            </View>
        );
    }

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
                        <Text style={styles.backButtonText}>← Atrás</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>🚛 Rutas de Recolección</Text>
                    <Text style={styles.subtitle}>
                        Horarios y puntos de recolección cerca de ti
                    </Text>
                </View>

                {/* User Zone Card */}
                <View style={styles.zoneCard}>
                    <Text style={styles.zoneIcon}>📍</Text>
                    <View style={styles.zoneInfo}>
                        <Text style={styles.zoneLabel}>Tu ubicación</Text>
                        <Text style={styles.zoneName}>{userZone}</Text>
                        {locationError && (
                            <Text style={styles.errorText}>{locationError}</Text>
                        )}
                    </View>
                </View>

                {/* Schedules Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Horarios de Recolección</Text>
                    <Text style={styles.sectionSubtitle}>Por zona de Latacunga</Text>

                    <View style={styles.schedulesList}>
                        {routeSchedules.map((schedule, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.scheduleItem,
                                    schedule.zone === userZone && styles.scheduleItemActive,
                                ]}
                            >
                                <View style={styles.scheduleHeader}>
                                    <Text style={styles.scheduleZone}>{schedule.zone}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
                                        <Text style={styles.statusText}>{getStatusText(schedule.status)}</Text>
                                    </View>
                                </View>
                                <View style={styles.scheduleDetails}>
                                    <Text style={styles.scheduleDetail}>📆 {schedule.days}</Text>
                                    <Text style={styles.scheduleDetail}>🕐 {schedule.time}</Text>
                                </View>
                                {schedule.zone === userZone && (
                                    <View style={styles.yourZoneBadge}>
                                        <Text style={styles.yourZoneText}>🏠 Tu zona</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Nearby Points Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📦 Puntos de Acopio Cercanos</Text>
                    <Text style={styles.sectionSubtitle}>Los 5 más cercanos a tu ubicación</Text>

                    {nearbyPoints.length > 0 ? (
                        <View style={styles.pointsList}>
                            {nearbyPoints.map((point, index) => (
                                <TouchableOpacity
                                    key={`point-${index}`}
                                    style={styles.pointItem}
                                    onPress={() => navigation.navigate('Map', { selectedPoint: point })}
                                >
                                    <View style={styles.pointIndex}>
                                        <Text style={styles.pointIndexText}>{index + 1}</Text>
                                    </View>
                                    <View style={styles.pointInfo}>
                                        <Text style={styles.pointName}>{point.name}</Text>
                                        <Text style={styles.pointAddress}>{point.address}</Text>
                                        <View style={styles.pointStats}>
                                            <Text style={styles.pointStat}>
                                                📊 {point.fillPercentage}% lleno
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.pointArrow}>→</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📍</Text>
                            <Text style={styles.emptyText}>
                                {locationError
                                    ? 'No se pudo obtener la ubicación'
                                    : 'No hay puntos de acopio cercanos'
                                }
                            </Text>
                        </View>
                    )}
                </View>

                {/* Tips Section */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>💡 Consejos</Text>
                    <Text style={styles.tipItem}>• Saca la basura 30 minutos antes del horario</Text>
                    <Text style={styles.tipItem}>• Separa los residuos por tipo</Text>
                    <Text style={styles.tipItem}>• Usa bolsas resistentes para evitar derrames</Text>
                    <Text style={styles.tipItem}>• Reporta si el camión no pasa a tiempo</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Datos proporcionados por EPAGAL
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
    zoneCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[50],
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        gap: spacing.md,
        ...shadows.sm,
    },
    zoneIcon: {
        fontSize: 36,
    },
    zoneInfo: {
        flex: 1,
    },
    zoneLabel: {
        fontSize: 12,
        color: colors.neutral[600],
    },
    zoneName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary[700],
    },
    errorText: {
        fontSize: 12,
        color: colors.error[500],
        marginTop: spacing.xs,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.neutral[600],
        marginBottom: spacing.md,
    },
    schedulesList: {
        gap: spacing.sm,
    },
    scheduleItem: {
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.neutral[200],
        ...shadows.sm,
    },
    scheduleItemActive: {
        borderLeftColor: colors.primary[500],
        backgroundColor: colors.primary[50],
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    scheduleZone: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[900],
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    scheduleDetails: {
        gap: spacing.xs,
    },
    scheduleDetail: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    yourZoneBadge: {
        marginTop: spacing.sm,
        alignSelf: 'flex-start',
    },
    yourZoneText: {
        fontSize: 12,
        color: colors.primary[600],
        fontWeight: '600',
    },
    pointsList: {
        gap: spacing.sm,
    },
    pointItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.md,
        ...shadows.sm,
    },
    pointIndex: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
    pointIndexText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    pointInfo: {
        flex: 1,
    },
    pointName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[900],
    },
    pointAddress: {
        fontSize: 12,
        color: colors.neutral[600],
    },
    pointStats: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    pointStat: {
        fontSize: 11,
        color: colors.neutral[500],
    },
    pointArrow: {
        fontSize: 18,
        color: colors.neutral[400],
    },
    emptyState: {
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: '#fff',
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: 14,
        color: colors.neutral[600],
        textAlign: 'center',
    },
    tipsCard: {
        backgroundColor: colors.warning[50],
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning[500],
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: spacing.sm,
    },
    tipItem: {
        fontSize: 13,
        color: colors.neutral[700],
        marginBottom: spacing.xs,
    },
    footer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: colors.neutral[500],
        fontStyle: 'italic',
    },
});
