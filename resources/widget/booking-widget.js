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

    var DEFAULT_PRIMARY = '#0063ff';

    // The company's brand colours, served with the config. `accent` is the
    // primary at 10% opacity — the same wash the booking page uses.
    var PRIMARY = config.primary || DEFAULT_PRIMARY;
    var ACCENT = config.accent || 'rgba(0, 99, 255, 0.1)';
    var label = config.label || 'Book online';

    /**
     * The launcher's glow: the brand primary at 35% opacity. Derived here
     * rather than served because it is the only place that needs it.
     */
    function glow() {
        var hex = /^#([0-9a-fA-F]{6})$/.exec(PRIMARY);

        if (!hex) {
            return 'rgba(0, 99, 255, .35)';
        }

        return (
            'rgba(' +
            parseInt(hex[1].slice(0, 2), 16) +
            ',' +
            parseInt(hex[1].slice(2, 4), 16) +
            ',' +
            parseInt(hex[1].slice(4, 6), 16) +
            ',.35)'
        );
    }

    // Desktop drawer width; also referenced when placing the close button just
    // outside the drawer's top-left corner.
    var DRAWER_WIDTH = 440;

    function injectStyles() {
        var css =
            "@import url('https://fonts.googleapis.com/css?family=Play:400,700&subset=latin,cyrillic');" +
            '.uponco-widget-launcher{position:fixed;right:30px;bottom:30px;z-index:2147483000;width:100px;height:100px;padding:0;border:0;background:transparent;cursor:pointer;box-sizing:border-box;}' +
            '.uponco-widget-launcher-bg{position:absolute;left:0;top:0;width:100px;height:100px;border-radius:50%;background:' +
            PRIMARY +
            ';opacity:.85;box-shadow:0 8px 24px ' +
            glow() +
            ';transition:transform .15s ease;box-sizing:border-box;}' +
            '.uponco-widget-launcher:hover .uponco-widget-launcher-bg{transform:scale(1.05);}' +
            '.uponco-widget-launcher-wave{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100%;height:100%;border-radius:50%;border:2px solid ' +
            PRIMARY +
            ';opacity:.9;box-sizing:border-box;animation:uponco-widget-wave 2s infinite cubic-bezier(.37,0,.8,.77);}' +
            '.uponco-widget-launcher-text{position:absolute;left:6px;right:6px;top:0;bottom:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;font:400 15px/1.25 "Play",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;letter-spacing:1.5px;pointer-events:none;box-sizing:border-box;}' +
            '@keyframes uponco-widget-wave{100%{width:200%;height:200%;border-color:transparent;opacity:0;}}' +
            '.uponco-widget-overlay{position:fixed;inset:0;z-index:2147483001;display:none;background:rgba(15,23,42,.5);opacity:0;transition:opacity .2s ease;}' +
            '.uponco-widget-overlay.is-open{display:block;opacity:1;}' +
            '.uponco-widget-frame-wrap{position:fixed;top:8px;right:8px;bottom:8px;width:' +
            DRAWER_WIDTH +
            'px;max-width:calc(100vw - 16px);background-color:#fff;background-image:linear-gradient(' +
            ACCENT +
            ',' +
            ACCENT +
            ');border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.35);transform:translateX(calc(100% + 16px));transition:transform .35s cubic-bezier(.32,.72,0,1);}' +
            '.uponco-widget-overlay.is-open .uponco-widget-frame-wrap{transform:translateX(0);}' +
            '.uponco-widget-frame-wrap iframe{width:100%;height:100%;border:0;display:block;}' +
            '.uponco-widget-close{position:fixed;top:14px;right:calc(' +
            DRAWER_WIDTH +
            'px + 24px);z-index:2147483002;width:40px;height:40px;border:0;border-radius:9999px;cursor:pointer;background:rgba(255,255,255,.92);color:#0f172a;font-size:22px;line-height:40px;text-align:center;padding:0;box-shadow:0 6px 16px rgba(0,0,0,.25);opacity:0;transform:scale(.9);transition:opacity .2s ease,transform .2s ease;}' +
            '.uponco-widget-overlay.is-open .uponco-widget-close{opacity:1;transform:scale(1);}' +
            '.uponco-widget-close:hover{background:#fff;}' +
            '@media (max-width:640px){.uponco-widget-frame-wrap{top:0;right:0;bottom:0;left:0;width:100%;max-width:100%;border-radius:0;transform:translateX(100%);}.uponco-widget-close{top:12px;right:12px;background:rgba(15,23,42,.55);color:#fff;box-shadow:none;}.uponco-widget-launcher{right:16px;bottom:16px;}}';

        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
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

        // The close button lives on the overlay (not inside the drawer, which
        // clips its overflow) so it can sit just outside the drawer's corner.
        var closeBtn = document.createElement('button');
        closeBtn.className = 'uponco-widget-close';
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', closeWidget);

        overlay.appendChild(frameWrap);
        overlay.appendChild(closeBtn);

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
        button.setAttribute('aria-label', label);
        button.innerHTML =
            '<span class="uponco-widget-launcher-bg"></span>' +
            '<span class="uponco-widget-launcher-wave"></span>' +
            '<span class="uponco-widget-launcher-text">' +
            label +
            '</span>';
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
