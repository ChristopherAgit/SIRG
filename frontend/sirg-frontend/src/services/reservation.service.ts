import type {
    CreateReservationRequest,
    ReservationResponse,
} from "../types/reservation.types";

export const reservationService = {
    create: async (
        data: CreateReservationRequest
    ): Promise<ReservationResponse> => {
        // Simula tiempo de red
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
            id: Math.floor(Math.random() * 1000),
            reservationCode: "SIRG-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            date: data.date,
            time: data.time,
            guests: data.guests,
            status: "confirmed",
            createdAt: new Date().toISOString(),
        };
    },

    getByCode: async (
        code: string
    ): Promise<ReservationResponse> => {
        await new Promise((resolve) => setTimeout(resolve, 800));

        return {
            id: 1,
            reservationCode: code,
            fullName: "Cliente Demo",
            email: "demo@email.com",
            phone: "000-000-0000",
            date: "2026-02-20",
            time: "19:00",
            guests: 2,
            status: "confirmed",
            createdAt: new Date().toISOString(),
        };
    },
};
