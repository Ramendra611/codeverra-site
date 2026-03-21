(function () {
  'use strict';

  var state = {
    ready: false,
    loading: false,
    fuse: null,
    allTags: [],
    activeIdx: -1
  };

  function getEl() {
    return {
      bar:      document.getElementById('nav-search-bar'),
      inp:      document.getElementById('nav-search-inp'),
      dropdown: document.getElementById('nav-search-dropdown')
    };
  }

  function indexURL() {
    var bar = document.getElementById('nav-search-bar');
    return (bar && bar.dataset.index) || '/index.json';
  }

  /* ── helpers ─────────────────────────────────────────── */

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ── lazy load Fuse.js + index.json ─────────────────── */

  function ensureReady(cb) {
    if (state.ready) { cb(); return; }
    if (state.loading) return;
    state.loading = true;

    function loadIndex() {
      fetch(indexURL())
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var tagMap = {};
          data.forEach(function (item) {
            (item.tags || []).forEach(function (t) {
              tagMap[t.toLowerCase()] = t;
            });
          });
          state.allTags = Object.values(tagMap).sort();

          state.fuse = new Fuse(data, {
            keys: [
              { name: 'title',   weight: 0.6 },
              { name: 'tags',    weight: 0.3 },
              { name: 'summary', weight: 0.1 }
            ],
            threshold: 0.4,
            ignoreLocation: true,
            includeScore: true
          });

          state.ready   = true;
          state.loading = false;
          cb();
        })
        .catch(function (err) {
          console.error('nav-search: failed to load index', err);
          state.loading = false;
        });
    }

    if (window.Fuse) {
      loadIndex();
    } else {
      var s = document.createElement('script');
      s.src = '/js/fuse.basic.min.js';
      s.onload = loadIndex;
      s.onerror = function () { state.loading = false; };
      document.head.appendChild(s);
    }
  }

  /* ── search ──────────────────────────────────────────── */

  function runSearch(query) {
    var q = query.toLowerCase();

    var matchedTags = state.allTags.filter(function (t) {
      return t.toLowerCase().includes(q);
    });

    var posts = state.fuse.search(query, { limit: 7 }).map(function (r) {
      return r.item;
    });

    state.activeIdx = -1;
    renderDropdown(query, matchedTags, posts);
  }

  function tagSlug(tag) {
    return encodeURIComponent(tag.toLowerCase().replace(/ /g, '-'));
  }

  function renderDropdown(query, tags, posts) {
    var el = getEl();
    var html = '';

    if (!tags.length && !posts.length) {
      html = '<div class="nsd-empty">No results for "<strong>' + esc(query) + '</strong>"</div>';
      el.dropdown.innerHTML = html;
      el.dropdown.hidden = false;
      return;
    }

    if (tags.length) {
      html += '<div class="nsd-section">';
      html += '<div class="nsd-label">Topics</div>';
      html += '<div class="nsd-tags">';
      tags.forEach(function (tag) {
        html += '<a class="nsd-tag" href="/tags/' + tagSlug(tag) + '/">' + esc(tag) + '</a>';
      });
      html += '</div></div>';
    }

    if (posts.length) {
      html += '<div class="nsd-section">';
      html += '<div class="nsd-label">Posts</div>';
      html += '<div class="nsd-posts">';
      posts.forEach(function (item) {
        html += '<a class="nsd-post" href="' + esc(item.permalink) + '">';
        html += '<div class="nsd-post-title">' + esc(item.title) + '</div>';
        if (item.tags && item.tags.length) {
          html += '<div class="nsd-post-tags">';
          item.tags.slice(0, 4).forEach(function (t) {
            html += '<span>' + esc(t) + '</span>';
          });
          html += '</div>';
        }
        html += '</a>';
      });
      html += '</div></div>';
    }

    el.dropdown.innerHTML = html;
    el.dropdown.hidden = false;
  }

  /* ── keyboard navigation ─────────────────────────────── */

  function navigateResults(dir) {
    var links = Array.from(document.querySelectorAll('#nav-search-dropdown .nsd-post'));
    if (!links.length) return;

    if (state.activeIdx >= 0 && links[state.activeIdx]) {
      links[state.activeIdx].classList.remove('nsd-post--active');
    }
    state.activeIdx = Math.max(-1, Math.min(links.length - 1, state.activeIdx + dir));
    if (state.activeIdx >= 0) {
      links[state.activeIdx].classList.add('nsd-post--active');
      links[state.activeIdx].scrollIntoView({ block: 'nearest' });
    }
  }

  /* ── open / close ────────────────────────────────────── */

  function openSearch() {
    var el = getEl();
    el.bar.classList.add('open');
    el.inp.focus();
  }

  function closeSearch() {
    var el = getEl();
    el.bar.classList.remove('open');
    el.dropdown.hidden = true;
    el.inp.value = '';
    state.activeIdx = -1;
  }

  window.navSearchToggle = function () {
    var el = getEl();
    if (el.bar.classList.contains('open')) {
      closeSearch();
    } else {
      openSearch();
    }
  };

  /* ── wire events ─────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    var el = getEl();
    if (!el.inp || !el.dropdown) return;

    el.inp.addEventListener('input', function () {
      var q = this.value.trim();
      if (!q) { el.dropdown.hidden = true; return; }
      el.dropdown.innerHTML = '<div class="nsd-loading">Searching…</div>';
      el.dropdown.hidden = false;
      ensureReady(function () { runSearch(q); });
    });

    el.inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); navigateResults(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); navigateResults(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var active = document.querySelector('.nsd-post--active');
        if (active) active.click();
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#nav-search-bar') && !e.target.closest('.nav-search-item')) {
        closeSearch();
      }
    });
  });
})();
