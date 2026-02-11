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
  type: string | null;
  description: string;
  photoUri: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  address: string;
  severity: number;
}

const reportTypes: Array<{ type: string; label: string; icon: string; description: string }> = [
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
    label: 'Punto Crítico',
    icon: '🔧',
    description: 'Zona con problemas graves de basura'
  },
  {
    type: ReportType.MISSED_COLLECTION,
    label: 'Recolección Perdida',
    icon: '📅',
    description: 'No pasó el camión recolector'
  },
  {
    type: ReportType.DANGEROUS,
    label: 'Residuo Peligroso',
    icon: '⚠️',
    description: 'Residuos peligrosos o tóxicos'
  }
];

export default function ReportScreen({ navigation }: ReportScreenProps) {
  const userId = 1; // TODO: Obtener del contexto de autenticación

  const [form, setForm] = useState<ReportForm>({
    type: null,
    description: '',
    photoUri: null,
    location: null,
    address: '',
    severity: 3
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
      // 1. Verificar si los servicios de ubicación están habilitados
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Servicios de Ubicación Deshabilitados',
          'Por favor habilita los servicios de ubicación (GPS) en la configuración de tu dispositivo para continuar.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir Configuración', onPress: () => {
                // En dispositivos reales, esto debería abrir la configuración
                Alert.alert('Instrucciones',
                  '1. Ve a Configuración del dispositivo\n' +
                  '2. Busca "Ubicación" o "Location"\n' +
                  '3. Activa los servicios de ubicación\n' +
                  '4. Regresa a la app e intenta nuevamente'
                );
              }
            }
          ]
        );
        setIsLoadingLocation(false);
        return;
      }

      // 2. Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Denegado',
          'La app necesita acceso a tu ubicación para reportar problemas de residuos. Por favor habilita el permiso en la configuración de tu dispositivo.',
          [
            { text: 'OK' }
          ]
        );
        setIsLoadingLocation(false);
        return;
      }

      // 3. Obtener ubicación con configuración optimizada
      console.log('📍 Obteniendo ubicación...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log('✅ Ubicación obtenida:', location.coords);

      setForm({
        ...form,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      });

      Alert.alert(
        '✅ Ubicación Capturada',
        `Lat: ${location.coords.latitude.toFixed(6)}\nLon: ${location.coords.longitude.toFixed(6)}`
      );
    } catch (error: any) {
      console.error('Error al obtener ubicación:', error);

      let errorMessage = 'No se pudo obtener tu ubicación. ';

      if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage += 'Los servicios de ubicación están deshabilitados.';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage += 'Ubicación no disponible. Intenta al aire libre o verifica tu GPS.';
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage += 'Tiempo de espera agotado. Verifica tu conexión GPS.';
      } else {
        errorMessage += 'Verifica que el GPS esté habilitado y tengas buena señal.';
      }

      Alert.alert(
        'Error de Ubicación',
        errorMessage + '\n\nConsejos:\n• Activa el GPS en configuración\n• Sal al exterior para mejor señal\n• Reinicia el dispositivo',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reintentar', onPress: getCurrentLocation },
          { text: 'Usar Ubicación de Prueba (Solo Desarrollo)', onPress: useMockLocation }
        ]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Usar ubicación de prueba (para desarrollo/testing)
  const useMockLocation = () => {
    const mockLocation = {
      latitude: -0.9346, // Centro de Latacunga
      longitude: -78.6157,
    };

    setForm({
      ...form,
      location: mockLocation
    });

    Alert.alert(
      '⚠️ Ubicación de Prueba',
      `Usando ubicación del centro de Latacunga\nLat: ${mockLocation.latitude}\nLon: ${mockLocation.longitude}\n\nEsto es solo para pruebas.`
    );
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
      console.log('📤 ========== ENVIANDO REPORTE A API EPAGAL ==========');
      console.log('📍 Ubicación capturada:', {
        latitude: form.location!.latitude,
        longitude: form.location!.longitude
      });

      // Crear reporte usando la API de EPAGAL
      const reportData = {
        userId: String(userId),
        type: form.type!,
        description: form.description,
        coordinates: {
          latitude: form.location!.latitude,
          longitude: form.location!.longitude,
        },
        photoUrl: form.photoUri || undefined,
        address: form.address || '',
      };

      console.log('📦 Datos del reporte:', JSON.stringify(reportData, null, 2));

      const result = await wasteReportService.createReport(reportData);

      console.log('✅ ========== REPORTE CREADO EXITOSAMENTE ==========');
      console.log('🆔 ID de incidencia:', result.id);
      console.log('📍 Ubicación guardada:', {
        lat: result.coordinates.latitude,
        lon: result.coordinates.longitude
      });
      console.log('📊 Datos completos:', result);

      Alert.alert(
        '🎉 Reporte Enviado',
        `¡Gracias por contribuir!\n\n` +
        `Incidencia #${result.id} registrada exitosamente\n` +
        `Ubicación: ${result.coordinates.latitude.toFixed(6)}, ${result.coordinates.longitude.toFixed(6)}\n` +
        `Estado: ${result.status}`,
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
                location: form.location, // Mantener la ubicación para el siguiente reporte
                address: form.address,
                severity: 3
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ ========== ERROR AL ENVIAR REPORTE ==========');
      console.error('Mensaje:', error.message);
      console.error('Detalles:', error);
      Alert.alert(
        '❌ Error al Enviar',
        error.message || 'No se pudo enviar el reporte. Verifica tu conexión a internet e intenta nuevamente.'
      );
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
          <Text style={styles.sectionSubtitle}>
            Captura tu ubicación actual para registrar el lugar exacto del problema
          </Text>
          {form.location ? (
            <View style={styles.locationCard}>
              <Text style={styles.locationIcon}>📍</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>✅ Ubicación Guardada</Text>
                <Text style={styles.locationCoords}>
                  Latitud: {form.location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationCoords}>
                  Longitud: {form.location.longitude.toFixed(6)}
                </Text>
                <Text style={styles.locationNote}>
                  Esta ubicación será enviada a la API de EPAGAL
                </Text>
              </View>
              <TouchableOpacity
                onPress={getCurrentLocation}
                style={styles.updateLocationButton}
              >
                <Text style={styles.updateLocationText}>🔄 Actualizar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <>
                  <ActivityIndicator color={colors.primary[600]} />
                  <Text style={styles.locationButtonText}>Obteniendo ubicación...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.locationButtonIcon}>📍</Text>
                  <Text style={styles.locationButtonText}>Capturar Mi Ubicación</Text>
                  <Text style={styles.locationButtonSubtext}>
                    Usaremos GPS para obtener tu posición exacta
                  </Text>
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
  sectionSubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
    lineHeight: 20
  },
  locationNote: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 4,
    fontStyle: 'italic'
  },
  updateLocationButton: {
    backgroundColor: colors.primary[100],
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  updateLocationText: {
    color: colors.primary[600],
    fontWeight: '600',
    fontSize: 14
  },
  locationButtonSubtext: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2
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
