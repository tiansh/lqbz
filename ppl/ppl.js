var glo = {
  mx: 8,
  my: 11,
  mc: 8,
  r: 24,
  img: ['none',
    'blue', 'red', 'green',
    'yellow', 'gray', 'black',
    'orange', 'magenta'
  ],
  bimg: ['', 'fb', 'eb', 'wb'],
  sx: 168,
  sy: Math.sqrt(3) * 240 + 72,
  SQRT3: Math.sqrt(3),
  a: [],
  deg: 0,
  mdeg: 82.81924421854171867696100437385,
  edeg: 1.1042565895805562490261467249847,
  input: false,
  cc: 3,
  nc: 2,
  cd: 0,
  level: 0,
  score: 0,
  itimer: 0,
  levelt: 0,
  bcount: 0
};

var $ = function (c) { return document.querySelector(c); };
var $$ = function (c) { return document.querySelectorAll(c); };
var HTTPGet = function (url, callback, callback2) {
  var xmlHttp;
  try { xmlHttp = new XMLHttpRequest(); }
  catch (e1) {
    try { xmlHttp = new ActiveXObject("Msxml2.XMLHTTP"); }
    catch (e2) { xmlHttp = new ActiveXObject("Microsoft.XMLHTTP"); }
  }
  xmlHttp.open('GET', url, true);
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) callback(xmlHttp);
      else callback2(xmlHttp);
    }
  }
  xmlHttp.send('');
};

var addScore = function (ds) {
  glo.score += ds;
  $('#s').innerHTML = glo.score;
};

var showLevel = function () {
  $('#e').innerHTML = glo.level;
}

var initLevelTimer = function () {
  glo.levelt = Number(new Date());
};

var levelTimeScore = function () {
  var t = Number(new Date());
  t = Math.floor((t - glo.levelt) / 5000) + 1;
  t = Math.floor(50 / t) * 1000;
  addScore(t);
};

var setBallColor = function (b, c) {
  if (c >= 0) b.style.backgroundImage = 'url(pic/' + glo.img[c] + '.png)';
  else if (c < 0 && c > -3) b.style.backgroundImage = 'url(pic/' + glo.bimg[-c] + '.png)';
  else b.style.backgroundImage = 'url(pic/' + glo.bimg[3] + '.png)';
};

var setBallPos = function (b, x, y) {
  b.style.left = x + 'px';
  b.style.top = y + 'px';
};

var setFixBall = function (x, y, c) {
  glo.a[x][y] = c;
  setBallColor($('#b' + x + '_' + y), c);
};

var redrawFix = function () {
  var i, j;
  for (i = 0; i < glo.a.length; i++) for (j = 0; j < glo.a[i].length; j++)
    if (glo.a[i][j] !== null) setFixBall(i, j, glo.a[i][j]);
};

var printCurrentBall = function () {
  var a = $('#a'); a.className = 'b';
  setBallPos(a, glo.sx, glo.sy);
  setBallColor(a, glo.cc);
};

var newBall = function (d) {
  var b = document.createElement('div');
  b.className = 'b';
  if (typeof(d.c) !== 'undefined') setBallColor(b, d.c);
  if ((typeof(d.x) !== 'undefined') && (typeof(d.y) !== 'undefined')) setBallPos(b, d.x, d.y);
  if (typeof(d.i) !== 'undefined') b.id = d.i;
  return b;
};

var initFixBalls = function () {
  var f = $('#f');
  var i, j, b;
  for (i = 0; i < glo.mx; i++) {
    glo.a[i] = [];
    for (j = 0; j < glo.my + 1; j++) if ((i !== glo.mx - 1) || (~j & 1))
      f.appendChild(newBall({ c: glo.a[i][j] = 0,
        x: (2 * i + ((j & 1) ? 1 : 0)) * glo.r,
        y: (glo.SQRT3 * j) * glo.r,
        i: ['b', i, '_', j].join('')
      })); else glo.a[i][j] = null;
  }
};

