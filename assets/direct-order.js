(() => {
  const form = document.querySelector('#order-enquiry');
  if (!form) return;
  const country = form.elements.country;
  let countryChosen = false;
  const summary = document.createElement('p');
  summary.setAttribute('aria-live', 'polite');
  form.appendChild(summary);
  const terms = () => {
    const t = I18N[document.documentElement.lang] || I18N.de;
    const brush = ['mini', 'large'].includes(form.elements.product.value);
    const quantity = Number(form.elements.quantity.value);
    if (brush && quantity === 10 && country.value === 'ES') return t.brush_ten_price;
    if (brush && quantity === 100 && ['ES', 'DE'].includes(country.value)) return t.brush_hundred_price;
    return t.brush_other;
  };
  const refresh = () => { summary.textContent = terms(); };
  const defaults = lang => { if (!countryChosen) country.value = lang === 'es' ? 'ES' : 'DE'; };
  defaults(document.documentElement.lang);
  country.addEventListener('change', () => { countryChosen = true; refresh(); });
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  document.addEventListener('extendio-language', e => { defaults(e.detail); refresh(); });
  document.querySelectorAll('[data-brush-pack]').forEach(link => {
    link.addEventListener('click', () => {
      if (!['mini', 'large'].includes(form.elements.product.value)) form.elements.product.value = 'mini';
      form.elements.quantity.value = link.dataset.brushPack;
      if (link.dataset.brushPack === '10') { country.value = 'ES'; countryChosen = true; }
      refresh();
      form.elements.product.focus();
    });
  });
  refresh();
  form.addEventListener('submit', e => e.preventDefault());
  document.querySelectorAll('[data-order-contact]').forEach(link => {
    link.addEventListener('click', e => {
      if (!form.reportValidity() || !['ES', 'DE'].includes(country.value)) { e.preventDefault(); return; }
      const t = I18N[document.documentElement.lang] || I18N.de;
      const product = form.elements.product.selectedOptions[0].textContent;
      const message = [t.order_intro, t.order_product + ': ' + product,
        t.order_quantity + ': ' + form.elements.quantity.value,
        t.order_country + ': ' + country.selectedOptions[0].textContent, terms(),
        ...(form.elements.postcode.value ? [t.order_postcode + ': ' + form.elements.postcode.value] : [])].join('\n');
      link.href = link.dataset.orderContact === 'whatsapp'
        ? 'https://wa.me/34634223898?text=' + encodeURIComponent(message)
        : 'mailto:extendio.es@gmail.com?subject=' + encodeURIComponent(t.mail_subject) + '&body=' + encodeURIComponent(message);
    });
  });
})();
