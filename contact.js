// Shared contact settings. Edit here; every page picks them up.
const CONTACT = {
  email: 'hello@sfh.studio',
  formAction: '',  // e.g. https://formspree.io/f/xxxxx ; empty = falls back to mailto
  // Referral code from ?ref=CODE, remembered so a later inquiry still credits the member.
  ref() {
    try {
      const q = new URLSearchParams(location.search).get('ref');
      if (q) localStorage.setItem('sfh_ref', q.slice(0, 40));
      return localStorage.getItem('sfh_ref') || '';
    } catch (_) { return new URLSearchParams(location.search).get('ref') || ''; }
  },
  // Sends a form to formAction if set, otherwise opens a mailto draft.
  async submit(form, subject) {
    const data = Object.fromEntries(new FormData(form));
    const ref = this.ref(); if (ref) data.referrer = ref;
    if (this.formAction) {
      try {
        const fd = new FormData(form); if (ref) fd.append('referrer', ref);
        const r = await fetch(this.formAction, {method: 'POST', headers: {'Accept': 'application/json'}, body: fd});
        if (r.ok) { form.innerHTML = '<p class="lede">Got it. We\'ll be in touch within a day.</p>'; return; }
      } catch (_) {}
    }
    const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
    location.href = `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
};
CONTACT.ref();
