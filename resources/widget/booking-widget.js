/**
 * Uponco embeddable booking widget.
 *
 * Injects a floating launcher button into the host page. Clicking it opens the
 * company's public booking page inside an overlay iframe. Configuration is
 * provided by the server as `window.__UPONCO_WIDGET__` immediately before this
 * script body runs.
 */
(function () {
    'use strict';

    var config = window.__UPONCO_WIDGET__;

    if (!config || !config.url) {
        return;
    }

    // Guard against the script being embedded more than once on a page.
    if (window.__uponcoWidgetLoaded) {
        return;
    }
    window.__uponcoWidgetLoaded = true;

    var PRIMARY = '#0063ff';
    var PRIMARY_DARK = '#3884fe';
    var label = config.label || 'Book online';

    function injectStyles() {
        var css =
            '.uponco-widget-launcher{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:inline-flex;align-items:center;gap:8px;padding:14px 20px;border:0;border-radius:9999px;cursor:pointer;font:600 15px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#fff;background:linear-gradient(135deg,' +
            PRIMARY +
            ',' +
            PRIMARY_DARK +
            ');box-shadow:0 8px 24px rgba(0,99,255,.35);transition:transform .15s ease,box-shadow .15s ease;}' +
            '.uponco-widget-launcher:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,99,255,.45);}' +
            '.uponco-widget-launcher svg{width:18px;height:18px;flex:none;}' +
            '.uponco-widget-overlay{position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.55);opacity:0;transition:opacity .2s ease;padding:16px;}' +
            '.uponco-widget-overlay.is-open{display:flex;opacity:1;}' +
            '.uponco-widget-frame-wrap{position:relative;width:100%;max-width:460px;height:100%;max-height:760px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.35);transform:translateY(12px);transition:transform .2s ease;}' +
            '.uponco-widget-overlay.is-open .uponco-widget-frame-wrap{transform:translateY(0);}' +
            '.uponco-widget-frame-wrap iframe{width:100%;height:100%;border:0;display:block;}' +
            '.uponco-widget-close{position:absolute;top:10px;right:10px;z-index:2;width:36px;height:36px;border:0;border-radius:9999px;cursor:pointer;background:rgba(15,23,42,.6);color:#fff;font-size:20px;line-height:36px;text-align:center;padding:0;}' +
            '.uponco-widget-close:hover{background:rgba(15,23,42,.85);}' +
            '@media (max-width:640px){.uponco-widget-overlay{padding:0;}.uponco-widget-frame-wrap{max-width:100%;max-height:100%;border-radius:0;}.uponco-widget-launcher{right:16px;bottom:16px;}}';

        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    function calendarIcon() {
        return (
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
        );
    }

    var overlay;
    var frameWrap;
    var iframeLoaded = false;

    function buildOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'uponco-widget-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', label);

        frameWrap = document.createElement('div');
        frameWrap.className = 'uponco-widget-frame-wrap';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'uponco-widget-close';
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', closeWidget);

        frameWrap.appendChild(closeBtn);
        overlay.appendChild(frameWrap);

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                closeWidget();
            }
        });

        document.body.appendChild(overlay);
    }

    function ensureIframe() {
        if (iframeLoaded) {
            return;
        }
        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', config.url);
        iframe.setAttribute('title', label);
        iframe.setAttribute('loading', 'lazy');
        frameWrap.appendChild(iframe);
        iframeLoaded = true;
    }

    function openWidget() {
        ensureIframe();
        overlay.classList.add('is-open');
        document.addEventListener('keydown', onKeydown);
    }

    function closeWidget() {
        overlay.classList.remove('is-open');
        document.removeEventListener('keydown', onKeydown);
    }

    function onKeydown(event) {
        if (event.key === 'Escape') {
            closeWidget();
        }
    }

    function buildLauncher() {
        var button = document.createElement('button');
        button.className = 'uponco-widget-launcher';
        button.setAttribute('type', 'button');
        button.innerHTML = calendarIcon() + '<span>' + label + '</span>';
        button.addEventListener('click', openWidget);
        document.body.appendChild(button);
    }

    function init() {
        injectStyles();
        buildOverlay();
        buildLauncher();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
