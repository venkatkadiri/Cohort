import { createServerFn } from "@tanstack/react-start";
import {
  getSession,
  requireEnrollerSession,
  requireTeacherSession,
  isAuthConfigured,
} from "#/lib/auth";
import { graphqlApi } from "../graphql/client";

export const createEnrollerFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; name: string; authId?: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    const authId = session?.userId || data.authId || "";
    return graphqlApi.createEnroller({ email: data.email, name: data.name, authId });
  });

export const subscribeFn = createServerFn({ method: "POST" })
  .validator((data: { enrollerId?: number; eventTypeId: number }) => data)
  .handler(async ({ data }) => {
    let enrollerId = data.enrollerId;
    if (isAuthConfigured()) {
      const enroller = await requireEnrollerSession();
      enrollerId = enroller.id;
    } else {
      try {
        const enroller = await requireEnrollerSession();
        enrollerId = enroller.id;
      } catch {}
    }
    if (!enrollerId) {
      enrollerId = 1;
    }
    if (!enrollerId) throw new Error("Enroller required");
    return graphqlApi.subscribe(enrollerId, data.eventTypeId);
  });

export const unsubscribeFn = createServerFn({ method: "POST" })
  .validator((data: { enrollerId?: number; eventTypeId: number }) => data)
  .handler(async ({ data }) => {
    let enrollerId = data.enrollerId;
    if (isAuthConfigured()) {
      const enroller = await requireEnrollerSession();
      enrollerId = enroller.id;
    } else {
      try {
        const enroller = await requireEnrollerSession();
        enrollerId = enroller.id;
      } catch {}
    }
    if (!enrollerId) throw new Error("Enroller required");
    return graphqlApi.unsubscribe(enrollerId, data.eventTypeId);
  });

export const createSlotRequestFn = createServerFn({ method: "POST" })
  .validator(
    (data: { enrollerId?: number; eventTypeId: number; message?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    let enrollerId = data.enrollerId;
    if (isAuthConfigured()) {
      const enroller = await requireEnrollerSession();
      enrollerId = enroller.id;
    } else {
      try {
        const enroller = await requireEnrollerSession();
        enrollerId = enroller.id;
      } catch {}
    }
    if (!enrollerId) enrollerId = 1;
    return graphqlApi.createSlotRequest(enrollerId, data.eventTypeId, data.message);
  });

export const listSubscriptionsForEnrollerFn = createServerFn({ method: "GET" })
  .validator((enrollerId?: number) => enrollerId)
  .handler(async ({ data: enrollerId }) => {
    let id = enrollerId;
    if (!id) {
      if (isAuthConfigured()) {
        const enroller = await requireEnrollerSession();
        id = enroller.id;
      } else {
        try {
          const enroller = await requireEnrollerSession();
          id = enroller.id;
        } catch {}
      }
    }
    if (!id) id = 1;
    return graphqlApi.listSubscriptions(id).catch(() => []);
  });

export const listSlotRequestsForTeacherFn = createServerFn({ method: "GET" })
  .validator((teacherUserId?: number) => teacherUserId)
  .handler(async ({ data: teacherUserId }) => {
    let userId = teacherUserId;
    if (isAuthConfigured()) {
      const teacher = await requireTeacherSession();
      userId = teacher.userId ?? userId;
    } else {
      try {
        const teacher = await requireTeacherSession();
        userId = teacher.userId ?? userId;
      } catch {}
    }
    const finalUserId: number = userId ?? 1;
    return graphqlApi.listSlotRequestsForTeacher(finalUserId).catch(() => []);
  });
