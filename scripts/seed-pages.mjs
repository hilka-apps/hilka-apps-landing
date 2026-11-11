/**
 * Seed the About / More / Contact page singletons with the current text from
 * messages/*.json, so the CMS docs aren't empty (and the form header no longer
 * shows "Untitled"). `<serif>…</serif>` becomes the `*…*` accent marker.
 *
 * Run once:
 *   SANITY_WRITE_TOKEN=<editor-token> node scripts/seed-pages.mjs
 *
 * Idempotent — overwrites the three singleton docs each run.
 */
import { createClient } from "@sanity/client";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID");
if (!token) throw new Error("Set SANITY_WRITE_TOKEN (an editor/deploy token)");

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

const L = (en, uk) => ({ en, uk });

const aboutPage = {
  _id: "aboutPage",
  _type: "aboutPage",
  heroEyebrow: L("About", "Про нас"),
  heroHeading: L("An indie iOS *studio.*", "Інді iOS *студія.*"),
  heroLead: L(
    "Hilka Apps is a tiny studio making focused iOS apps for everyday life.",
    "Hilka Apps — маленька студія, що створює продумані iOS-застосунки для щоденного життя."
  ),
  story: L(
    "We believe the best software does less, better. Every Hilka app starts with one clear job and a calm, uncluttered interface — then we sweat the details until it feels effortless. No dark patterns, no noise, no upsell maze. Just small, honest tools we'd want to use ourselves.",
    "Ми переконані: найкраще програмне забезпечення робить менше, але краще. Кожен застосунок Hilka починається з одного чіткого завдання та спокійного, лаконічного інтерфейсу — а потім ми шліфуємо деталі, поки це не відчувається бездоганно. Без темних патернів, без шуму, без лабіринту апгрейдів. Просто маленькі, чесні інструменти, якими ми самі хочемо користуватися."
  ),
  valuesEyebrow: L("Our values", "Наші принципи"),
  valuesHeading: L("What we stand for.", "Наші цінності."),
  valueItems: [
    { _key: "v1", title: L("Simple", "Простота"), desc: L("One job. Done well. No feature creep.", "Одне завдання. Зроблено добре. Без роздування функцій.") },
    { _key: "v2", title: L("Private by default", "Приватність за замовчуванням"), desc: L("Your data stays on your device.", "Твої дані залишаються на твоєму пристрої.") },
    { _key: "v3", title: L("Made with care", "Зроблено з турботою"), desc: L("Every detail sweated until it feels effortless.", "Кожна деталь відшліфована до відчуття бездоганності.") },
  ],
  ctaHeading: L("See what we've built.", "Подивись, що ми побудували."),
  ctaSub: L("One focused app, already live. More on the way.", "Один застосунок вже доступний. Більше — попереду."),
  ctaLabel: L("Explore Focusly", "Переглянути Focusly"),
};

const morePage = {
  _id: "morePage",
  _type: "morePage",
  heroEyebrow: L("More", "Більше"),
  heroHeading: L("More from Hilka Apps.", "Більше від Hilka Apps."),
  heroIntro: L(
    "A few extra things — what we're working on and how to reach us.",
    "Декілька додаткових речей — над чим ми працюємо і як з нами зв'язатися."
  ),
};

const contactPage = {
  _id: "contactPage",
  _type: "contactPage",
  heroEyebrow: L("Get in touch", "Зв'яжіться з нами"),
  heroHeading: L("We'd love your *feedback.*", "Ми раді вашому *відгуку.*"),
  heroIntro: L(
    "Have an idea or hit a snag? Tell us — we read everything.",
    "Є ідея або щось пішло не так? Напишіть нам — ми читаємо все."
  ),
};

for (const doc of [aboutPage, morePage, contactPage]) {
  await client.createOrReplace(doc);
  console.log("seeded", doc._id);
}
