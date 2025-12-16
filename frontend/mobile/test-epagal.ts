/**
 * Script de prueba para la integración con API de EPAGAL
 * Prueba la creación de una incidencia
 */
import { incidenciasService, TipoIncidencia, ZonaIncidencia, IncidenciaResponse } from './src/services/incidenciasService';

async function testEPAGALIntegration() {
  console.log('\n🧪 === PRUEBA DE INTEGRACIÓN CON API EPAGAL ===\n');

  try {
    // 1. Crear una incidencia de prueba
    console.log('📤 Creando incidencia de prueba...');
    const incidenciaTest = {
      tipo: TipoIncidencia.CONTENEDOR_LLENO,
      gravedad: 3,
      descripcion: 'Incidencia de prueba desde la app móvil - Contenedor lleno',
      lat: -0.9346, // Latacunga centro
      lon: -78.6157,
      zona: ZonaIncidencia.CENTRO,
      usuario_id: 1,
      ventana_inicio: new Date().toISOString(),
      ventana_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const resultado = await incidenciasService.crearIncidencia(incidenciaTest);
    console.log('✅ Incidencia creada exitosamente:');
    console.log(`   ID: ${resultado.id}`);
    console.log(`   Tipo: ${resultado.tipo}`);
    console.log(`   Estado: ${resultado.estado}`);
    console.log(`   Zona: ${resultado.zona}`);
    console.log(`   Gravedad: ${resultado.gravedad}/5`);
    console.log(`   Creado: ${resultado.created_at}`);

    // 2. Listar incidencias
    console.log('\n📋 Listando incidencias...');
    const incidencias = await incidenciasService.listarIncidencias(0, 5);
    console.log(`✅ Se encontraron ${incidencias.length} incidencias`);
    incidencias.forEach((inc: IncidenciaResponse) => {
      console.log(`   - #${inc.id}: ${inc.tipo} (${inc.estado})`);
    });

    // 3. Obtener estadísticas
    console.log('\n📊 Obteniendo estadísticas...');
    const stats = await incidenciasService.obtenerEstadisticas();
    console.log('✅ Estadísticas:');
    console.log(`   Total: ${stats.total_incidencias}`);
    console.log(`   Pendientes: ${stats.pendientes}`);
    console.log(`   En proceso: ${stats.en_proceso}`);
    console.log(`   Resueltas: ${stats.resueltas}`);
    console.log(`   Gravedad promedio: ${stats.gravedad_promedio.toFixed(2)}`);

    // 4. Obtener la incidencia que acabamos de crear
    console.log(`\n🔍 Obteniendo incidencia #${resultado.id}...`);
    const incidenciaObtenida = await incidenciasService.obtenerIncidencia(resultado.id);
    console.log('✅ Incidencia obtenida:');
    console.log(`   Descripción: ${incidenciaObtenida.descripcion}`);
    console.log(`   Ubicación: ${incidenciaObtenida.lat}, ${incidenciaObtenida.lon}`);

    console.log('\n✅ === TODAS LAS PRUEBAS PASARON EXITOSAMENTE ===\n');
  } catch (error: any) {
    console.error('\n❌ === ERROR EN LA PRUEBA ===');
    console.error(`Mensaje: ${error.message}`);
    console.error(`Detalles:`, error.response?.data || error);
    console.error('\n');
    process.exit(1);
  }
}

// Ejecutar prueba
testEPAGALIntegration()
  .then(() => {
    console.log('🎉 Prueba finalizada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
