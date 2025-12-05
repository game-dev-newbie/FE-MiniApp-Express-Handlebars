// src/api/bookingApi.js
import { httpPost } from "./httpClient.js";

export function createBooking(payload) {
  return httpPost("/bookings", payload);
}
