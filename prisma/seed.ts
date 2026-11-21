/**
 * Seed: Bewerbungsart, Positionen, Formularfragen, Nachrichtenbausteine
 * und (optional) Demo-Bewerbungen.
 *
 *   npm run db:seed              # alles
 *   SEED_DEMO=false npm run db:seed   # ohne Testbewerbungen (Produktion)
 *
 * Idempotent: Bereits vorhandene Positionen/Bausteine werden nicht doppelt angelegt.
 */
import "dotenv/config";
import type { Prisma } from "@prisma/client";
import type { ApplicationStatus, QuestionType, VoteValue } from "@prisma/client";
import { createPrismaClient } from "../src/lib/db";
import { seedBase } from "../src/lib/setup/base-seed";
import { markMigrationsDone, runMigrations } from "../src/lib/setup/migrations";

const db = createPrismaClient();

// ─── Demo-Daten ──────────────────────────────────────────────

const DEMO_PREFIX = "11000000000000000";

const PERSONAS = [
  { name: "Jonas", user: "jonas.ol", age: 19, tone: "solide", status: "SUBMITTED", position: "supporter" },
  { name: "Lea", user: "lea_nord", age: 21, tone: "stark", status: "IN_REVIEW", position: "moderator" },
  { name: "Mats", user: "mats.cuts", age: 17, tone: "stark", status: "INTERVIEW", position: "cutter" },
  { name: "Finn", user: "finnyboy", age: 16, tone: "kurz", status: "SUBMITTED", position: "stream-mod" },
  { name: "Svenja", user: "svenja.social", age: 18, tone: "solide", status: "ACCEPTED", position: "social-media" },
  { name: "Ole", user: "ole_chat", age: 22, tone: "solide", status: "REJECTED", position: "stream-mod" },
  { name: "Kim", user: "kim.k", age: 20, tone: "stark", status: "IN_REVIEW", position: "supporter" },
  { name: "Hauke", user: "hauke_ttv", age: 24, tone: "kurz", status: "DRAFT", position: "moderator" },
] as const;

const TEXT = {
  stark: [
    "Ich bin seit gut vier Jahren in Discord-Communities unterwegs und war zwei Jahre im Support eines mittelgroßen Streamer-Servers. Dort habe ich gelernt, dass die meisten Konflikte sich mit Ruhe und einer klaren Erklärung lösen lassen. Mir ist wichtig, dass sich alle ernst genommen fühlen.",
    "Mich reizt am Treffpunkt, dass er noch klein ist und gerade wächst. Ich habe auf größeren Servern erlebt, wie schnell Teams unübersichtlich werden. Hier kann ich von Anfang an mithelfen, Abläufe sauber aufzusetzen, und das macht mir einfach Spaß.",
    "Ich würde erst mal nicht auf die Beleidigung eingehen, sondern sachlich bleiben und nachfragen, worum es eigentlich geht. Meistens steckt Frust über etwas anderes dahinter. Wenn es weitergeht, weise ich auf die Regeln hin und gebe das Ticket notfalls an jemand anderen ab, damit es nicht persönlich wird.",
  ],
  solide: [
    "Ich schaue seit ungefähr zwei Jahren GTA-RP-Streams und bin in ein paar Communities aktiv. Im Team war ich bisher nur kurz auf einem kleinen Server als Supporter, das hat mir aber gut gefallen.",
    "Ich mag Janniks Streams und die entspannte Community. Ich möchte mithelfen, dass sich neue Leute schnell wohlfühlen, und bin abends eigentlich immer online.",
    "Ich bleibe ruhig und erkläre der Person, dass so ein Ton im Ticket nicht geht. Dann versuche ich trotzdem, sein Problem zu lösen. Wenn er weiter beleidigt, schließe ich das Ticket und gebe es an die Leitung weiter.",
  ],
  kurz: ["Bin schon lange dabei.", "Weil Jannik cool ist.", "Ich sag ihm er soll aufhören."],
};

function answerFor(type: QuestionType, options: string[], tone: keyof typeof TEXT, i: number): Prisma.InputJsonValue | null {
  const pool = TEXT[tone];
  switch (type) {
    case "SHORT_TEXT":
      return tone === "kurz" ? "Finn" : "Passt so";
    case "LONG_TEXT":
    case "SCENARIO":
      return pool[i % pool.length];
    case "SELECT":
    case "QUIZ":
      return options[Math.min(options.length - 1, tone === "stark" ? 2 : 1)] ?? null;
    case "MULTI_SELECT":
      return options.slice(0, tone === "stark" ? 2 : 1);
    case "URL":
      return "https://www.tiktok.com/";
    case "NUMBER":
      return 10;
    case "CHECKBOX":
      return true;
    case "FILE":
      return [];
  }
}

