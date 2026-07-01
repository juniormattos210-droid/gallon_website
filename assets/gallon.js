/* GALLON · Cascalheira — shared behaviors */
(function(){
  // Mobile nav toggle
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mobile-nav');
  if(burger && mnav){
    burger.addEventListener('click', function(){
      var open = mnav.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open ? 'true':'false');
    });
    mnav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mnav.classList.remove('open');
        burger.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  // Scroll reveal — pure enhancement. Content is visible by default; the brief
  // hidden state is applied via .reveal-on, then we add .in to play the entrance.
  // We trigger with setTimeout (NOT requestAnimationFrame) because rAF is paused
  // in backgrounded/offscreen iframes, which would leave content stuck hidden.
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  function reveal(el){ el.classList.add('in'); }
  function inView(el){
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    return r.top < vh * 0.95 && r.bottom > -40;
  }
  function revealInView(){ els.forEach(function(el){ if(!el.classList.contains('in') && inView(el)) reveal(el); }); }
  if(els.length){
    document.documentElement.classList.add('reveal-on');

    var start = function(){
      revealInView();
      if('IntersectionObserver' in window){
        var io = new IntersectionObserver(function(entries){
          entries.forEach(function(e){ if(e.isIntersecting){ reveal(e.target); io.unobserve(e.target); } });
        },{threshold:.12, rootMargin:'0px 0px -8% 0px'});
        els.forEach(function(el){ if(!el.classList.contains('in')) io.observe(el); });
      }
      window.addEventListener('scroll', function(){ revealInView(); }, {passive:true});
    };
    setTimeout(start, 40);

    // Hard safety nets — in-view content must never stay hidden, even if the
    // observer/timer environment is throttled or transitions are frozen.
    setTimeout(revealInView, 500);
    setTimeout(function(){ els.forEach(reveal); }, 2000);
    // Last resort: drop the hidden state entirely so the resting style is visible
    // with no transition dependency (covers frozen-compositor iframes).
    setTimeout(function(){ document.documentElement.classList.remove('reveal-on'); }, 3200);
    window.addEventListener('load', revealInView);
  }

  // Footer year
  var y = document.querySelector('[data-year]');
  if(y){ y.textContent = new Date().getFullYear(); }

  // Product gallery — click a thumbnail to swap the main image
  var pdpMain = document.getElementById('pdp-main-img');
  var pdpThumbs = Array.prototype.slice.call(document.querySelectorAll('.pdp__thumb'));
  if(pdpMain && pdpThumbs.length){
    pdpThumbs.forEach(function(t){
      t.addEventListener('click', function(){
        var src = t.getAttribute('data-src');
        if(!src) return;
        pdpMain.style.opacity = '0';
        var swap = function(){ pdpMain.src = src; pdpMain.style.opacity = '1'; };
        setTimeout(swap, 140);
        pdpThumbs.forEach(function(x){ x.classList.remove('is-active'); });
        t.classList.add('is-active');
      });
    });
    pdpMain.style.transition = 'opacity .22s ease';
  }

  // Count-up numbers — runs once when revealed (or on load if in view)
  function runCount(el){
    if(el.dataset.counted) return; el.dataset.counted = '1';
    var target = parseFloat(el.getAttribute('data-countup')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500, start = null;
    var done = function(){ el.textContent = prefix + target + suffix; };
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    // guard: if rAF is throttled/frozen, still land on the final value
    setTimeout(done, dur + 500);
  }
  var counts = Array.prototype.slice.call(document.querySelectorAll('[data-countup]'));
  if(counts.length){
    var checkCounts = function(){
      var vh = window.innerHeight || 800;
      counts.forEach(function(el){
        if(el.dataset.counted) return;
        if(el.getBoundingClientRect().top < vh * 0.95) runCount(el);
      });
    };
    setTimeout(checkCounts, 60);
    setTimeout(checkCounts, 600);
    window.addEventListener('scroll', checkCounts, {passive:true});
    window.addEventListener('load', checkCounts);
  }
})();
