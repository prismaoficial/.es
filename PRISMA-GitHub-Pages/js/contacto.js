(() => {
      'use strict';

      const form = document.getElementById('prismaContactForm');
      const status = document.getElementById('prismaContactStatus');

      const recipientEmail = 'prismainnovagestos@gmail.com';
      const recipientPhone = '50684999099';

      const nameField = form.elements.namedItem('name');
      const emailField = form.elements.namedItem('email');
      const subjectField = form.elements.namedItem('subject');
      const messageField = form.elements.namedItem('message');

      const fields = [
        nameField,
        emailField,
        subjectField,
        messageField
      ];

      form.noValidate = true;
      form.querySelectorAll('button[type=submit]').forEach(button => { button.disabled = false; });

      form.addEventListener('submit', (event) => {
        event.preventDefault();

        fields.forEach((field) => {
          field.value = field.value.trim();
          field.setCustomValidity('');
        });

        if (nameField.value.length < 2) {
          nameField.setCustomValidity(
            'Escribe un nombre de al menos 2 caracteres.'
          );
        }

        if (subjectField.value.length < 3) {
          subjectField.setCustomValidity(
            'Escribe un asunto de al menos 3 caracteres.'
          );
        }

        if (messageField.value.length < 10) {
          messageField.setCustomValidity(
            'Escribe un mensaje de al menos 10 caracteres.'
          );
        }

        if (!form.reportValidity()) {
          status.textContent =
            'Revisa los campos indicados antes de continuar.';
          return;
        }

        const channel = event.submitter?.value || 'email';

        const body = [
          'Hola, equipo PRISMA.',
          '',
          `Nombre: ${nameField.value}`,
          `Correo de contacto: ${emailField.value}`,
          `Asunto: ${subjectField.value}`,
          '',
          messageField.value
        ].join('\r\n');

        if (channel === 'whatsapp') {
          const url = `https://wa.me/${recipientPhone}`
            + `?text=${encodeURIComponent(body)}`;

          status.textContent =
            'Continúa en WhatsApp y confirma el envío de tu mensaje.';

          window.location.assign(url);
          return;
        }

        const url = `mailto:${recipientEmail}`
          + `?subject=${encodeURIComponent(subjectField.value)}`
          + `&body=${encodeURIComponent(body)}`;

        status.textContent =
          'Se solicitó abrir tu aplicación de correo. '
          + 'Revisa el mensaje y confirma el envío desde allí. '
          + 'Si no se abre, utiliza el enlace de correo directo.';

        window.location.href = url;
      });

      form.addEventListener('input', (event) => {
        if (typeof event.target.setCustomValidity === 'function') {
          event.target.setCustomValidity('');
        }

        status.textContent = '';
      });
    })();
