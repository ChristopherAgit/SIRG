export interface CreateReservationRequest {
    fullName: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
}

export interface ReservationResponse {
    id: number;
    reservationCode: string;
    fullName: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    status: "pending" | "confirmed" | "cancelled";
    createdAt: string;
}
