import { createFactory } from "hono/factory";

import type { Env } from "./auth";

export type AppVariables = { userId: string };
export type HonoEnv = { Bindings: Env; Variables: AppVariables };

export const factory = createFactory<HonoEnv>();
