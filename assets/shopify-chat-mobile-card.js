(function () {
  var mobileQuery = window.matchMedia('(max-width: 749px)');
  var styleId = 'shopify-chat-mobile-card-style';
  var retryTimer;
  var retryCount = 0;
  var maxRetries = 80;
  var shadowObserver;
  var observedShadowRoot;

  function getChatHost() {
    var hosts = Array.prototype.slice.call(document.querySelectorAll('inbox-online-store-chat'));
    var hostWithVisibleChat = hosts.find(function (host) {
      var chatUi = host.shadowRoot && (host.shadowRoot.querySelector('#chat-ui.chat-ui') || host.shadowRoot.getElementById('chat-ui'));
      return isVisible(chatUi);
    });

    if (hostWithVisibleChat) return hostWithVisibleChat;

    return hosts.find(function (host) {
      return host.getAttribute('is-open') === 'true';
    }) || document.querySelector('inbox-online-store-chat#ShopifyChat') || hosts[0];
  }

  function getChatHosts() {
    return Array.prototype.slice.call(document.querySelectorAll('inbox-online-store-chat'));
  }

  function getChatUi() {
    var host = getChatHost();

    if (host && host.shadowRoot) {
      return host.shadowRoot.querySelector('#chat-ui.chat-ui') || host.shadowRoot.getElementById('chat-ui');
    }

    return document.querySelector('#chat-ui.chat-ui') || document.getElementById('chat-ui');
  }

  function getInterstitialView() {
    var host = getChatHost();

    if (host && host.shadowRoot) {
      return host.shadowRoot.querySelector('.interstitial-view.is-mobile');
    }

    return document.querySelector('.interstitial-view.is-mobile');
  }

  function isVisible(element) {
    return element && element.getAttribute('aria-hidden') !== 'true' && getComputedStyle(element).display !== 'none';
  }

  function isMobileChat(host, chatUi) {
    return mobileQuery.matches || Boolean(host && host.getAttribute('is-mobile')) || Boolean(chatUi && chatUi.classList.contains('is-mobile'));
  }

  function addStyles() {
    if (document.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '@media (max-width: 749px) {',
      '  inbox-online-store-chat#ShopifyChat[is-open="true"],',
      '  inbox-online-store-chat[is-open="true"] {',
      '    left: auto !important;',
      '    right: 12px !important;',
      '    bottom: 84px !important;',
      '    top: auto !important;',
      '    width: 376px !important;',
      '    height: 100% !important;',
      '    max-height: 60vh !important;',
      '    transform: none !important;',
      '    z-index: 2147483647 !important;',
      '  }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  function addShadowStyles(host) {
    if (!host || !host.shadowRoot || host.shadowRoot.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '#chat-ui.chat-ui {',
      '  width: unset !important;',
      '  border-radius: 10px !important;',
      '  overflow: hidden !important;',
      '  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22) !important;',
      '}',
      '#chat-ui .interstitial-view__welcome,',
      '#chat-ui .interstitial-view__welcome.is-mobile {',
      '  border-radius: 10px 10px 0 0 !important;',
      '}',
      '#chat-ui .interstitial-view__instant-answers-list {',
      '  overflow-y: auto !important;',
      '  padding: 22px 12px 12px !important;',
      '}',
      '#chat-ui .store-info.is-mobile {',
      '  padding: 18px 16px 10px !important;',
      '}',
      '#chat-ui .composer-bar-wrapper {',
      '  margin: 0 !important;',
      '  padding: 10px 12px 0 !important;',
      '}',
      '.chat-toggle.chat-toggle--bottom-right,',
      '.chat-app--close-button.chat-app--close-button-bottom-right {',
      '  position: fixed !important;',
      '  top: auto !important;',
      '  right: 16px !important;',
      '  left: auto !important;',
      '  bottom: 16px !important;',
      '  z-index: 2147483647 !important;',
      '}'
    ].join('\n');

    host.shadowRoot.appendChild(style);
  }

  function applyMobileCard() {
    var hosts = getChatHosts();

    if (!hosts.length) return;

    addStyles();

    hosts.forEach(function (host) {
      var chatUi = host.shadowRoot && (host.shadowRoot.querySelector('#chat-ui.chat-ui') || host.shadowRoot.getElementById('chat-ui'));
      var interstitialView = host.shadowRoot && host.shadowRoot.querySelector('.interstitial-view.is-mobile');
      var composerBarWrapper = host.shadowRoot && host.shadowRoot.querySelector('.composer-bar-wrapper');
      var launcherButton = host.shadowRoot && host.shadowRoot.querySelector('.chat-toggle.chat-toggle--bottom-right');
      var closeButton = host.shadowRoot && host.shadowRoot.querySelector('.chat-app--close-button.chat-app--close-button-bottom-right');
      var isOpen = host.getAttribute('is-open') === 'true' || isVisible(chatUi);

      if (!isMobileChat(host, chatUi)) return;

      addShadowStyles(host);

      if (isOpen) {
        host.style.setProperty('position', 'fixed', 'important');
        host.style.setProperty('width', '376px', 'important');
        host.style.setProperty('height', '100%', 'important');
        host.style.setProperty('max-height', '60vh', 'important');
        host.style.setProperty('left', 'auto', 'important');
        host.style.setProperty('right', '12px', 'important');
        host.style.setProperty('bottom', '84px', 'important');
        host.style.setProperty('top', 'auto', 'important');
        host.style.setProperty('transform', 'none', 'important');
      } else {
        host.style.removeProperty('width');
        host.style.removeProperty('height');
        host.style.removeProperty('max-height');
        host.style.removeProperty('left');
        host.style.setProperty('right', '16px', 'important');
        host.style.setProperty('bottom', '16px', 'important');
      }

      if (chatUi) {
        chatUi.style.setProperty('width', 'unset', 'important');
        chatUi.style.setProperty('height', 'unset', 'important');
        chatUi.style.setProperty('max-height', '100%', 'important');
      }

      if (interstitialView) {
        interstitialView.style.setProperty('width', 'unset', 'important');
        interstitialView.style.setProperty('height', 'unset', 'important');
        interstitialView.style.setProperty('max-height', '100%', 'important');
      }

      if (composerBarWrapper) {
        composerBarWrapper.style.setProperty('margin', '0', 'important');
      }

      [launcherButton, closeButton].forEach(function (button) {
        if (!button) return;

        button.style.setProperty('position', 'fixed', 'important');
        button.style.setProperty('top', 'auto', 'important');
        button.style.setProperty('right', '16px', 'important');
        button.style.setProperty('bottom', '16px', 'important');
        button.style.setProperty('left', 'auto', 'important');
        button.style.setProperty('z-index', '2147483647', 'important');
      });
    });
  }

  function observeShadowRoot() {
    var host = getChatHost();

    if (!host || !host.shadowRoot || observedShadowRoot === host.shadowRoot) return;

    if (shadowObserver) {
      shadowObserver.disconnect();
    }

    shadowObserver = new MutationObserver(applyMobileCard);
    shadowObserver.observe(host.shadowRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    observedShadowRoot = host.shadowRoot;
  }

  function scheduleApply() {
    window.clearTimeout(retryTimer);
    retryTimer = window.setTimeout(function () {
      applyMobileCard();
      observeShadowRoot();
      retryCount += 1;

      if (retryCount < maxRetries && (!getChatHost() || !getChatUi())) {
        scheduleApply();
      }
    }, 250);
  }

  function startAggressivePatch() {
    var runs = 0;
    var interval = window.setInterval(function () {
      applyMobileCard();
      observeShadowRoot();
      runs += 1;

      if (runs >= 120) {
        window.clearInterval(interval);
      }
    }, 250);
  }

  applyMobileCard();
  observeShadowRoot();
  scheduleApply();
  startAggressivePatch();

  var observer = new MutationObserver(function () {
    applyMobileCard();
    observeShadowRoot();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'is-open', 'is-mobile']
  });

  window.addEventListener('load', function () {
    window.setTimeout(scheduleApply, 500);
    window.setTimeout(scheduleApply, 1500);
    window.setTimeout(scheduleApply, 3000);
    window.setTimeout(startAggressivePatch, 500);
  });

  document.addEventListener('click', function () {
    retryCount = 0;
    scheduleApply();
  }, true);
})();
