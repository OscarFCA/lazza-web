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
     Video del hero
     El autoplay va en el HTML para que funcione aunque este archivo falle.
     Aquí solo se corrige el caso en que el visitante pidió menos movimiento:
     entonces se queda el póster fijo, que es exactamente lo que pidió.
     --------------------------------------------------------------------- */
  var video = document.querySelector('.hero__video');
  if (video) {
    var quietud = window.matchMedia('(prefers-reduced-motion: reduce)');

    var aplicar = function () {
      if (quietud.matches) {
        video.pause();
        video.removeAttribute('autoplay');
        video.removeAttribute('loop');
      } else if (video.paused) {
        var intento = video.play();
        /* Si el navegador rechaza el autoplay, no pasa nada: queda el póster */
        if (intento && typeof intento.catch === 'function') { intento.catch(function () {}); }
      }
    };

    aplicar();
    if (typeof quietud.addEventListener === 'function') {
      quietud.addEventListener('change', aplicar);
    }

    /* Fuera de pantalla no tiene sentido decodificar 8 segundos en bucle */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (quietud.matches) return;
          if (e.isIntersecting) { video.play().catch(function () {}); }
          else { video.pause(); }
        });
      }, { threshold: 0.1 }).observe(video);
    }
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
     Visor de imagen
     Amplía las imágenes del portafolio. Se arma sobre lo que ya existe en la
     página: no hay marcado especial en el HTML, así que si este archivo falla
     las imágenes siguen siendo imágenes y no queda un botón muerto.
     --------------------------------------------------------------------- */
  var galeria = [].slice.call(
    document.querySelectorAll('main img.media-completa, main img.media-retrato')
  );

  if (galeria.length) {
    var visor, imagen, leyenda, contador, btnPrev, btnNext, btnCerrar;
    var indice = 0;
    var quienAbrio = null;

    var construir = function () {
      visor = document.createElement('div');
      visor.className = 'visor';
      visor.setAttribute('role', 'dialog');
      visor.setAttribute('aria-modal', 'true');
      visor.setAttribute('aria-label', 'Imagen ampliada');
      visor.innerHTML =
        '<button class="visor__boton visor__cerrar" type="button" aria-label="Cerrar la imagen">✕</button>' +
        '<button class="visor__boton visor__anterior" type="button" aria-label="Imagen anterior">‹</button>' +
        '<button class="visor__boton visor__siguiente" type="button" aria-label="Imagen siguiente">›</button>' +
        '<figure class="visor__figura">' +
        '<img class="visor__img" alt="">' +
        '<figcaption class="visor__pie">' +
        '<p class="visor__leyenda"></p><p class="visor__contador"></p>' +
        '</figcaption></figure>';
      document.body.appendChild(visor);

      imagen    = visor.querySelector('.visor__img');
      leyenda   = visor.querySelector('.visor__leyenda');
      contador  = visor.querySelector('.visor__contador');
      btnPrev   = visor.querySelector('.visor__anterior');
      btnNext   = visor.querySelector('.visor__siguiente');
      btnCerrar = visor.querySelector('.visor__cerrar');

      btnCerrar.addEventListener('click', cerrarVisor);
      btnPrev.addEventListener('click', function () { mover(-1); });
      btnNext.addEventListener('click', function () { mover(1); });
      /* Clic fuera de la imagen cierra; sobre la imagen, no */
      visor.addEventListener('click', function (e) { if (e.target === visor) cerrarVisor(); });
    };

    var pintar = function () {
      var el = galeria[indice];
      imagen.src = el.currentSrc || el.src;
      imagen.alt = el.alt || '';
      leyenda.textContent = el.alt || '';
      contador.textContent = (indice + 1) + ' / ' + galeria.length;
      var unaSola = galeria.length < 2;
      btnPrev.hidden = unaSola;
      btnNext.hidden = unaSola;
    };

    var mover = function (paso) {
      indice = (indice + paso + galeria.length) % galeria.length;
      pintar();
    };

    var abrirVisor = function (i) {
      if (!visor) construir();
      quienAbrio = galeria[i];
      indice = i;
      pintar();
      visor.classList.add('visor--abierto');
      document.body.style.overflow = 'hidden';
      btnCerrar.focus();
      enviar('galeria_zoom', {
        pagina: document.body.getAttribute('data-pagina') || '',
        imagen: (galeria[i].getAttribute('src') || '').split('/').pop()
      });
    };

    var cerrarVisor = function () {
      visor.classList.remove('visor--abierto');
      document.body.style.overflow = '';
      if (quienAbrio) { quienAbrio.focus(); quienAbrio = null; }
    };

    galeria.forEach(function (img, i) {
      img.classList.add('ampliable');
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.setAttribute('aria-label', 'Ampliar: ' + (img.alt || 'imagen del proyecto'));
      img.addEventListener('click', function () { abrirVisor(i); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirVisor(i); }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!visor || !visor.classList.contains('visor--abierto')) return;
      if (e.key === 'Escape') { e.preventDefault(); cerrarVisor(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
      else if (e.key === 'Tab') {
        /* El foco se queda dentro del visor mientras está abierto */
        var focos = [btnCerrar, btnPrev, btnNext].filter(function (b) { return !b.hidden; });
        var pos = focos.indexOf(document.activeElement);
        e.preventDefault();
        focos[(pos + (e.shiftKey ? -1 : 1) + focos.length) % focos.length].focus();
      }
    });
  }

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
