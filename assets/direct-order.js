(() => {
  const form = document.querySelector('#order-enquiry');
  if (!form) return;
  const country = form.elements.country;
  const product = form.elements.product;
  const quantityInput = form.elements.quantity;
  const unit = form.querySelector('#order-unit');
  let countryChosen = false;
  const presets = document.createElement('div');
  presets.className = 'order-presets';
  presets.style.cssText = 'grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px;align-items:center';
  unit.after(presets);
  const summary = document.createElement('p');
  summary.setAttribute('aria-live', 'polite');
  form.appendChild(summary);
  const terms = () => {
    const t = I18N[document.documentElement.lang] || I18N.de;
    const brush = ['mini', 'large'].includes(form.elements.product.value);
    const quantity = Number(form.elements.quantity.value);
    if (brush && quantity === 10 && country.value === 'ES') return t.brush_ten_price;
    if (brush && quantity === 100 && ['ES', 'DE'].includes(country.value)) return t.brush_hundred_price;
    const bulkNet = product.value === 'swabs' ? ({50:30, 100:55, 240:120})[quantity]
      : product.value === 'clips-bulk' ? ({24:24, 100:80})[quantity] : undefined;
    if (bulkNet !== undefined && country.value === 'ES') {
      const money = value => value.toLocaleString(document.documentElement.lang, {minimumFractionDigits:2, maximumFractionDigits:2});
      return t.order_bulk_price.replace('{net}', money(bulkNet)).replace('{gross}', money(bulkNet * 1.21));
    }
    return t.brush_other;
  };
  const unitKey = () => ({swabs:'order_unit_swabs', 'swabs-pack':'order_unit_swabs_pack',
    clips1:'order_unit_clips_set', clips2:'order_unit_clips_set', 'clips-bulk':'order_unit_clips'})[product.value] || 'order_unit_items';
  const refresh = () => {
    const t = I18N[document.documentElement.lang] || I18N.de;
    unit.textContent = t[unitKey()];
    summary.textContent = terms();
    if (params.has('product')) {
      const selected = new URL(location.href);
      selected.searchParams.set('product', product.value);
      selected.searchParams.set('quantity', quantityInput.value);
      history.replaceState(null, '', selected.pathname + selected.search + selected.hash);
    }
    presets.replaceChildren();
    const choices = product.value === 'swabs' ? [50, 100, 240] : product.value === 'clips-bulk' ? [24, 100] : [];
    if (choices.length) {
      const label = document.createElement('span');
      label.textContent = t.order_choose_lot;
      presets.appendChild(label);
      choices.forEach(quantity => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-ghost';
        button.style.cssText = 'border:1px solid currentColor;background:transparent;color:inherit;border-radius:999px;padding:8px 12px;font:inherit;cursor:pointer';
        button.textContent = quantity + ' ' + (product.value === 'swabs' ? t.order_boxes : t.order_clips);
        button.setAttribute('aria-pressed', String(Number(quantityInput.value) === quantity));
        button.addEventListener('click', () => { quantityInput.value = quantity; refresh(); });
        presets.appendChild(button);
      });
    }
  };
  const defaults = lang => { if (!countryChosen) country.value = lang === 'es' ? 'ES' : 'DE'; };
  defaults(document.documentElement.lang);
  // Only recognised products and whole, positive quantities can prefill an enquiry.
  const params = new URLSearchParams(location.search);
  const requestedProduct = params.get('product');
  if (Array.from(product.options).some(option => option.value === requestedProduct)) {
    product.value = requestedProduct;
    const requestedQuantity = Number(params.get('quantity'));
    quantityInput.value = Number.isInteger(requestedQuantity) && requestedQuantity >= 1 && requestedQuantity <= 99999 ? requestedQuantity : 1;
  }
  country.addEventListener('change', () => { countryChosen = true; refresh(); });
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  document.addEventListener('extendio-language', e => { defaults(e.detail); refresh(); });
  document.querySelectorAll('[data-brush-pack]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      if (!['mini', 'large'].includes(form.elements.product.value)) form.elements.product.value = 'mini';
      form.elements.quantity.value = link.dataset.brushPack;
      if (link.dataset.brushPack === '10') { country.value = 'ES'; countryChosen = true; }
      refresh();
      history.replaceState(null, '', location.pathname + location.search + '#order-enquiry');
      form.scrollIntoView({ block: 'center' });
      form.elements.product.focus({ preventScroll: true });
    });
  });
  refresh();
  form.addEventListener('submit', e => e.preventDefault());
  document.querySelectorAll('[data-order-contact]').forEach(link => {
    link.addEventListener('click', e => {
      if (!form.reportValidity() || !['ES', 'DE'].includes(country.value)) { e.preventDefault(); return; }
      const t = I18N[document.documentElement.lang] || I18N.de;
      const productName = product.selectedOptions[0].textContent;
      const message = [t.order_intro, t.order_product + ': ' + productName,
        t.order_quantity + ': ' + quantityInput.value + ' (' + t[unitKey()] + ')',
        t.order_country + ': ' + country.selectedOptions[0].textContent, terms(),
        ...(form.elements.postcode.value ? [t.order_postcode + ': ' + form.elements.postcode.value] : [])].join('\n');
      link.href = link.dataset.orderContact === 'whatsapp'
        ? 'https://wa.me/34634223898?text=' + encodeURIComponent(message)
        : 'mailto:extendio.es@gmail.com?subject=' + encodeURIComponent(t.mail_subject) + '&body=' + encodeURIComponent(message);
    });
  });
})();
