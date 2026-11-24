(() => {
      'use strict';

      const PRICING = Object.freeze({
        vatRate: 0.13,
        annualDiscountRate: 0.10,
        commercialMaxUsers: 150,
        monthlyOveragePerUser: 900,
        phone: '50684999099',
        institutionalDiscountRates: {
          monthly: 0.05,
          annual: 0.20
        },
        commercialPlans: {
          moon: {
            name: 'PRISMA MOON',
            capacity: 25,
            monthlyFinal: 50850,
            annualFinal: 549180
          },
          plus: {
            name: 'PRISMA PLUS',
            capacity: 50,
            monthlyFinal: 84750,
            annualFinal: 915300
          },
          gold: {
            name: 'PRISMA GOLD',
            capacity: 150,
            monthlyFinal: 186450,
            annualFinal: 2013660
          }
        },
        customMonthlyPoints: [
          { users: 1, monthlyBase: 2000 },
          { users: 25, monthlyBase: 45000 },
          { users: 50, monthlyBase: 75000 },
          { users: 150, monthlyBase: 165000 }
        ]
      });

      const formatter = new Intl.NumberFormat('es-CR', {
        maximumFractionDigits: 0
      });
      const cards = document.querySelectorAll('.plan-card[data-plan-key]');
      const buttons = document.querySelectorAll('[data-billing]');
      const range = document.getElementById('userRange');
      const rangeMaxLabel = document.getElementById('userRangeMax');
      const count = document.getElementById('userCount');
      const total = document.getElementById('quoteTotal');
      const perUser = document.getElementById('quotePerUser');
      const quotedUsers = document.getElementById('quoteUsers');
      const suggestedPlan = document.getElementById('quotePlan');
      const savings = document.getElementById('quoteSavings');
      const savingsAmount = document.getElementById('quoteSavingsAmount');
      const error = document.getElementById('quoteError');
      const request = document.getElementById('quoteRequest');
      let billing = 'monthly';

      function formatPrice(value) {
        const formatted = formatter.formatToParts(value)
          .map((part) => part.type === 'group' ? '.' : part.value)
          .join('');

        return `₡${formatted}`;
      }

      function setRequest(message) {
        request.href = `https://wa.me/${PRICING.phone}?text=${encodeURIComponent(message)}`;
        request.removeAttribute('aria-disabled');
        request.removeAttribute('tabindex');
      }

      function disableRequest() {
        request.removeAttribute('href');
        request.setAttribute('aria-disabled', 'true');
        request.setAttribute('tabindex', '-1');
      }

      function getMonthlyBase(users) {
        const points = PRICING.customMonthlyPoints;

        for (let index = 1; index < points.length; index += 1) {
          const right = points[index];

          if (users <= right.users) {
            const left = points[index - 1];
            const interpolated = left.monthlyBase
              + ((users - left.users)
                * (right.monthlyBase - left.monthlyBase)
                / (right.users - left.users));

            return Math.round(interpolated);
          }
        }

        const lastPoint = points[points.length - 1];

        return lastPoint.monthlyBase
          + (users - lastPoint.users) * PRICING.monthlyOveragePerUser;
      }

      function getCustomPrices(users) {
        const monthlyBase = getMonthlyBase(users);
        const annualBase = Math.round(
          monthlyBase * 12 * (1 - PRICING.annualDiscountRate)
        );

        return {
          monthly: Math.round(monthlyBase * (1 + PRICING.vatRate)),
          annual: Math.round(annualBase * (1 + PRICING.vatRate))
        };
      }

      function getSuggestedPlan(users, customPrices) {
        if (users === 1) {
          return `Suscripción individual · 1 usuario · ${formatPrice(customPrices.monthly)} al mes · ${formatPrice(customPrices.annual)} al año.`;
        }

        if (users > PRICING.commercialMaxUsers) {
          return `Plan personalizado · ${formatter.format(users)} usuarios.`;
        }

        const plan = Object.values(PRICING.commercialPlans)
          .find((candidate) => users <= candidate.capacity);

        if (!plan) {
          return 'Plan personalizado';
        }

        return `${plan.name} · Hasta ${formatter.format(plan.capacity)} usuarios · ${formatPrice(plan.monthlyFinal)} al mes · ${formatPrice(plan.annualFinal)} al año.`;
      }

      function renderCommercialPlans() {
        cards.forEach((card) => {
          const plan = PRICING.commercialPlans[card.dataset.planKey];

          if (!plan) {
            throw new Error(`No existe configuración de precios para ${card.dataset.planKey}.`);
          }

          card.querySelector('.plan-users').textContent =
            `Hasta ${formatter.format(plan.capacity)} usuarios`;
          card.querySelector('[data-price="monthly"]').textContent =
            formatPrice(plan.monthlyFinal);
          card.querySelector('[data-price="annual"]').textContent =
            formatPrice(plan.annualFinal);

          const message = [
            'Hola, equipo PRISMA.',
            `Me interesa el plan ${plan.name}.`,
            `Cupo: hasta ${formatter.format(plan.capacity)} usuarios.`,
            `Precio mensual final con IVA: ${formatPrice(plan.monthlyFinal)}.`,
            `Precio anual final con IVA: ${formatPrice(plan.annualFinal)}.`,
            'Quisiera recibir más información.'
          ].join('\n');

          card.querySelector('.plan-link').href =
            `https://wa.me/${PRICING.phone}?text=${encodeURIComponent(message)}`;
        });
      }

      function renderInstitutionalDiscounts() {
        document.querySelectorAll('[data-institutional-discount]')
          .forEach((label) => {
            const period = label.dataset.institutionalDiscount;
            const rate = PRICING.institutionalDiscountRates[period];

            if (rate === undefined) {
              throw new Error(`No existe configuración de descuento institucional para ${period}.`);
            }

            label.textContent =
              `${Math.round(rate * 100)} % de descuento ${period === 'monthly' ? 'mensual' : 'anual'}`;
          });
      }

      function renderQuote() {
        const users = Number(count.value);

        if (!Number.isSafeInteger(users) || users < 1 || users > 1000000000) {
          total.textContent = '—';
          perUser.textContent = '—';
          quotedUsers.textContent = '—';
          suggestedPlan.textContent = '—';
          savings.hidden = true;
          error.textContent = 'Ingresa una cantidad entera de usuarios entre 1 y 1.000.000.000.';
          count.setAttribute('aria-invalid', 'true');
          disableRequest();
          return;
        }

        count.removeAttribute('aria-invalid');
        if (users > Number(range.max)) {
          range.max = String(users);
          rangeMaxLabel.textContent = `${formatter.format(users)} usuarios`;
        }
        range.value = String(users);
        error.textContent = '';

        request.textContent = users > PRICING.commercialMaxUsers
          ? 'Solicitar cotización para más de 150 usuarios'
          : 'Solicitar cotización';
        const prices = getCustomPrices(users);
        const selectedPrice = prices[billing];
        const period = billing === 'annual' ? 'al año' : 'al mes';
        const commercialPlan = getSuggestedPlan(users, prices);

        total.textContent = `${formatPrice(selectedPrice)} ${period}`;
        perUser.textContent =
          `${formatPrice(Math.round(selectedPrice / users))} ${billing === 'annual' ? 'por usuario al año' : 'por usuario al mes'}`;
        quotedUsers.textContent =
          `${formatter.format(users)} ${users === 1 ? 'usuario' : 'usuarios'}`;
        suggestedPlan.textContent = commercialPlan;
        savings.hidden = billing !== 'annual';

        if (billing === 'annual') {
          const annualSavings = prices.monthly * 12 - prices.annual;
          savingsAmount.textContent =
            `${formatPrice(annualSavings)} frente a 12 pagos mensuales de ${formatPrice(prices.monthly)}; pago anual por adelantado.`;
        }

        setRequest([
          'Hola, equipo PRISMA.',
          'Solicito una cotización personalizada.',
          `Cantidad de usuarios: ${formatter.format(users)}.`,
          `Modalidad: ${billing === 'annual' ? 'anual' : 'mensual'}.`,
          `Total estimado con IVA: ${formatPrice(selectedPrice)} ${period}.`,
          `Precio estimado por usuario ${billing === 'annual' ? 'al año' : 'al mes'}: ${formatPrice(Math.round(selectedPrice / users))}.`,
          `Plan sugerido: ${commercialPlan}`
        ].join('\n'));
      }

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          billing = button.dataset.billing;
          buttons.forEach((option) => {
            option.setAttribute(
              'aria-pressed',
              String(option.dataset.billing === billing)
            );
          });
          renderQuote();
        });
      });

      range.addEventListener('input', () => {
        count.value = range.value;
        renderQuote();
      });

      count.addEventListener('input', renderQuote);
      count.addEventListener('change', renderQuote);

      range.max = String(PRICING.commercialMaxUsers);
      renderCommercialPlans();
      renderInstitutionalDiscounts();
      renderQuote();
    })();
