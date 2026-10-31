// Mobile Baidu home CSS-only injection, no network dependency.
(function () {
  var raw = $response && $response.body;
  if (typeof raw !== 'string' || !/<(?:html|head|body)[\s>]/i.test(raw)) return $done({});
  // Restrict to homepage (not search results).
  var path = ($request.url || '').replace(/^https?:\/\/(?:m|www)\.baidu\.com/i,'');
  if (!/^(?:\/|\/\?from=[A-Za-z0-9]{8,9})?$/.test(path)) return $done({});
  var css = '<style id="jc-baidu-home-clean">#s-news-wrapper,#s-news,.s-news-list-wrapper,.s-news-rank-wrapper,.s-news-wrapper,.s-home-news,.s-news-feed{display:none!important}</style>';
  if (raw.indexOf('jc-baidu-home-clean') !== -1) return $done({});
  var out = /<\/head\s*>/i.test(raw) ? raw.replace(/<\/head\s*>/i,css+'</head>') : raw.replace(/<body([^>]*)>/i,'<body$1>'+css);
  return $done(out===raw ? {} : {body:out});
})();
