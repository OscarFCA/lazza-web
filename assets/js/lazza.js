/* Lazza Arquitectura — comportamiento mínimo.
   El sitio es estático. Aquí solo vive lo que no puede ser CSS:
   el menú de móvil, la medición y la validación del formulario. */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Menú de móvil
     --------------------------------------------------------------------- */
  var nav = document.querySelector('[data-nav]');
  var boton = document.querySelector('[data-nav-boton]');

  if (nav && boton) {
    var abrir = function (abierta) {
      nav.classList.toggle('nav--abierta', abierta);
      boton.setAttribute('aria-expanded', String(abierta));
      boton.textContent = abierta ? 'Cerrar' : 'Menú';
      document.body.style.overflow = abierta ? 'hidden' : '';
    };

    boton.addEventListener('click', function () {
      abrir(!nav.classList.contains('nav--abierta'));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav--abierta')) {
        abrir(false);
        boton.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Medición
     Cada elemento medible declara data-analytics con el nombre del evento.
     Si GA4 no está cargado, no pasa nada: la página funciona igual.
     --------------------------------------------------------------------- */
  var enviar = function (evento, parametros) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', evento, parametros || {});
    }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-analytics]');
    if (!el) return;
    enviar(el.getAttribute('data-analytics'), {
      destino: el.getAttribute('href') || '',
      pagina: document.body.getAttribute('data-pagina') || ''
    });
  });

  /* Scroll al 75 %, una sola vez por carga */
  var scrollMedido = false;
  window.addEventListener('scroll', function () {
    if (scrollMedido) return;
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    if (alto > 0 && (window.scrollY / alto) >= 0.75) {
      scrollMedido = true;
      enviar('scroll_75', { pagina: document.body.getAttribute('data-pagina') || '' });
    }
  }, { passive: true });

  /* ---------------------------------------------------------------------
     Validación de formulario
     Corre al enviar, no mientras se escribe: interrumpir a alguien que
     todavía está escribiendo su nombre es hostil.
     --------------------------------------------------------------------- */
  var form = document.querySelector('[data-form]');
  if (form) {
    form.setAttribute('novalidate', 'novalidate');

    form.addEventListener('submit', function (e) {
      var valido = true;
      var primerError = null;

      Array.prototype.forEach.call(form.querySelectorAll('.campo'), function (campo) {
        var control = campo.querySelector('.campo__control');
        if (!control || !control.required) return;

        var vacio = !control.value.trim();
        var formatoMal = !vacio && control.checkValidity && !control.checkValidity();
        var falla = vacio || formatoMal;

        campo.setAttribute('data-error', String(falla));
        control.setAttribute('aria-invalid', String(falla));

        if (falla) {
          var mensaje = campo.querySelector('.campo__error');
          if (mensaje) {
            mensaje.textContent = vacio
              ? mensaje.getAttribute('data-vacio') || 'Este campo es necesario.'
              : mensaje.getAttribute('data-formato') || 'Revisa el formato.';
          }
          valido = false;
          if (!primerError) primerError = control;
        }
      });

      if (!valido) {
        e.preventDefault();
        if (primerError) primerError.focus();
        enviar('form_error', { pagina: document.body.getAttribute('data-pagina') || '' });
      } else {
        enviar('form_submit', { pagina: document.body.getAttribute('data-pagina') || '' });
      }
    });
  }
})();
