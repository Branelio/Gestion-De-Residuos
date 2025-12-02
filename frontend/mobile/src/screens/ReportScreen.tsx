import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { wasteReportService, ReportType } from '../services/wasteReportService';

interface ReportScreenProps {
  navigation: any;
}

interface ReportForm {
  type: ReportType | null;
  description: string;
  photoUri: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  address: string;
}

const reportTypes: Array<{ type: ReportType; label: string; icon: string; description: string }> = [
  { 
    type: ReportType.OVERFLOW, 
    label: 'Contenedor Lleno', 
    icon: '🗑️',
    description: 'El contenedor está desbordando'
  },
  { 
    type: ReportType.ILLEGAL_DUMP, 
    label: 'Basurero Ilegal', 
    icon: '🚫',
    description: 'Basura acumulada en lugar inadecuado'
  },
  { 
    type: ReportType.DAMAGED_CONTAINER, 
    label: 'Contenedor Dañado', 
    icon: '🔧',
    description: 'El contenedor está roto o dañado'
  },
  { 
    type: ReportType.MISSED_COLLECTION, 
    label: 'Recolección Perdida', 
    icon: '📅',
    description: 'No pasó el camión recolector'
  }
];

export default function ReportScreen({ navigation }: ReportScreenProps) {
  const userId = 'user123'; // TODO: Obtener del contexto de autenticación
  
  const [form, setForm] = useState<ReportForm>({
    type: null,
    description: '',
    photoUri: null,
    location: null,
    address: ''
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Solicitar permisos de cámara
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso Necesario',
        'Se necesita permiso para usar la cámara. Por favor habilítalo en configuración.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Solicitar permisos de galería
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso Necesario',
        'Se necesita permiso para acceder a la galería. Por favor habilítalo en configuración.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Tomar foto con cámara
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        setForm({ ...form, photoUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
    }
  };

  // Seleccionar foto de galería
  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        setForm({ ...form, photoUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      Alert.alert('Error', 'No se pudo seleccionar la foto. Intenta nuevamente.');
    }
  };

  // Obtener ubicación actual
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Necesario',
          'Se necesita permiso para acceder a tu ubicación.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setForm({
        ...form,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      });
      Alert.alert('✅ Ubicación Capturada', 'Tu ubicación ha sido registrada correctamente.');
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Intenta nuevamente.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    if (!form.type) {
      Alert.alert('Campo Requerido', 'Por favor selecciona el tipo de reporte.');
      return false;
    }
    if (!form.description.trim()) {
      Alert.alert('Campo Requerido', 'Por favor describe el problema.');
      return false;
    }
    if (!form.photoUri) {
      Alert.alert('Foto Requerida', 'Por favor toma o selecciona una foto del problema.');
      return false;
    }
    if (!form.location) {
      Alert.alert('Ubicación Requerida', 'Por favor captura tu ubicación actual.');
      return false;
    }
    return true;
  };

  // Enviar reporte
  const submitReport = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Integrar con API del backend
      // const response = await api.post('/waste-reports', {
      //   type: form.type,
      //   description: form.description,
      //   photo: form.photoUri,
      //   latitude: form.location!.latitude,
      //   longitude: form.location!.longitude
      // });

      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        '🎉 Reporte Enviado',
        '¡Gracias por contribuir! Has ganado puntos por tu reporte.',
        [
          {
            text: 'Ver Mis Puntos',
            onPress: () => navigation.navigate('Profile')
          },
          {
            text: 'Hacer Otro Reporte',
            onPress: () => {
              setForm({
                type: null,
                description: '',
                photoUri: null,
                location: form.location,
                address: form.address
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      Alert.alert('Error', 'No se pudo enviar el reporte. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Reportar Problema</Text>
          <Text style={styles.subtitle}>Ayúdanos a mantener Latacunga limpia</Text>
        </View>

        {/* Tipo de Reporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Tipo de Problema *</Text>
          <View style={styles.reportTypesGrid}>
            {reportTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.reportTypeCard,
                  form.type === item.type && styles.reportTypeCardActive
                ]}
                onPress={() => setForm({ ...form, type: item.type })}
              >
                <Text style={styles.reportTypeIcon}>{item.icon}</Text>
                <Text style={styles.reportTypeLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Descripción del Problema *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe detalladamente el problema..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            maxLength={500}
          />
          <Text style={styles.charCount}>{form.description.length}/500</Text>
        </View>

        {/* Foto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Fotografía *</Text>
          {form.photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: form.photoUri }} style={styles.photoImage} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setForm({ ...form, photoUri: null })}
              >
                <Text style={styles.removePhotoText}>✕ Quitar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Text style={styles.photoButtonIcon}>📷</Text>
                <Text style={styles.photoButtonText}>Tomar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonIcon}>🖼️</Text>
                <Text style={styles.photoButtonText}>Desde Galería</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Ubicación *</Text>
          {form.location ? (
            <View style={styles.locationCard}>
              <Text style={styles.locationIcon}>📍</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Ubicación Capturada</Text>
                <Text style={styles.locationCoords}>
                  {form.location.latitude.toFixed(6)}, {form.location.longitude.toFixed(6)}
                </Text>
              </View>
              <TouchableOpacity onPress={getCurrentLocation}>
                <Text style={styles.updateLocationText}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator color={colors.primary[600]} />
              ) : (
                <>
                  <Text style={styles.locationButtonIcon}>📍</Text>
                  <Text style={styles.locationButtonText}>Capturar Mi Ubicación</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Botón Enviar */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={submitReport}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator color="#fff" style={styles.submitLoader} />
                <Text style={styles.submitButtonText}>Enviando...</Text>
              </>
            ) : (
              <Text style={styles.submitButtonText}>📤 Enviar Reporte</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.rewardText}>🎁 Ganarás puntos por este reporte</Text>
        </View>

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <Text style={styles.infoText}>
            ℹ️ Tus reportes ayudan a EPAGAL a brindar un mejor servicio a la comunidad.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50]
  },
  scrollView: {
    flex: 1
  },
  header: {
    padding: spacing.lg,
    backgroundColor: '#fff'
  },
  backButton: {
    marginBottom: spacing.sm
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary[600],
    fontWeight: '500'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[600]
  },
  section: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral[200]
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.md
  },
  reportTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  reportTypeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  reportTypeCardActive: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  reportTypeIcon: {
    fontSize: 32,
    marginBottom: spacing.xs
  },
  reportTypeLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.neutral[700],
    fontWeight: '500'
  },
  textArea: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    minHeight: 120,
    textAlignVertical: 'top'
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: spacing.xs
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.md
  },
  photoButton: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[600],
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center'
  },
  photoButtonIcon: {
    fontSize: 40,
    marginBottom: spacing.sm
  },
  photoButtonText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600'
  },
  photoPreview: {
    position: 'relative'
  },
  photoImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: colors.neutral[100]
  },
  removePhotoButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20
  },
  removePhotoText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  locationButton: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[600],
    borderStyle: 'dashed',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm
  },
  locationButtonIcon: {
    fontSize: 24
  },
  locationButtonText: {
    fontSize: 16,
    color: colors.primary[600],
    fontWeight: '600'
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md
  },
  locationIcon: {
    fontSize: 32
  },
  locationInfo: {
    flex: 1
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2
  },
  locationCoords: {
    fontSize: 12,
    color: colors.neutral[600]
  },
  updateLocationText: {
    color: colors.primary[600],
    fontWeight: '600',
    fontSize: 14
  },
  submitSection: {
    padding: spacing.lg,
    paddingTop: spacing.xl
  },
  submitButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral[400]
  },
  submitLoader: {
    marginRight: spacing.sm
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  rewardText: {
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '500'
  },
  infoFooter: {
    padding: spacing.lg,
    paddingTop: 0
  },
  infoText: {
    fontSize: 13,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20
  }
});
