import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface EducationScreenProps {
    navigation: any;
}

interface EducationCategory {
    id: string;
    title: string;
    icon: string;
    color: string;
    content: string[];
}

const educationCategories: EducationCategory[] = [
    {
        id: 'recycling',
        title: '♻️ ¿Qué es el Reciclaje?',
        icon: '♻️',
        color: '#10B981',
        content: [
            'El reciclaje es el proceso de convertir materiales de desecho en nuevos productos.',
            'Reduce la cantidad de residuos en vertederos y conserva los recursos naturales.',
            'Ahorra energía y reduce las emisiones de gases de efecto invernadero.',
            'Cada vez que reciclas, ayudas a proteger el medio ambiente de Latacunga.',
        ],
    },
    {
        id: 'waste-types',
        title: '🗑️ Tipos de Residuos',
        icon: '🗑️',
        color: '#3B82F6',
        content: [
            '🟢 ORGÁNICOS: Restos de comida, cáscaras, hojas, café molido.',
            '🔵 PLÁSTICOS: Botellas, envases, bolsas, tapas.',
            '🟡 PAPEL/CARTÓN: Periódicos, cajas, cuadernos, revistas.',
            '⚪ VIDRIO: Botellas, frascos, vasos (sin romper).',
            '🔴 PELIGROSOS: Pilas, baterías, medicamentos, químicos.',
            '⚫ NO RECICLABLES: Pañales, papel higiénico, colillas.',
        ],
    },
    {
        id: 'containers',
        title: '🎨 Colores de Contenedores',
        icon: '🎨',
        color: '#8B5CF6',
        content: [
            '🟢 VERDE: Residuos orgánicos y biodegradables.',
            '🔵 AZUL: Papel y cartón limpio.',
            '🟡 AMARILLO: Plásticos y envases.',
            '⚪ BLANCO: Vidrio.',
            '🔴 ROJO: Residuos peligrosos.',
            '⚫ NEGRO/GRIS: Residuos no reciclables.',
        ],
    },
    {
        id: 'tips',
        title: '💡 Tips para Reducir Residuos',
        icon: '💡',
        color: '#F59E0B',
        content: [
            '🛒 Lleva bolsas reutilizables cuando vayas de compras.',
            '🍶 Usa botellas de agua reutilizables.',
            '📦 Prefiere productos con menos empaque.',
            '🥡 Evita productos de un solo uso.',
            '🔧 Repara en lugar de reemplazar.',
            '🎁 Dona lo que ya no uses en lugar de tirarlo.',
            '🍎 Composta los residuos orgánicos.',
            '📝 Piensa antes de imprimir, ¡usa digital!',
        ],
    },
    {
        id: 'impact',
        title: '🌍 Impacto Ambiental',
        icon: '🌍',
        color: '#EF4444',
        content: [
            '📊 Una persona genera en promedio 1 kg de basura al día.',
            '🌳 Reciclar 1 tonelada de papel salva 17 árboles.',
            '⚡ Reciclar aluminio ahorra 95% de energía.',
            '🌊 El plástico tarda hasta 500 años en degradarse.',
            '🔄 Ecuador genera 4.1 millones de toneladas de residuos al año.',
            '📈 Con tu ayuda, Latacunga puede reducir sus residuos en un 30%.',
        ],
    },
    {
        id: 'latacunga',
        title: '🏙️ Latacunga Limpia',
        icon: '🏙️',
        color: '#06B6D4',
        content: [
            '🗓️ Horarios de recolección varían por zona.',
            '📍 Hay 22 puntos de acopio georeferenciados.',
            '📱 Usa la app para encontrar el más cercano.',
            '🏆 Gana puntos reportando problemas.',
            '💰 Canjea descuentos en tasas municipales.',
            '🤝 EPAGAL trabaja para una ciudad más limpia.',
        ],
    },
];

export default function EducationScreen({ navigation }: EducationScreenProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>('recycling');

    const toggleCategory = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="arrow-back" size={18} color={colors.primary[600]} />
                            <Text style={styles.backButtonText}>Atrás</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="book" size={24} color={colors.neutral[900]} />
                        <Text style={styles.title}>Educación Ambiental</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Aprende sobre reciclaje y cuida el medio ambiente
                    </Text>
                </View>

                {/* Intro Card */}
                <View style={styles.introCard}>
                    <Ionicons name="leaf" size={36} color={colors.primary[600]} />
                    <Text style={styles.introText}>
                        ¡Bienvenido! Aquí encontrarás información valiosa para contribuir a un Latacunga más limpio y sostenible.
                    </Text>
                </View>

                {/* Categories */}
                <View style={styles.categoriesContainer}>
                    {educationCategories.map((category) => (
                        <View key={category.id} style={styles.categoryWrapper}>
                            <TouchableOpacity
                                style={[
                                    styles.categoryHeader,
                                    { borderLeftColor: category.color },
                                    expandedCategory === category.id && styles.categoryHeaderActive,
                                ]}
                                onPress={() => toggleCategory(category.id)}
                            >
                                <Text style={styles.categoryTitle}>{category.title}</Text>
                                <Ionicons name={expandedCategory === category.id ? 'chevron-down' : 'chevron-forward'} size={16} color={colors.neutral[500]} />
                            </TouchableOpacity>

                            {expandedCategory === category.id && (
                                <View style={[styles.categoryContent, { borderLeftColor: category.color }]}>
                                    {category.content.map((item, index) => (
                                        <View key={index} style={styles.contentItem}>
                                            <Text style={styles.contentText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Quiz Banner */}
                <TouchableOpacity style={styles.quizBanner}>
                    <Ionicons name="bulb" size={36} color="#fff" />
                    <View style={styles.quizTextContainer}>
                        <Text style={styles.quizTitle}>¿Cuánto sabes sobre reciclaje?</Text>
                        <Text style={styles.quizSubtitle}>Próximamente: Quiz Interactivo</Text>
                    </View>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Ionicons name="leaf" size={16} color={colors.neutral[600]} />
                        <Text style={styles.footerText}>Cada pequeña acción cuenta para un futuro más verde</Text>
                    </View>
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
    introCard: {
        backgroundColor: colors.primary[50],
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    introIcon: {
        fontSize: 40,
    },
    introText: {
        flex: 1,
        fontSize: 14,
        color: colors.neutral[700],
        lineHeight: 20,
    },
    categoriesContainer: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    categoryWrapper: {
        marginBottom: spacing.sm,
    },
    categoryHeader: {
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadows.sm,
    },
    categoryHeaderActive: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[900],
        flex: 1,
    },
    expandIcon: {
        fontSize: 12,
        color: colors.neutral[500],
    },
    categoryContent: {
        backgroundColor: '#fff',
        padding: spacing.md,
        paddingTop: 0,
        borderBottomLeftRadius: borderRadius.lg,
        borderBottomRightRadius: borderRadius.lg,
        borderLeftWidth: 4,
        ...shadows.sm,
    },
    contentItem: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    contentText: {
        fontSize: 14,
        color: colors.neutral[700],
        lineHeight: 20,
    },
    quizBanner: {
        backgroundColor: colors.secondary[500],
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        ...shadows.md,
    },
    quizIcon: {
        fontSize: 40,
    },
    quizTextContainer: {
        flex: 1,
    },
    quizTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    quizSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    footer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: colors.neutral[600],
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
