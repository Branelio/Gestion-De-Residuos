/**
 * Seed para Rewards (Recompensas)
 * Crea recompensas iniciales simuladas para el sistema
 */

import mongoose from 'mongoose';
import { RewardModel } from '../../persistence/RewardModel';

export async function seedRewards() {
    try {
        console.log('🎁 Iniciando seed de rewards...');

        // Limpiar rewards existentes
        await RewardModel.deleteMany({});
        console.log('   ✓ Rewards anteriores eliminados');

        // Recompensas simuladas (socios a definir posteriormente)
        const rewardsData = [
            // DESCUENTOS (100-200 puntos)
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'discount',
                title: '10% Descuento en Supermercados',
                description: 'Cupón de 10% de descuento en tu compra en supermercados participantes',
                pointsCost: 100,
                stock: null, // Ilimitado
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/supermarket-discount.png',
                termsAndConditions: 'Válido por 30 días. Compra mínima de $20. No acumulable con otras promociones. Presentar código QR en caja.',
                partner: 'Red de Supermercados - Latacunga',
                metadata: { discountPercentage: 10, minPurchase: 20, validDays: 30 }
            },
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'discount',
                title: '15% Descuento en Restaurantes',
                description: 'Descuento del 15% en restaurantes locales participantes',
                pointsCost: 150,
                stock: null,
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/restaurant-discount.png',
                termsAndConditions: 'Válido en restaurantes participantes. Ver lista completa en la app. No aplica para bebidas alcohólicas.',
                partner: 'Asociación de Restaurantes Locales',
                metadata: { discountPercentage: 15, categories: ['ecuatoriana', 'internacional'] }
            },
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'discount',
                title: '$5 Descuento en Productos Ecológicos',
                description: '$5 de descuento en compra de productos ecológicos',
                pointsCost: 200,
                stock: null,
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/eco-discount.png',
                termsAndConditions: 'Compra mínima de $25. Válido por 60 días. Solo productos con certificación ecológica.',
                partner: 'Tiendas Ecológicas Latacunga',
                metadata: { discountAmount: 5, minPurchase: 25, validDays: 60 }
            },

            // RECONOCIMIENTOS (250-500 puntos)
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'recognition',
                title: 'Certificado Ciudadano Ambiental',
                description: 'Certificado oficial del Municipio como Ciudadano Ambientalmente Responsable',
                pointsCost: 250,
                stock: null,
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/certificate.png',
                termsAndConditions: 'Certificado digital descargable en PDF. Reconocimiento en redes sociales oficiales del Municipio.',
                partner: 'Municipio de Latacunga',
                metadata: { certificateType: 'digital', includesShare: true }
            },
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'recognition',
                title: 'Reconocimiento Público Municipal',
                description: 'Tu nombre aparecerá en el mural digital del Municipio por 1 mes',
                pointsCost: 500,
                stock: 10,
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/public-recognition.png',
                termsAndConditions: 'Tu nombre y foto (opcional) en mural digital durante 30 días. Incluye mención en ceremonia mensual virtual.',
                partner: 'Municipio de Latacunga - Dirección Ambiental',
                metadata: { duration: 30, includesCeremony: true }
            },

            // SORTEOS (50-120 puntos)
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'raffle',
                title: 'Boleto Sorteo Mensual',
                description: 'Un boleto para el sorteo mensual de premios ecológicos',
                pointsCost: 50,
                stock: null,
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/raffle-ticket.png',
                termsAndConditions: 'Sorteo el último viernes de cada mes a las 18h00. Premios: tablets, bicicletas, equipos deportivos. Resultados en redes sociales.',
                partner: 'Municipio de Latacunga',
                metadata: { drawDay: 'last-friday', drawTime: '18:00', prizes: ['tablet', 'bicicleta', 'equipo-deportivo'] }
            },
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'raffle',
                title: '3 Boletos Sorteo Mensual',
                description: 'Triple oportunidad de ganar en el sorteo mensual',
                pointsCost: 120,
                stock: null,
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/raffle-tickets-3.png',
                termsAndConditions: 'Tres boletos para el sorteo del mes. Mayor probabilidad de ganar. No reembolsable.',
                partner: 'Municipio de Latacunga',
                metadata: { tickets: 3, drawDay: 'last-friday' }
            },

            // BENEFICIOS (300-400 puntos)
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'benefit',
                title: 'Entrada Gratis Parque Nacional',
                description: 'Entrada gratuita al Parque Nacional Cotopaxi',
                pointsCost: 300,
                stock: 20,
                status: 'active',
                expiresAt: new Date('2026-12-31'), // Válido todo el año
                imageUrl: '/assets/rewards/park-entrance.png',
                termsAndConditions: 'Válido hasta dic 2026. Incluye 1 persona. Presentar código QR en la entrada. Sujeto a horarios del parque.',
                partner: 'Parque Nacional Cotopaxi',
                metadata: { validUntil: '2026-12-31', peopleCount: 1, parkRulesApply: true }
            },
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'benefit',
                title: 'Tour Ecológico Guiado',
                description: 'Tour guiado por las áreas naturales de Latacunga',
                pointsCost: 400,
                stock: 12,
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/eco-tour.png',
                termsAndConditions: 'Reserva con 7 días de anticipación. Tours sábados y domingos. Incluye guía certificado y refrigerio.',
                partner: 'EcoTours Cotopaxi',
                metadata: { advanceBookingDays: 7, includes: ['guia', 'refrigerio'], duration: '4 horas' }
            },

            // MERCHANDISING (350-600 puntos)
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'merchandise',
                title: 'Camiseta "Latacunga Limpia"',
                description: 'Camiseta oficial de la campaña de gestión de residuos',
                pointsCost: 350,
                stock: 30,
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/tshirt.png',
                termsAndConditions: 'Retiro en oficinas municipales. Tallas disponibles: S, M, L, XL. 100% algodón. Diseño exclusivo.',
                partner: 'Municipio de Latacunga',
                metadata: { sizes: ['S', 'M', 'L', 'XL'], material: 'algodón', pickupRequired: true }
            },
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'merchandise',
                title: 'Kit de Reciclaje Hogar',
                description: 'Kit completo con 3 contenedores de reciclaje para tu hogar',
                pointsCost: 600,
                stock: 15,
                status: 'active',
                expiresAt: null,
                imageUrl: '/assets/rewards/recycle-kit.png',
                termsAndConditions: 'Retiro en punto de acopio más cercano. Incluye: contenedor orgánico, reciclable y no reciclable con tapa. Manual de uso incluido.',
                partner: 'Municipio de Latacunga - Gestión Ambiental',
                metadata: { 
                    containers: 3, 
                    types: ['orgánico', 'reciclable', 'no-reciclable'],
                    includesManual: true,
                    weight: '2kg'
                }
            }
        ];

        await RewardModel.insertMany(rewardsData);

        console.log(`   ✓ ${rewardsData.length} recompensas creadas exitosamente`);
        console.log('   📊 Resumen por tipo:');
        
        const types = {
            discount: 'Descuentos',
            recognition: 'Reconocimientos',
            raffle: 'Sorteos',
            benefit: 'Beneficios',
            merchandise: 'Merchandising'
        };

        for (const [type, label] of Object.entries(types)) {
            const count = rewardsData.filter(r => r.type === type).length;
            if (count > 0) {
                console.log(`      - ${label}: ${count} recompensas`);
            }
        }

        console.log('   💡 Nota: Los socios comerciales son simulados. Contactar para alianzas reales.');

        return { success: true, count: rewardsData.length };
    } catch (error) {
        console.error('❌ Error en seed de rewards:', error);
        throw error;
    }
}

/**
 * Ejecutar seed si se llama directamente
 */
if (require.main === module) {
    mongoose
        .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/latacunga_waste_management')
        .then(async () => {
            console.log('✅ Conectado a MongoDB');
            await seedRewards();
            await mongoose.connection.close();
            console.log('✅ Seed completado y conexión cerrada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error conectando a MongoDB:', error);
            process.exit(1);
        });
}
