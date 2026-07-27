import { init } from "@instantdb/react";
import schema, { Schema } from "@/instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "00000000-0000-0000-0000-000000000000";

export const db = init({ appId: APP_ID, schema });
export type { Schema } from "@/instant.schema";
