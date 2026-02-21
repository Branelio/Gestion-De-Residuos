/**
 * Entidad de dominio: Recompensa
 * Representa recompensas que los usuarios pueden canjear con sus puntos
 */

export class RewardId {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('RewardId no puede estar vacío');
        }
    }

    equals(other: RewardId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

export enum RewardType {
    DISCOUNT = 'discount',           // Cupones de descuento
    RECOGNITION = 'recognition',      // Reconocimientos oficiales
    RAFFLE = 'raffle',               // Boletos para sorteos
    BENEFIT = 'benefit',             // Beneficios exclusivos
    MERCHANDISE = 'merchandise'       // Mercancía/merchandising
}

export enum RewardStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    EXPIRED = 'expired',
    OUT_OF_STOCK = 'out_of_stock'
}

export class Reward {
    constructor(
        public readonly id: RewardId,
        public readonly type: RewardType,
        public readonly title: string,
        public readonly description: string,
        public readonly pointsCost: number,
        public stock: number | null,  // null = ilimitado
        public status: RewardStatus,
        public readonly expiresAt: Date | null,
        public readonly imageUrl: string,
        public readonly termsAndConditions: string,
        public readonly partner: string | null,  // Comercio o institución aliada
        public readonly metadata: Record<string, any> = {},
        public readonly createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) {
        this.validateInvariants();
    }

    private validateInvariants(): void {
        if (!this.title || this.title.trim().length === 0) {
            throw new Error('El título de la recompensa es requerido');
        }

        if (!this.description || this.description.trim().length === 0) {
            throw new Error('La descripción de la recompensa es requerida');
        }

        if (this.pointsCost < 0) {
            throw new Error('El costo en puntos no puede ser negativo');
        }

        if (this.stock !== null && this.stock < 0) {
            throw new Error('El stock no puede ser negativo');
        }
    }

    /**
     * Verifica si la recompensa está disponible
     */
    isAvailable(): boolean {
        if (this.status !== RewardStatus.ACTIVE) {
            return false;
        }

        // Verificar expiración
        if (this.expiresAt && this.expiresAt < new Date()) {
            this.status = RewardStatus.EXPIRED;
            this.updatedAt = new Date();
            return false;
        }

        // Verificar stock
        if (this.stock !== null && this.stock <= 0) {
            this.status = RewardStatus.OUT_OF_STOCK;
            this.updatedAt = new Date();
            return false;
        }

        return true;
    }

    /**
     * Decrementa el stock al canjear la recompensa
     */
    redeem(): void {
        if (!this.isAvailable()) {
            throw new Error('La recompensa no está disponible');
        }

        if (this.stock !== null) {
            this.stock--;
            if (this.stock <= 0) {
                this.status = RewardStatus.OUT_OF_STOCK;
            }
        }

        this.updatedAt = new Date();
    }

    /**
     * Obtiene el ícono según el tipo de recompensa
     */
    getTypeIcon(): string {
        switch (this.type) {
            case RewardType.DISCOUNT:
                return '🎟️';
            case RewardType.RECOGNITION:
                return '🏅';
            case RewardType.RAFFLE:
                return '🎲';
            case RewardType.BENEFIT:
                return '⭐';
            case RewardType.MERCHANDISE:
                return '🎁';
            default:
                return '🎁';
        }
    }

    /**
     * Obtiene el nombre legible del tipo
     */
    getTypeName(): string {
        switch (this.type) {
            case RewardType.DISCOUNT:
                return 'Descuento';
            case RewardType.RECOGNITION:
                return 'Reconocimiento';
            case RewardType.RAFFLE:
                return 'Sorteo';
            case RewardType.BENEFIT:
                return 'Beneficio';
            case RewardType.MERCHANDISE:
                return 'Mercancía';
            default:
                return 'Recompensa';
        }
    }

