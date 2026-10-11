/* BYAO access notices: friendly messages for fundi (trial / monthly fee) and merchant (waiting for admin).
   Clients never see anything from this file. Loaded only on the fundi and merchant pages. */
(function () {
  const sb = () => window.supabaseClient;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function modal(title, bodyHtml, withForm, aina) {
    const old = document.getElementById('byao-access-modal'); if (old) old.remove();
    const o = document.createElement('div');
    o.id = 'byao-access-modal';
    o.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,.82);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif';
    o.innerHTML = '<div style="max-width:420px;width:100%;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:18px;padding:20px;max-height:90vh;overflow:auto">' +
      '<div style="font-size:18px;font-weight:700;margin-bottom:10px">' + esc(title) + '</div>' +
      '<div style="font-size:14px;line-height:1.5;color:#cbd5e1">' + bodyHtml + '</div>' +
      (withForm ? '<input id="byao-trans" placeholder="Namba ya muamala (mf. QJK8X2AB1C)" style="width:100%;margin-top:14px;padding:12px;border-radius:10px;border:1px solid #334155;background:#020617;color:#e2e8f0;font-size:16px">' +
        '<button id="byao-send" style="width:100%;margin-top:10px;padding:12px;border-radius:10px;border:0;background:#10b981;color:#042f2e;font-weight:700;font-size:15px">Tuma uthibitisho wa malipo</button>' : '') +
      '<button id="byao-close" style="width:100%;margin-top:10px;padding:11px;border-radius:10px;border:1px solid #334155;background:transparent;color:#94a3b8;font-size:14px">Baadaye</button>' +
      '<div id="byao-msg" style="margin-top:10px;font-size:13px;color:#fbbf24"></div></div>';
    document.body.appendChild(o);
    document.getElementById('byao-close').onclick = () => o.remove();
    if (withForm) document.getElementById('byao-send').onclick = () => sendProof(aina);
  }

  async function sendProof(aina) {
    const msg = document.getElementById('byao-msg'), code = (document.getElementById('byao-trans').value || '').trim();
    if (code.length < 6) { msg.textContent = 'Tafadhali weka namba kamili ya muamala.'; return; }
    try {
      const { data: { user } } = await sb().auth.getUser();
      const { data: p } = await sb().from('profiles').select('full_name,phone').eq('id', user.id).maybeSingle();
      const { error } = await sb().from('funding_requests').insert([{ user_id: user.id, jina: (p && p.full_name) || '', simu: (p && p.phone) || '', aina: aina, transId: code }]);
      if (error) { msg.textContent = /duplicate|unique/i.test(error.message) ? 'Namba hii ya muamala imeshatumwa.' : 'Imeshindikana kutuma. Jaribu tena.'; return; }
      msg.style.color = '#34d399';
      msg.textContent = 'Asante! Ombi lako limetumwa. Admin akithibitisha, huduma itafunguka yenyewe.';
      document.getElementById('byao-send').remove();
    } catch (e) { msg.textContent = 'Imeshindikana kutuma. Angalia mtandao.'; }
  }

  function banner(text) {
    if (document.getElementById('byao-access-banner')) return;
    const b = document.createElement('div');
    b.id = 'byao-access-banner';
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9998;background:#0f766e;color:#ecfeff;font:13px system-ui,sans-serif;padding:8px 40px 8px 12px';
    b.innerHTML = esc(text) + '<span id="byao-bx" style="position:absolute;right:12px;top:6px;cursor:pointer;font-size:16px">✕</span>';
    document.body.appendChild(b);
    document.getElementById('byao-bx').onclick = () => b.remove();
  }

  const pay = (d) => '<p style="margin:10px 0 0"><b>Mchango:</b> ' + esc(d.fee || 'kiasi kidogo kwa mwezi') + '</p><p style="margin:6px 0 0">' + esc(d.instructions || '') + '</p>';

  async function check() {
    try {
      const { data: { user } } = await sb().auth.getUser();
      if (!user) return;
      const { data: d, error } = await sb().rpc('my_subscription');
      if (error || !d) return;
      if (d.role === 'technician') {
        if (d.state === 'trial') banner('Majaribio ya bure: siku ' + d.days_left + ' zimebaki. Baada ya hapo huduma inahitaji mchango mdogo wa kila mwezi.');
        else if (d.state === 'expired') modal('Asante kwa kutumia BYAO 💙', '<p style="margin:0">Muda wa majaribio ya bure umeisha. Ili kuendelea kupokea kazi na kusajili vifaa, tunakuomba kuchangia kiasi kidogo cha pesa kila mwezi. Mchango huu unatusaidia kuendesha na kuboresha mfumo.</p>' + pay(d), true, 'Fundi Subscription');
        else if (d.state === 'blocked') modal('Akaunti imesimamishwa', 'Akaunti yako imesimamishwa kwa sasa. Tafadhali wasiliana na admin.', false);
      } else if (d.role === 'merchant' && d.state === 'pending') {
        modal('Karibu BYAO 🎉', '<p style="margin:0">Akaunti yako imefunguliwa. Matangazo yako yatachapishwa baada ya <b>idhini ya admin</b>, kwa kuwa kutangaza kuna malipo. Ukishalipia, weka namba ya muamala hapa na admin atathibitisha.</p>' + pay(d), true, 'Merchant Ads');
      }
    } catch (e) { /* never block the app */ }
  }
  window.addEventListener('load', () => setTimeout(check, 700));
})();
