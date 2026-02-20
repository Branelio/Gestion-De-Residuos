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
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { wasteReportService, ReportType } from '../services/wasteReportService';
import { useAuth } from '../contexts/AuthContext';
import SuccessModal from '../components/SuccessModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP * 2) / 3;

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

const reportTypes: Array<{ type: string; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }> = [
  {
    type: ReportType.OVERFLOW,
    label: 'Contenedor Lleno',
    icon: 'trash',
    description: 'El contenedor está desbordando'
  },
  {
    type: ReportType.ILLEGAL_DUMP,
    label: 'Basurero Ilegal',
    icon: 'ban',
    description: 'Basura acumulada en lugar inadecuado'
  },
  {
    type: ReportType.DAMAGED_CONTAINER,
    label: 'Punto Crítico',
    icon: 'build',
    description: 'Zona con problemas graves de basura'
  },
  {
    type: ReportType.MISSED_COLLECTION,
    label: 'Recolección Perdida',
    icon: 'calendar',
    description: 'No pasó el camión recolector'
  },
  {
    type: ReportType.DANGEROUS,
    label: 'Residuo Peligroso',
    icon: 'warning',
    description: 'Residuos peligrosos o tóxicos'
  }
];

export default function ReportScreen({ navigation }: ReportScreenProps) {
  const { user } = useAuth();
  const userId = user?.id || '1';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

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
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Servicios de Ubicación Deshabilitados',
          'Por favor habilita los servicios de ubicación (GPS) en la configuración de tu dispositivo para continuar.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir Configuración', onPress: () => {
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

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Denegado',
          'La app necesita acceso a tu ubicación para reportar problemas de residuos.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setForm({
        ...form,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      });
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
        errorMessage,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reintentar', onPress: getCurrentLocation },
          { text: 'Ubicación de Prueba', onPress: useMockLocation }
        ]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Usar ubicación de prueba (para desarrollo/testing)
  const useMockLocation = () => {
    const mockLocation = {
      latitude: -0.9346,
      longitude: -78.6157,
    };

    setForm({
      ...form,
      location: mockLocation
    });
  };

  // Mapa Modal State
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  const openMapSelector = async () => {
    if (!form.location) {
      // Intentar obtener ubicación actual primero
      setIsLoadingLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setTempLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });
        } else {
          // Default Latacunga
          setTempLocation({ latitude: -0.9346, longitude: -78.6157 });
        }
      } catch (e) {
        setTempLocation({ latitude: -0.9346, longitude: -78.6157 });
      } finally {
        setIsLoadingLocation(false);
      }
    } else {
      setTempLocation(form.location);
    }
    setMapModalVisible(true);
  };

  const saveLocationFromMap = () => {
    if (tempLocation) {
      setForm({ ...form, location: tempLocation });
    }
    setMapModalVisible(false);
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

      const result = await wasteReportService.createReport(reportData);

      setModalType('success');
      setModalTitle('¡Reporte Enviado!');
      setModalMessage(
        `Incidencia #${result.id} registrada exitosamente.\n\n` +
        `Tu reporte ayuda a mantener Latacunga más limpia. ¡Gracias por contribuir!`
      );
      setModalVisible(true);
    } catch (error: any) {
      console.error('Error al enviar reporte:', error);
      setModalType('error');
      setModalTitle('Error al Enviar');
      setModalMessage(
        error.message || 'No se pudo enviar el reporte. Verifica tu conexión a internet e intenta nuevamente.'
      );
      setModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      type: null,
      description: '',
      photoUri: null,
      location: form.location,
      address: form.address,
      severity: 3
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={colors.primary[600]} />
              <Text style={styles.backButtonText}>Atrás</Text>
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
                  <View style={[
                    styles.reportTypeIconContainer,
                    form.type === item.type && styles.reportTypeIconContainerActive
                  ]}>
                    <Ionicons
                      name={item.icon}
                      size={26}
                      color={form.type === item.type ? colors.primary[600] : colors.neutral[500]}
                    />
                  </View>
                  <Text style={[
                    styles.reportTypeLabel,
                    form.type === item.type && styles.reportTypeLabelActive
                  ]}>{item.label}</Text>
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
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.removePhotoText}>Quitar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={36} color={colors.primary[600]} />
                  <Text style={styles.photoButtonText}>Tomar Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                  <Ionicons name="images" size={36} color={colors.primary[600]} />
                  <Text style={styles.photoButtonText}>Desde Galería</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Ubicación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Ubicación *</Text>
            <Text style={styles.sectionSubtitle}>
              Toca el mapa para ajustar la ubicación exacta del problema.
            </Text>

            <View style={styles.locationContainer}>
              {form.location ? (
                <View style={{ borderRadius: 14, overflow: 'hidden', height: 200, borderWidth: 1, borderColor: colors.neutral[200] }}>
                  <MapView
                    style={{ flex: 1 }}
                    region={{
                      latitude: form.location.latitude,
                      longitude: form.location.longitude,
                      latitudeDelta: 0.002,
                      longitudeDelta: 0.002,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    onPress={openMapSelector}
                  >
                    <Marker coordinate={form.location} />
                  </MapView>
                  <TouchableOpacity
                    style={styles.editLocationButton}
                    onPress={openMapSelector}
                  >
                    <Ionicons name="map" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>Editar Ubicación</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={openMapSelector}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <>
                      <ActivityIndicator color={colors.primary[600]} />
                      <Text style={styles.locationButtonText}>Obteniendo GPS...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="map-outline" size={32} color={colors.primary[600]} />
                      <Text style={styles.locationButtonText}>Seleccionar en Mapa</Text>
                      <Text style={styles.locationButtonSubtext}>Usa el mapa para marcar el lugar</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {form.location && (
              <View style={styles.coordsRow}>
                <Ionicons name="location-outline" size={16} color={colors.neutral[500]} />
                <Text style={styles.coordsText}>
                  {form.location.latitude.toFixed(5)}, {form.location.longitude.toFixed(5)}
                </Text>
              </View>
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
                <>
                  <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Enviar Reporte</Text>
                </>
              )}
            </TouchableOpacity>
            <View style={styles.rewardRow}>
              <Ionicons name="gift" size={16} color={colors.primary[600]} />
              <Text style={styles.rewardText}>Ganarás puntos por este reporte</Text>
            </View>
          </View>

          {/* Info Footer */}
          <View style={styles.infoFooter}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={18} color={colors.neutral[500]} />
              <Text style={styles.infoText}>
                Tus reportes ayudan a EPAGAL a brindar un mejor servicio a la comunidad.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success/Error Modal */}
      <SuccessModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        buttons={
          modalType === 'success'
            ? [
              {
                text: 'Ver Mis Puntos',
                onPress: () => {
                  setModalVisible(false);
                  navigation.navigate('Profile');
                },
                style: 'primary',
                icon: 'trophy',
              },
              {
                text: 'Hacer Otro Reporte',
                onPress: () => {
                  setModalVisible(false);
                  resetForm();
                },
                style: 'secondary',
                icon: 'add-circle',
              },
            ]
            : [
              {
                text: 'Reintentar',
                onPress: () => {
                  setModalVisible(false);
                  submitReport();
                },
                style: 'primary',
                icon: 'refresh',
              },
              {
                text: 'Cerrar',
                onPress: () => setModalVisible(false),
                style: 'secondary',
              },
            ]
        }
        onClose={() => setModalVisible(false)}
      />

      {/* Modal de Selección de Ubicación en Mapa */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setMapModalVisible(false)} style={styles.backButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
              <Text style={[styles.backButtonText, { color: colors.text.primary }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { fontSize: 20, marginBottom: 0 }]}>Seleccionar Ubicación</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={{ flex: 1 }}>
            {tempLocation && (
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: tempLocation.latitude,
                  longitude: tempLocation.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                onPress={(e) => setTempLocation(e.nativeEvent.coordinate)}
              >
                <Marker coordinate={tempLocation} draggable />
              </MapView>
            )}
            <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <Text style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.8)', padding: 10, borderRadius: 10, marginBottom: 10 }}>
                Toca el mapa para mover el marcador
              </Text>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary[600] }]}
                onPress={saveLocationFromMap}
              >
                <Text style={styles.submitButtonText}>Confirmar Ubicación</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 4,
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
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  reportTypeCard: {
    width: CARD_WIDTH,
    minWidth: 95,
    backgroundColor: colors.neutral[50],
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTypeCardActive: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  reportTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reportTypeIconContainerActive: {
    backgroundColor: colors.primary[100],
  },
  reportTypeLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: colors.neutral[700],
    fontWeight: '500'
  },
  reportTypeLabelActive: {
    color: colors.primary[700],
    fontWeight: '600',
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
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: 4,
  },
  removePhotoText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  locationButton: {
    backgroundColor: colors.neutral[50],
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  locationIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1
  },
  locationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
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
  updateLocationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
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
  locationContainer: {
    marginTop: spacing.xs,
  },
  editLocationButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: colors.primary[600],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  coordsText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  submitButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 14,
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
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '500'
  },
  infoFooter: {
    padding: spacing.lg,
    paddingTop: 0
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 20
  }
});
