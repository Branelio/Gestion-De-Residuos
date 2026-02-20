import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, borderRadius, shadows } from '../theme';

interface Location {
    latitude: number;
    longitude: number;
}

interface MapMarker {
    id: string;
    coordinate: Location;
    title?: string;
    description?: string;
    pinColor?: string;
}

interface CustomMapProps {
    initialRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    markers?: MapMarker[];
    style?: any;
    showsUserLocation?: boolean;
    onPress?: (event: any) => void;
    scrollEnabled?: boolean;
    zoomEnabled?: boolean;
}

const { width } = Dimensions.get('window');

export default function CustomMap({
    initialRegion,
    markers = [],
    style,
    showsUserLocation = true,
    onPress,
    scrollEnabled = true,
    zoomEnabled = true,
}: CustomMapProps) {
    // Region por defecto (Latacunga)
    const defaultRegion = {
        latitude: -0.9346,
        longitude: -78.6157,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <View style={[styles.container, style]}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion || defaultRegion}
                showsUserLocation={showsUserLocation}
                onPress={onPress}
                scrollEnabled={scrollEnabled}
                zoomEnabled={zoomEnabled}
            // provider={PROVIDER_GOOGLE} // Descomentar para usar Google Maps por defecto
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        coordinate={marker.coordinate}
                        title={marker.title}
                        description={marker.description}
                        pinColor={marker.pinColor || colors.primary[600]}
                    />
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: colors.neutral[100],
        ...shadows.sm,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