    /**
     * Verifica si está próxima a expirar (menos de 7 días)
     */
    isExpiringSoon(): boolean {
        if (!this.expiresAt) return false;
        
        const daysUntilExpiration = Math.ceil(
            (this.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return daysUntilExpiration > 0 && daysUntilExpiration <= 7;
    }

    /**
     * Convierte la entidad a un objeto plano
     */
    toObject() {
        return {
            id: this.id.value,
            type: this.type,
            typeName: this.getTypeName(),
            typeIcon: this.getTypeIcon(),
            title: this.title,
            description: this.description,
            pointsCost: this.pointsCost,
            stock: this.stock,
            status: this.status,
            available: this.isAvailable(),
            expiresAt: this.expiresAt,
            expiringSoon: this.isExpiringSoon(),
            imageUrl: this.imageUrl,
            termsAndConditions: this.termsAndConditions,
            partner: this.partner,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

/**
 * Recompensas predefinidas para Latacunga
 */
export const PREDEFINED_REWARDS = [
    // Descuentos
    {
        type: RewardType.DISCOUNT,
        title: '10% Dcto. en Supermercados AKI',
        description: 'Cupón de 10% de descuento en tu compra en Supermercados AKI',
        pointsCost: 100,
        stock: 50,
        imageUrl: '/rewards/aki-discount.png',
        termsAndConditions: 'Válido por 30 días. Una compra mínima de $20. No acumulable con otras promociones.',
        partner: 'Supermercados AKI',
        metadata: { discountPercentage: 10, minPurchase: 20 }
    },
    {
        type: RewardType.DISCOUNT,
        title: '15% Dcto. en Restaurantes Locales',
        description: 'Descuento del 15% en restaurantes participantes de Latacunga',
        pointsCost: 150,
        stock: 30,
        imageUrl: '/rewards/restaurant-discount.png',
        termsAndConditions: 'Válido en restaurantes participantes. Ver lista en la app.',
        partner: 'Asociación de Restaurantes',
        metadata: { discountPercentage: 15 }
    },
    {
        type: RewardType.DISCOUNT,
        title: '$5 Dcto. en Productos Ecológicos',
        description: '$5 de descuento en tiendas de productos ecológicos',
        pointsCost: 200,
        stock: 20,
        imageUrl: '/rewards/eco-discount.png',
        termsAndConditions: 'Compra mínima de $25. Válido por 60 días.',
        partner: 'EcoTienda Latacunga',
        metadata: { discountAmount: 5, minPurchase: 25 }
    },

    // Reconocimientos
    {
        type: RewardType.RECOGNITION,
        title: 'Certificado Ciudadano Ambiental',
        description: 'Certificado oficial del Municipio de Latacunga como Ciudadano Ambientalmente Responsable',
        pointsCost: 250,
        stock: null,
        imageUrl: '/rewards/certificate.png',
        termsAndConditions: 'Certificado digital descargable. Reconocimiento en redes sociales oficiales.',
        partner: 'Municipio de Latacunga',
        metadata: { certificateType: 'digital' }
    },
    {
        type: RewardType.RECOGNITION,
        title: 'Reconocimiento Público',
        description: 'Tu nombre aparecerá en el mural de honor del Municipio',
        pointsCost: 500,
        stock: 10,
        imageUrl: '/rewards/public-recognition.png',
        termsAndConditions: 'Tu nombre aparecerá durante 1 mes en el mural de la oficina municipal.',
        partner: 'Municipio de Latacunga',
        metadata: { duration: '1 month' }
    },

    // Sorteos
    {
        type: RewardType.RAFFLE,
        title: 'Boleto Sorteo Mensual',
        description: 'Un boleto para el sorteo mensual de premios (tablets, bicicletas, etc.)',
        pointsCost: 50,
        stock: null,
        imageUrl: '/rewards/raffle-ticket.png',
        termsAndConditions: 'Sorteo el último viernes de cada mes. Resultados en redes sociales.',
        partner: 'Municipio de Latacunga',
        metadata: { drawDate: 'last-friday' }
    },
    {
        type: RewardType.RAFFLE,
        title: '3 Boletos Sorteo Mensual',
        description: 'Tres boletos para aumentar tus chances en el sorteo mensual',
        pointsCost: 120,
        stock: null,
        imageUrl: '/rewards/raffle-tickets-3.png',
        termsAndConditions: 'Sorteo el último viernes de cada mes. Resultados en redes sociales.',
        partner: 'Municipio de Latacunga',
        metadata: { tickets: 3, drawDate: 'last-friday' }
    },

    // Beneficios
    {
        type: RewardType.BENEFIT,
        title: 'Entrada Gratis al Parque Nacional',
        description: 'Entrada gratuita al Parque Nacional Cotopaxi',
        pointsCost: 300,
        stock: 15,
        imageUrl: '/rewards/park-entrance.png',
        termsAndConditions: 'Válido por 6 meses. Incluye una persona. Presentar código QR.',
        partner: 'Parque Nacional Cotopaxi',
        metadata: { validityMonths: 6, peopleCount: 1 }
    },
    {
        type: RewardType.BENEFIT,
        title: 'Tour Ecológico Guiado',
        description: 'Tour guiado por las áreas naturales de Latacunga',
        pointsCost: 400,
        stock: 8,
        imageUrl: '/rewards/eco-tour.png',
        termsAndConditions: 'Reserva previa. Grupos de mínimo 4 personas. Incluye guía y refrigerio.',
        partner: 'EcoTours Cotopaxi',
        metadata: { minPeople: 4, includes: ['guide', 'snack'] }
    },

    // Merchandising
    {
        type: RewardType.MERCHANDISE,
        title: 'Camiseta Oficial "Latacunga Limpia"',
        description: 'Camiseta oficial de la campaña de gestión de residuos',
        pointsCost: 350,
        stock: 25,
        imageUrl: '/rewards/tshirt.png',
        termsAndConditions: 'Recogida en oficinas municipales. Tallas S, M, L, XL disponibles.',
        partner: 'Municipio de Latacunga',
        metadata: { sizes: ['S', 'M', 'L', 'XL'] }
    },
    {
        type: RewardType.MERCHANDISE,
        title: 'Kit de Reciclaje para el Hogar',
        description: 'Kit completo con contenedores de reciclaje para tu hogar',
        pointsCost: 600,
        stock: 10,
        imageUrl: '/rewards/recycle-kit.png',
        termsAndConditions: 'Recogida en punto de acopio. Incluye 3 contenedores (orgánico, reciclable, no reciclable).',
        partner: 'Municipio de Latacunga',
        metadata: { containers: 3, types: ['organic', 'recyclable', 'non-recyclable'] }
    }
];
