'use strict';

(() => {
  const leadForm = document.querySelector('#lead-form');
  if (!leadForm) return; // Форма есть только на contacts.html

  // 1. Читаем UTM-метки из адреса
  const params = new URLSearchParams(window.location.search);
  const defaults = {
    utm_source: 'direct',
    utm_medium: 'none',
    utm_campaign: 'not_set',
    utm_content: 'not_set'
  };

  for (const [key, fallback] of Object.entries(defaults)) {
    const field = leadForm.elements.namedItem(key);
    if (field) {
      field.value = params.get(key)?.trim() || fallback;
    }
  }

  // 2. Обработчик отправки формы
  const requestId = leadForm.elements.namedItem('request_id');

  leadForm.addEventListener('submit', (event) => {
    // Проверка адреса Apps Script
    const action = leadForm.getAttribute('action');
    const isValidUrl = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(action);

    if (!isValidUrl) {
      event.preventDefault();
      document.getElementById('form-status').textContent = 'Сначала укажите URL Apps Script в action формы.';
      return;
    }

    // Генерируем request_id, если его ещё нет
    if (!requestId.value) {
      requestId.value = 'REQ-' + crypto.randomUUID().toUpperCase();
    }

    // Отправляем событие в GA4
    if (typeof window.gtag === 'function') {
      gtag('event', 'generate_lead', {
        lead_source: 'contact_form'
      });
    }

    // Показываем номер заявки
    document.getElementById('form-status').textContent = 'Заявка отправлена. Номер: ' + requestId.value;
  });

  // 3. Обработчик кнопки "Новая заявка"
  leadForm.addEventListener('reset', () => {
    setTimeout(() => {
      requestId.value = '';
      for (const [key, fallback] of Object.entries(defaults)) {
        const field = leadForm.elements.namedItem(key);
        if (field) field.value = fallback;
      }
      document.getElementById('form-status').textContent = 'Можно заполнить новую заявку.';
    }, 0);
  });
})();