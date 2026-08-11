import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { playerProfiles } from "../../../db/schema";

export const dynamic = "force-dynamic";

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const db = await getDb();
  const [record] = await db.select().from(playerProfiles).where(eq(playerProfiles.email, user.email)).limit(1);

  return Response.json({
    user: { displayName: user.displayName, email: user.email },
    profile: parseJson(record?.profileJson ?? null),
    settings: parseJson(record?.settingsJson ?? null),
    save: parseJson(record?.saveJson ?? null),
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const body = await request.json() as { profile?: unknown; settings?: unknown; save?: unknown };
  if (!body.profile || !body.settings) {
    return Response.json({ error: "Profile and settings are required" }, { status: 400 });
  }

  const now = Date.now();
  const values = {
    email: user.email,
    displayName: user.displayName,
    profileJson: JSON.stringify(body.profile),
    settingsJson: JSON.stringify(body.settings),
    saveJson: body.save == null ? null : JSON.stringify(body.save),
    updatedAt: now,
  };

  const db = await getDb();
  await db.insert(playerProfiles).values(values).onConflictDoUpdate({
    target: playerProfiles.email,
    set: {
      displayName: values.displayName,
      profileJson: values.profileJson,
      settingsJson: values.settingsJson,
      saveJson: values.saveJson,
      updatedAt: values.updatedAt,
    },
  });

  return Response.json({ ok: true, updatedAt: now });
}