async function seedDemo() {
  if (process.env.SEED_DEMO === "false") return;
  if ((await db.user.count({ where: { discordId: { startsWith: DEMO_PREFIX } } })) > 0) {
    console.log("• Demo-Daten existieren bereits – übersprungen");
    return;
  }

  const reviewer = await db.user.create({
    data: {
      discordId: `${DEMO_PREFIX}99`,
      username: "demo.teammitglied",
      globalName: "Demo-Teammitglied",
      discordCreatedAt: new Date("2019-04-12"),
      isTeam: true,
      isAdmin: true,
      inGuild: true,
    },
  });

  const now = Date.now();
  const year = new Date().getFullYear();
  let counter = 0;

  for (const [idx, p] of PERSONAS.entries()) {
    const user = await db.user.create({
      data: {
        discordId: `${DEMO_PREFIX}${String(idx + 10).padStart(2, "0")}`,
        username: p.user,
        globalName: p.name,
        discordCreatedAt: new Date(now - (idx === 3 ? 12 : 400 + idx * 90) * 86_400_000),
        inGuild: true,
        guildJoinedAt: new Date(now - (60 + idx * 7) * 86_400_000),
      },
    });
    const position = await db.position.findUniqueOrThrow({ where: { slug: p.position } });
    const sections = await db.formSection.findMany({
      where: { typeId: position.typeId, OR: [{ positionId: null }, { positionId: position.id }] },
      orderBy: [{ sortOrder: "asc" }],
      include: { questions: { where: { archived: false }, orderBy: { sortOrder: "asc" } } },
    });

    const status = p.status as ApplicationStatus;
    const submittedAt = new Date(now - (14 - idx) * 86_400_000);

    if (status === "DRAFT") {
      await db.application.create({
        data: { userId: user.id, positionId: position.id, status, draftStep: 1, draftData: {} },
      });
      continue;
    }

    counter++;
    const publicId = `JT-${year}-${String(counter).padStart(4, "0")}`;
    const answers: Prisma.AnswerCreateWithoutApplicationInput[] = [];
    let order = 0;
    for (const s of sections) {
      for (const [qi, q] of s.questions.entries()) {
        const value = answerFor(q.type, q.options, p.tone, qi);
        if (value === null) continue;
        answers.push({ questionId: q.id, sectionTitle: s.title, label: q.label, type: q.type, value, sortOrder: order++ });
      }
    }

    const decided = status === "ACCEPTED" || status === "REJECTED";
    const flags =
      p.tone === "kurz"
        ? [
            { code: "short_answers", message: "Viele sehr kurze Antworten." },
            ...(idx === 3 ? [{ code: "young_account", message: "Discord-Account ist erst 12 Tage alt." }] : []),
          ]
        : [];

    const app = await db.application.create({
      data: {
        publicId,
        userId: user.id,
        positionId: position.id,
        status,
        age: p.age,
        submittedAt,
        firstReviewedAt: status !== "SUBMITTED" ? new Date(submittedAt.getTime() + 86_400_000) : null,
        decidedAt: decided ? new Date(submittedAt.getTime() + 5 * 86_400_000) : null,
        decidedById: decided ? reviewer.id : null,
        interviewAt: status === "INTERVIEW" ? new Date(now + 2 * 86_400_000 + 19 * 3_600_000) : null,
        consentVersion: "2026-11-v1",
        consentAt: submittedAt,
        confirmations: { voice: true, rules: true, truth: true, privacy: true },
        confirmationDmStatus: idx === 6 ? "DM_CLOSED" : "SENT",
        flags,
        answers: { create: answers },
        statusChanges: {
          create: [
            { to: "SUBMITTED", createdAt: submittedAt },
            ...(status !== "SUBMITTED"
              ? [{ from: "SUBMITTED" as const, to: status, actorId: reviewer.id, createdAt: new Date(submittedAt.getTime() + 2 * 86_400_000) }]
              : []),
          ],
        },
        messages: {
          create: [
            {
              direction: "SYSTEM",
              body: `Moin ${p.name},\n\ndanke für deine Bewerbung als **${position.title}** – sie ist bei uns eingegangen.\n\n**Bewerbungs-ID:** ${publicId}`,
              deliveryStatus: idx === 6 ? "DM_CLOSED" : "SENT",
              sentAt: submittedAt,
              createdAt: submittedAt,
            },
            ...(status === "INTERVIEW"
              ? [
                  {
                    direction: "TEAM_TO_APPLICANT" as const,
                    authorId: reviewer.id,
                    body: `Moin ${p.name},\n\ndeine Bewerbung hat uns gefallen – wir wollen dich kennenlernen. Termin folgt per DM.`,
                    deliveryStatus: "SENT" as const,
                    sentAt: new Date(submittedAt.getTime() + 2 * 86_400_000),
                  },
                ]
              : []),
          ],
        },
      },
    });

    if (status !== "SUBMITTED") {
      await db.vote.create({
        data: {
          applicationId: app.id,
          userId: reviewer.id,
          value: (status === "REJECTED" ? "CONTRA" : "PRO") as VoteValue,
        },
      });
      await db.comment.create({
        data: {
          applicationId: app.id,
          authorId: reviewer.id,
          body:
            status === "REJECTED"
              ? "Screenshots wirken nicht selbst gemacht – Quelle unklar. Lieber nochmal in ein paar Monaten."
              : "Antworten wirken durchdacht, Szenario 1 besonders gut gelöst.",
        },
      });
    }
  }

  await db.counter.upsert({
    where: { key: `publicId:${year}` },
    create: { key: `publicId:${year}`, value: counter },
    update: { value: counter },
  });

  const support = await db.user.findFirst({ where: { username: "finnyboy" } });
  if (support) {
    await db.userNote.create({
      data: { subjectId: support.id, authorId: reviewer.id, body: "War im Ticket #212 recht ungeduldig, sonst unauffällig." },
    });
  }
  console.log(`✓ ${PERSONAS.length} Demo-Bewerbungen`);
}

async function main() {
  // Reihenfolge wichtig: erst bestehende Daten migrieren (Keys), dann Fehlendes ergänzen
  const empty = (await db.applicationType.count()) === 0;
  if (!empty) for (const m of await runMigrations(db, { log: console.log })) console.log(`✓ Migration ${m}`);
  await seedBase(db, console.log);
  if (empty) await markMigrationsDone(db);
  await seedDemo();
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
