import { createServerFn } from "@tanstack/react-start";
import { graphqlApi } from "../graphql/client";

export const listSlotsFn = createServerFn({ method: "GET" })
  .validator((data: { hostId: number; from?: string; to?: string }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.listSlotsForHost(data.hostId, data.from, data.to);
  });

export const regenerateSlotsFn = createServerFn({ method: "POST" })
  .validator((hostId: number) => hostId)
  .handler(async ({ data: hostId }) => {
    const from = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    await graphqlApi.regenerateSlots({ hostId, from, to, daysAhead: 30 });
    return graphqlApi.listSlotsForHost(hostId, from, to);
  });

export const createSlotFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      hostId: number;
      eventTypeId: number;
      startAt: string;
      endAt: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    return graphqlApi.createSlot(data);
  });

export const updateSlotFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      hostId: number;
      eventTypeId?: number;
      startAt?: string;
      endAt?: string;
      status?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    return graphqlApi.updateSlot(data);
  });

export const deleteSlotFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; hostId: number }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.deleteSlot(data.id, data.hostId);
  });

export const getAvailableSlotsFn = createServerFn({ method: "GET" })
  .validator((data: { eventTypeId: number; date: string }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.getAvailableSlots(data.eventTypeId, data.date);
  });
