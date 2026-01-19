// Component - Feedback Modal
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { feedbackService, FeedbackType } from '../services/feedbackService';
import { colors } from '../theme/colors';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  initialType?: FeedbackType;
  nearestPointId?: string;
}

export default function FeedbackModal({
  visible,
  onClose,
  userId,
  initialType = FeedbackType.APP_USABILITY,
  nearestPointId,
}: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>(initialType);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const feedbackTypes = [
    { value: FeedbackType.GEOLOCATION_ACCURACY, label: 'Precisión GPS' },
    { value: FeedbackType.APP_USABILITY, label: 'Usabilidad' },
    { value: FeedbackType.COLLECTION_POINT_ISSUE, label: 'Problema con Punto' },
    { value: FeedbackType.FEATURE_SUGGESTION, label: 'Sugerencia' },
    { value: FeedbackType.BUG_REPORT, label: 'Error/Bug' },
    { value: FeedbackType.OTHER, label: 'Otro' },
  ];

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    setSubmitting(true);

    try {
      // Obtener ubicación actual
      let userLocation;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          userLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        }
      } catch (error) {
        console.log('No se pudo obtener ubicación para feedback');
      }

      // Obtener información del dispositivo
      const deviceInfo = `${Device.brand || 'Unknown'} ${Device.modelName || ''} - ${Platform.OS} ${Platform.Version}`;

      const response = await feedbackService.submitFeedback({
        userId,
        type,
        rating,
        comment: comment.trim() || undefined,
        metadata: {
          userLocation,
          nearestPointId,
          appVersion: '1.0.0',
          deviceInfo,
        },
      });

      if (response.success) {
        Alert.alert(
          '¡Gracias!',
          'Tu feedback ha sido enviado correctamente. Nos ayuda a mejorar la app.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo enviar el feedback');
      }
    } catch (error) {
      console.error('Error al enviar feedback:', error);
      Alert.alert('Error', 'Ocurrió un error al enviar el feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setType(initialType);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Tu Opinión Nos Importa</Text>
            <Text style={styles.subtitle}>
              Ayúdanos a mejorar Latacunga Limpia
            </Text>

            {/* Tipo de Feedback */}
            <Text style={styles.label}>Tipo de Feedback:</Text>
            <View style={styles.typeContainer}>
              {feedbackTypes.map((ft) => (
                <TouchableOpacity
                  key={ft.value}
                  style={[
                    styles.typeButton,
                    type === ft.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setType(ft.value)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === ft.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {ft.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating */}
            <Text style={styles.label}>Calificación:</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {rating === 0 && 'Sin calificar'}
              {rating === 1 && 'Muy Malo'}
              {rating === 2 && 'Malo'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bueno'}
              {rating === 5 && 'Excelente'}
            </Text>

            {/* Comentario */}
            <Text style={styles.label}>Comentario (opcional):</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              maxLength={1000}
              placeholder="Cuéntanos más sobre tu experiencia..."
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitting || rating === 0}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Enviando...' : 'Enviar'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
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
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    marginTop: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'white',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 12,
    color: colors.text,
  },
  typeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 40,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
