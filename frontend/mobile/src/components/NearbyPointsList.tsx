import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { CollectionPoint } from '../services/collectionPointService';

interface NearbyPointsListProps {
    points: CollectionPoint[];
    onPointPress?: (point: CollectionPoint) => void;
    loading?: boolean;
}

export default function NearbyPointsList({ points, onPointPress, loading }: NearbyPointsListProps) {
    // Sort or filter logic could go here, but we assume 'points' are already sorted/filtered by parent
    const topPoints = points.slice(0, 3);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Buscando puntos cercanos...</Text>
            </View>
        );
    }

    if (topPoints.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No hay puntos de recolección cercanos.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {topPoints.map((point) => (
                <TouchableOpacity
                    key={typeof point.id === 'string' ? point.id : point.id.value}
                    style={styles.card}
                    onPress={() => onPointPress && onPointPress(point)}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="trash-bin" size={24} color={colors.primary[600]} />
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.name} numberOfLines={1}>{point.name}</Text>
                        <Text style={styles.address} numberOfLines={1}>{point.address}</Text>
                        <View style={styles.statusRow}>
                            <Ionicons
                                name={point.status === 'AVAILABLE' ? 'checkmark-circle' : 'alert-circle'}
                                size={12}
                                color={point.status === 'AVAILABLE' ? colors.success[500] : colors.error[500]}
                            />
                            <Text style={[
                                styles.statusText,
                                { color: point.status === 'AVAILABLE' ? colors.success[600] : colors.error[600] }
                            ]}>
                                {point.status === 'AVAILABLE' ? 'Disponible' : 'Lleno/Mantenimiento'}
                            </Text>
                            {/* Simular distancia si no viene en el backend por ahora */}
                            <Text style={styles.distanceText}>• Aprox. 5 min</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.sm,
        gap: spacing.sm,
    },
    loadingText: {
        textAlign: 'center',
        color: colors.text.secondary,
        padding: spacing.lg,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.text.secondary,
        padding: spacing.lg,
        fontStyle: 'italic',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 2,
    },
    address: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    distanceText: {
        fontSize: 10,
        color: colors.text.secondary,
    }
});
