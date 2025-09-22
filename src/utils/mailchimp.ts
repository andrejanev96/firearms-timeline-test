export const subscribeToMailChimp = async (
  email: string,
  subscribeToBulletin: boolean
): Promise<boolean> => {
  // STRICT CONSENT LOGIC: Only proceed if user explicitly consented
  if (!subscribeToBulletin) {
    return true; // Return success but skip MailChimp
  }

  try {
    // Create iframe for form submission (replaces form embedding)
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'hidden_iframe_' + Date.now();

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://ammo.us2.list-manage.com/subscribe/post?u=92e5fabeec50377fd6b0c666d&id=835c3fc179&f_id=00d3c1e1f0';
    form.target = iframe.name;
    form.style.display = 'none';

    // Essential fields from embedded form
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'EMAIL';
    emailInput.value = email;
    emailInput.className = 'required email';
    emailInput.required = true;
    form.appendChild(emailInput);

    // Tags field - your tag ID is 248414
    const tagsInput = document.createElement('input');
    tagsInput.type = 'hidden';
    tagsInput.name = 'tags';
    tagsInput.value = '248414';
    form.appendChild(tagsInput);

    // Bot protection field - your bot field name
    const botInput = document.createElement('input');
    botInput.type = 'text';
    botInput.name = 'b_92e5fabeec50377fd6b0c666d_835c3fc179';
    botInput.value = '';
    botInput.style.position = 'absolute';
    botInput.style.left = '-5000px';
    botInput.setAttribute('tabindex', '-1');
    form.appendChild(botInput);

    // Submit button
    const submitInput = document.createElement('input');
    submitInput.type = 'submit';
    submitInput.name = 'subscribe';
    submitInput.value = 'Subscribe';
    submitInput.className = 'button';
    form.appendChild(submitInput);

    // Add to DOM, submit, cleanup
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    }, 3000);

    return true;
  } catch (error) {
    console.error('MailChimp subscription error:', error);
    return false;
  }
};