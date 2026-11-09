// Receives the site's forms at POST /api/contact and emails them to the studio inbox.
// Everything else falls through to the static site.
import { EmailMessage } from 'cloudflare:email';

const FROM = 'forms@sfh.studio';
const TO = 'stayforhours@gmail.com';
const MAX_FIELD = 4000;

// Header values come from visitors: strip anything that could start a new header.
const headerSafe = s => String(s).replace(/[^\x20-\x7E]/g, ' ').trim().slice(0, 150);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/contact') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    let form;
    try { form = await request.formData(); } catch (_) { return new Response('Bad request', { status: 400 }); }

    const email = String(form.get('email') || '').trim();
    if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(email) || email.length > 150) {
      return new Response('Invalid email', { status: 400 });
    }

    const subject = headerSafe(form.get('_subject') || 'Site inquiry');
    const lines = [];
    for (const [key, value] of form) {
      if (key === '_subject' || typeof value !== 'string' || !value) continue;
      lines.push(`${headerSafe(key)}: ${value.slice(0, MAX_FIELD)}`);
    }

    const raw = [
      `From: SFH Studio site <${FROM}>`,
      `To: ${TO}`,
      `Reply-To: ${email}`,
      `Subject: ${subject}`,
      `Message-ID: <${crypto.randomUUID()}@sfh.studio>`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      lines.join('\r\n'),
    ].join('\r\n');

    try {
      await env.MAIL.send(new EmailMessage(FROM, TO, raw));
    } catch (err) {
      // A non-OK reply makes the page fall back to the visitor's mail app, so the lead isn't lost.
      console.error('contact send failed', err);
      return new Response('Send failed', { status: 502 });
    }
    return Response.json({ ok: true });
  },
};
