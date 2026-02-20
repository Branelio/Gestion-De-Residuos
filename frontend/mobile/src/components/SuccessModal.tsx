import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SuccessModalButton {
    text: string;
    onPress: () => void;
    style?: 'primary' | 'secondary';
    icon?: keyof typeof Ionicons.glyphMap;
}

interface SuccessModalProps {
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    buttons: SuccessModalButton[];
    onClose?: () => void;
}

const modalConfig = {
    success: {
        icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
        color: '#10B981',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
    },
    error: {
        icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
        color: '#EF4444',
        bgColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    warning: {
        icon: 'warning' as keyof typeof Ionicons.glyphMap,
        color: '#F59E0B',
        bgColor: '#FFFBEB',
        borderColor: '#FDE68A',
    },
    info: {
        icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
    },
};

export default function SuccessModal({
    visible,
    type,
    title,
    message,
    buttons,
    onClose,
}: SuccessModalProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const iconAnim = useRef(new Animated.Value(0)).current;
    const config = modalConfig[type];

    useEffect(() => {
        if (visible) {
            scaleAnim.setValue(0);
            iconAnim.setValue(0);
            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.spring(iconAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 5,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    {/* Icon Circle */}
                    <Animated.View
                        style={[
                            styles.iconCircle,
                            {
                                backgroundColor: config.bgColor,
                                borderColor: config.borderColor,
                                transform: [
                                    {
                                        scale: iconAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.5, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <Ionicons name={config.icon} size={48} color={config.color} />
                    </Animated.View>

                    {/* Content */}
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    button.style === 'secondary'
                                        ? styles.buttonSecondary
                                        : [styles.buttonPrimary, { backgroundColor: config.color }],
                                ]}
                                onPress={button.onPress}
                                activeOpacity={0.8}
                            >
                                {button.icon && (
                                    <Ionicons
                                        name={button.icon}
                                        size={18}
                                        color={button.style === 'secondary' ? colors.neutral[700] : '#FFFFFF'}
                                        style={{ marginRight: 6 }}
                                    />
                                )}
                                <Text
                                    style={[
                                        styles.buttonText,
                                        button.style === 'secondary'
                                            ? styles.buttonTextSecondary
                                            : styles.buttonTextPrimary,
                                    ]}
                                >
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: spacing.xl,
        width: Math.min(SCREEN_WIDTH - 48, 380),
        alignItems: 'center',
        ...shadows.lg,
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.neutral[900],
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        fontSize: 15,
        color: colors.neutral[600],
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    buttonContainer: {
        width: '100%',
        gap: spacing.sm,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: spacing.lg,
        borderRadius: 14,
    },
    buttonPrimary: {
        ...shadows.sm,
    },
    buttonSecondary: {
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextPrimary: {
        color: '#FFFFFF',
    },
    buttonTextSecondary: {
        color: colors.neutral[700],
    },
});
