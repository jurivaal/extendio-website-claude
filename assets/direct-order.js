(() => {
  const form = document.querySelector('#order-enquiry');
  if (!form) return;
  const country = form.elements.country;
  let countryChosen = false;
  const defaults = lang => { if (!countryChosen) country.value = lang === 'es' ? 'ES' : 'DE'; };
  defaults(document.documentElement.lang);
  country.addEventListener('change', () => { countryChosen = true; });
  document.addEventListener('extendio-language', e => defaults(e.detail));
  form.addEventListener('submit', e => e.preventDefault());
  document.querySelectorAll('[data-order-contact]').forEach(link => {
    link.addEventListener('click', e => {
      if (!form.reportValidity() || !['ES', 'DE'].includes(country.value)) { e.preventDefault(); return; }
      const t = I18N[document.documentElement.lang] || I18N.de;
      const product = form.elements.product.selectedOptions[0].textContent;
      const message = [t.order_intro, t.order_product + ': ' + product,
        t.order_quantity + ': ' + form.elements.quantity.value,
        t.order_country + ': ' + country.selectedOptions[0].textContent,
        ...(form.elements.postcode.value ? [t.order_postcode + ': ' + form.elements.postcode.value] : [])].join('\n');
      link.href = link.dataset.orderContact === 'whatsapp'
        ? 'https://wa.me/34634223898?text=' + encodeURIComponent(message)
        : 'mailto:extendio.es@gmail.com?subject=' + encodeURIComponent(t.mail_subject) + '&body=' + encodeURIComponent(message);
    });
  });
})();
