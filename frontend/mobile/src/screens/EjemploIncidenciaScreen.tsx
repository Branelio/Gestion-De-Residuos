import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert, ScrollView } from 'react-native';
import { 
  incidenciasService, 
  TipoIncidencia, 
  ZonaIncidencia, 
  IncidenciaCreate,
  IncidenciaResponse 
} from '../services/incidenciasService';

/**
 * Componente de ejemplo para crear una incidencia
 * Puedes adaptar esto a tu diseño actual
 */
export default function EjemploIncidenciaScreen() {
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [ultimaIncidencia, setUltimaIncidencia] = useState<IncidenciaResponse | null>(null);

  // Ejemplo: Crear una incidencia
  const crearIncidenciaEjemplo = async () => {
    try {
      setLoading(true);

      // Datos de ejemplo - reemplaza con datos reales de tu app
      const incidenciaData: IncidenciaCreate = {
        tipo: TipoIncidencia.CONTENEDOR_LLENO,
        gravedad: 3, // 1-5
        descripcion: descripcion || 'Contenedor desbordado en el sector',
        lat: -0.9346, // Latitud de Latacunga - reemplaza con ubicación real
        lon: -78.6157, // Longitud de Latacunga - reemplaza con ubicación real
        zona: ZonaIncidencia.CENTRO,
        usuario_id: 1, // ID del usuario - obtén esto de tu autenticación
        foto_url: 'https://ejemplo.com/foto.jpg', // Opcional
        ventana_inicio: new Date().toISOString(),
        ventana_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +24 horas
      };

      console.log('📤 Enviando incidencia:', incidenciaData);
      const resultado = await incidenciasService.crearIncidencia(incidenciaData);
      
      setUltimaIncidencia(resultado);
      Alert.alert('Éxito', `Incidencia creada con ID: ${resultado.id}`);
      console.log('✅ Incidencia creada:', resultado);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ejemplo: Listar todas las incidencias
  const listarIncidencias = async () => {
    try {
      setLoading(true);
      const incidencias = await incidenciasService.listarIncidencias(0, 10);
      console.log('📋 Incidencias obtenidas:', incidencias);
      Alert.alert('Éxito', `Se encontraron ${incidencias.length} incidencias`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Ejemplo: Obtener estadísticas
  const obtenerEstadisticas = async () => {
    try {
      setLoading(true);
      const stats = await incidenciasService.obtenerEstadisticas();
      console.log('📊 Estadísticas:', stats);
      Alert.alert(
        'Estadísticas',
        `Total: ${stats.total_incidencias}\n` +
        `Pendientes: ${stats.pendientes}\n` +
        `En proceso: ${stats.en_proceso}\n` +
        `Resueltas: ${stats.resueltas}\n` +
        `Gravedad promedio: ${stats.gravedad_promedio.toFixed(2)}`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔗 Integración API EPAGAL</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crear Nueva Incidencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Descripción de la incidencia"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={3}
        />
        <Button
          title={loading ? 'Enviando...' : 'Crear Incidencia'}
          onPress={crearIncidenciaEjemplo}
          disabled={loading}
        />
      </View>

      {ultimaIncidencia && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Última Incidencia Creada</Text>
          <Text>ID: {ultimaIncidencia.id}</Text>
          <Text>Tipo: {ultimaIncidencia.tipo}</Text>
          <Text>Estado: {ultimaIncidencia.estado}</Text>
          <Text>Zona: {ultimaIncidencia.zona}</Text>
          <Text>Gravedad: {ultimaIncidencia.gravedad}/5</Text>
          <Text>Creado: {new Date(ultimaIncidencia.created_at).toLocaleString()}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Otras Acciones</Text>
        <Button
          title="Listar Incidencias"
          onPress={listarIncidencias}
          disabled={loading}
        />
        <View style={styles.spacing} />
        <Button
          title="Ver Estadísticas"
          onPress={obtenerEstadisticas}
          disabled={loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.infoTitle}>ℹ️ Información de la API</Text>
        <Text style={styles.infoText}>
          • Base URL: https://epagal-backend-routing-latest.onrender.com{'\n'}
          • Documentación: /docs{'\n'}
          • OpenAPI Spec: /openapi.json
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.infoTitle}>📝 Tipos de Incidencia</Text>
        <Text style={styles.infoText}>
          • CONTENEDOR_LLENO{'\n'}
          • RESIDUO_PELIGROSO{'\n'}
          • BASURA_ESPARCIDA{'\n'}
          • FALTA_RECOLECCION{'\n'}
          • PUNTO_CRITICO{'\n'}
          • OTRO
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.infoTitle}>🗺️ Zonas de Latacunga</Text>
        <Text style={styles.infoText}>
          • NORTE{'\n'}
          • SUR{'\n'}
          • CENTRO{'\n'}
          • ESTE{'\n'}
          • OESTE
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 60,
  },
  spacing: {
    height: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