var distance = function (dx, dy) {
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

var moveBall = function (mb) {
  var x = glo.sx, y = glo.sy;
  var d = glo.deg / 180 * Math.PI;
  var a = $('#a');
  var w = 2 * (glo.mx - 1) * glo.r;
  a.className = 'mb';
  var m = function () {
    var h = false, i, n, l, m, s, p, q, r;
    x += Math.sin(d) * 12;
    y -= Math.cos(d) * 12;
    if (x < 0) {
      y -= x / Math.sin(d) * Math.cos(d);
      x = 0;
      d = -d;
    }
    if (x > w) {
      y -= (w - x) / Math.sin(d) * Math.cos(d);
      x = w;
      d = -d;
    }
    h = y <= (glo.SQRT3 * glo.cd * glo.r);
    l = $$('#f .b');
    m = Infinity;
    for (i = 0; i < l.length; i++) {
      p = Number(l[i].id.replace(/^b(\d*)_\d*$/, '$1'));
      q = Number(l[i].id.replace(/^b\d*_(\d*)$/, '$1'));
      s = distance(
        x - (2 * p + ((q & 1) ? 1 : 0)) * glo.r,
        y - (glo.SQRT3 * (q + glo.cd)) * glo.r
      );
      if (glo.a[p][q]) h = h || s < 2 * glo.r;
      else if (s <= m) {
        r = false;
        around6(function (x, y) { if (glo.a[x][y]) r = true; }, p, q);
        if (q === 0) r = true;
        if (r) { m = s; n = [p, q]; }
      }
    }
    if (h) return cb(n[0], n[1]);
    setBallPos(a, x, y);
    setTimeout(arguments.callee, 32);
  };
  var cb = function (x, y) {
    setFixBall(x, y, glo.cc);
    a.className = 'b';
    setBallColor(a, 0);
    setBallPos(a, glo.sx, glo.sy);
    setTimeout(function () { mb(x, y); }, 32);
  };
  m();
};

var checkLose = function () {
  var i, j;
  for (i = 0; i < glo.a.length; i++) for (j = glo.my - glo.cd; j < glo.a[i].length; j++)
    if (glo.a[i][j]) return true;
  return false;
};

var around6 = function (g, x, y) {
  var f = function (x, y) {
    if ((x < 0) || (x >= glo.mx) || (y < 0) || (y >= glo.my + 1)) return;
    g(x, y);
  }
  f(x + 1          , y);
  f(x - 1          , y);
  f(x - 1 + (y & 1), y - 1);
  f(x     + (y & 1), y - 1);
  f(x - 1 + (y & 1), y + 1);
  f(x     + (y & 1), y + 1);
};

var checkRemoveBall = function (x, y) {
  var c = 1, o = glo.a[x][y];
  var q = [[x, y]], s, i, j;
  var checkXY = function (x, y) {
    var i;
    for (i = 0; i < q.length; i++) if (q[i][0] === x && q[i][1] === y) return null;
    if (glo.a[x][y] !== o) return null;
    return q[i] = [x, y];
  };
  for (s = 0; s < q.length; s++) around6(checkXY, q[s][0], q[s][1]);
  if (q.length >= 3) {
    for (s = 0; s < q.length; s++) setFixBall(q[s][0], q[s][1], 0);
    addScore(q.length <= 5 ? [60, 120, 150][q.length - 3] : q.length * 50);
  }
};

var fallDown = function () {
  var q = [], i, j, s;
  var checkB = function (x, y) {
    var i;
    for (i = 0; i < q.length; i++) if (q[i][0] === x && q[i][1] === y) return null;
    if (!glo.a[x][y]) return null;
    return q[i] = [x, y];
  };
  for (i = 0; i < glo.a.length; i++) checkB(i, 0);
  for (s = 0; s < q.length; s++) around6(checkB, q[s][0], q[s][1]);
  for (i = 0; i < glo.a.length; i++) for (j = 0; j < glo.a[i].length; j++)
    if (glo.a[i][j] && checkB(i, j)) { setFixBall(i, j, 0); addScore(10); }
}

var fireBall = function (x, y) {
  around6(function (x_, y_) {
    if (y_ >= y) return;
    around6(function (x__, y__) {
      if (glo.a[x__][y__]) { setFixBall(x__, y__, 0); addScore(10); }
    }, x_, y_);
  }, x, y);
};

var electricBall = function (x, y, x0, y0) {
  var d = ((x << 1) + (y & 1)) > ((x0 << 1) + (y0 & 1)) ? -1 : 1, i;
  for (i = x; i >= 0 && i < glo.a.length && glo.a[i][y] !== null; i += d)
    if (glo.a[i][y]) { setFixBall(i, y, 0); addScore(10); }
};

var waterBall = function (x, y) {
  var w = -3 - glo.a[x][y];
  if (w === 0) w = genColor();
  for (j = y; j < glo.a.length; j++)
    if ((j - y) & 1) {
      if (glo.a[x + (y & 1)    ][j] > 0) setFixBall(x + (y & 1)    , j, w);
      if (glo.a[x + (y & 1) - 1][j] > 0) setFixBall(x + (y & 1) - 1, j, w);
    } else {
      if (glo.a[x][j] > 0) setFixBall(x, j, w);
    }
  setFixBall(x, y, 0); addScore(10);
}

var checkFuncBall = function (x, y) {
  around6(function (x_, y_) { if (glo.a[x_][y_] < 0) {
    if (glo.a[x_][y_] === -1) fireBall(x_, y_);
    if (glo.a[x_][y_] === -2) electricBall(x_, y_, x, y);
    if (glo.a[x_][y_] <= -3) waterBall(x_, y_);
  }}, x, y);
}

var showLose = function () {
  alert('……');
  document.location.replace(
    document.location.href.replace(/#.*$/, '') + '#level=' + glo.level);
  window.location.reload();
};

var checkWin = function () {
  var i, j;
  for (i = 0; i < glo.a.length; i++) for (j = 0; j < glo.a.length; j++)
    if (glo.a[i][j] > 0) return false;
  return true;
};

var setCeiling = function (c) {
  glo.cd = c;
  var f = $('#f');
  f.style.marginTop = (((c === glo.my) ?
    (glo.SQRT3 * (glo.my - 1) + 2) * glo.r :
    (glo.SQRT3 * c) * glo.r) - 2) + 'px';
  f.style.height = ((c === glo.my) ? 0 :
    (glo.SQRT3 * (glo.my - c - 1) + 2) * glo.r) +'px';
  f.style.borderTopColor = 'cyan';
};

var ceilingDown = function () {
  glo.bcount++;
  if (glo.bcount > 6 && glo.bcount < 9) {
    $('#f').style.borderTopColor = 'yellow';
  } else if (glo.bcount === 9) {
    $('#f').style.borderTopColor = 'red';
  } else if (glo.bcount === 10) {
    setCeiling(glo.cd + 1);
    glo.bcount = 0;
  }
};

var shotBall = function () {
  disableInput();
  moveBall(function (x, y) {
    checkRemoveBall(x, y);
    checkFuncBall(x, y);
    fallDown();
    if (checkWin()) {
      levelTimeScore();
      loadLevel();
    } else {
      ceilingDown();
      if (checkLose()) {
        showLose();
      } else {
        makeNextBall();
        enableInput();
      }
    }
  });
};

var updateTimer = function () {
  if (!glo.input) {
    $('#t').innerHTML = '';
    return false;
  }
  var t = Number(new Date());
  t = Math.floor((glo.itimer - t) / 1000);
  if (t === 10) t = 9;
  if (t < 0) return true;
  $('#t').innerHTML = t;
  return false;
}
var enableInput = function () {
  glo.input = true;
  glo.itimer = Number(new Date()) + 10000;
  updateTimer();
};
var disableInput = function () {
  glo.input = false;
  glo.itimer = 0;
};

var leftKey = function (c) {
  glo.deg -= glo.edeg;
  if (glo.deg < -glo.mdeg) glo.deg = -glo.mdeg;
  drawArrow();
};
var upKey = function (c) {
  var nd = Math.abs(glo.deg) - glo.edeg;
  if (nd < 0) nd = 0;
  glo.deg = glo.deg > 0 ? nd : -nd;
  drawArrow();
};
var rightKey = function (c) {
  glo.deg +=glo.edeg;
  if (glo.deg > glo.mdeg) glo.deg = glo.mdeg;
  drawArrow();
};
var shotKey = function (c) {
  if (c) return;
  shotBall();
};

var keyPressed = function (k, c) {
  if (glo.input)
  ({LEFT: leftKey, UP: upKey, RIGHT: rightKey, DOWN: shotKey}[k](c));
};

var initInput = function () {
  var timer;
  var keys = {
    LEFT: [37, 65],
    UP: [38, 188, 87],
    RIGHT: [39, 69, 68],
    DOWN: [40, 79, 83, 32, 13]
  };
  var c;
  window.addEventListener('keydown', function (e) {
    var t;
    if (timer) clearInterval(timer); timer = null;
    c = 0;
    for (t in keys) if (keys[t].indexOf(e.which) !== -1) (function (t) {
      keyPressed(t, 0);
      timer = setInterval(function () {
        keyPressed(t, ++c);
      }, 10);
    }(t))
  });
  window.addEventListener('keyup', function () {
    if (timer) clearInterval(timer);
  });
  window.addEventListener('keypress', function (e) {
    e.preventDefault();
  });
  setInterval(function () {
    var f; try { f = document.hasFocus(); } catch (e) { f = true; }
    if (f) { if (updateTimer()) keyPressed('DOWN', 0); }
    else { glo.itimer += 10; }
  }, 10);
};

var drawArrow = function (d) {
  if (typeof(d) !== 'undefined') glo.deg = d;
  var s = $('#r');
  try {
    s.style.MozTransform = s.style.OTransform
     = s.style.msTransform = s.style.WebkitTransform
     = s.style.transform = 'rotate(' + glo.deg + 'deg)';
  } catch(e) {}
};

var genColor = function () {
  var c = [], i, j, k;
  for (i = 0; i < glo.a.length; i++) for (j = 0; j < glo.a[i].length; j++) if (glo.a[i][j] > 0) {
    for (k = 0; k < c.length; k++) if (c[k] === glo.a[i][j]) break;
    c[k] = glo.a[i][j];
  }
  if (c) return c[Math.floor(Math.random() * c.length)];
  return 0;
}

var makeNextBall = function () {
  var c = genColor();
  glo.cc = glo.nc;
  if(c) glo.nc = c;
  setBallColor($('#nb'), glo.nc);
  printCurrentBall(glo.cc);
};

var loadLevel = function (l) {
  disableInput();
  if (!l) l = ++glo.level; else glo.level = l;
  HTTPGet('./level/' + l + '.txt', function (r) {
    var s = r.responseText.split(/\r\n|\r|\n/);
    var i, j;
    for (j = 0; j < s.length; j++) if (s[j].length >= glo.mx)
     for (i = r = 0; r < s[j].length; r++, i++)
     if (glo.a[i][j] !== null) if (!isNaN(Number(s[j][r]))) setFixBall(i, j, Number(s[j][r]));
     else if (['w', 'W'].indexOf(s[j][r]) !== -1) { (function () {
       var c = Number(s[j][++r]);
       if (isNaN(c)) c = 0;
       setFixBall(i, j, -3 - c);
     }()); } else if (['f', 'F'].indexOf(s[j][r]) !== -1) { setFixBall(i, j, -1); }
     else if (['e', 'E'].indexOf(s[j][r]) !== -1) { setFixBall(i, j, -2); }
     else if (['r', 'R'].indexOf(s[j][r]) !== -1) {
       setFixBall(i, j, Math.floor(Math.random() * glo.mc) + 1);
     } else setFixBall(i, j, 0);
    setCeiling(0);
    glo.bcount = 0;
    makeNextBall(); makeNextBall();
    showLevel();
    redrawFix();
    enableInput();
  }, function () {
    alert('没了…… >_<');
  });
  initLevelTimer();
};

var initLevel = function () {
  var h = window.location.hash;
  var l = 1;
  h.replace(/level=\d+/, function (s) { l = Number(s.replace(/[^\d]/g, '')); });
  if (!l) l = 1;
  loadLevel(l);
};

var mina = function () {
  initFixBalls();
  drawArrow();
  addScore(0);
  initInput();
  initLevel();
};

window.onload = mina;
