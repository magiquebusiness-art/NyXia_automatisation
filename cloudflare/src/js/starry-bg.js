/**
 * starry-bg.js — Enhanced Canvas ciel étoilé avec nébuleuses et étoiles filantes
 * Version avancée avec support HiDPI, nébuleuses purple, et étoiles colorées
 * Aucune dépendance. Isolé.
 */
;(function () {
  'use strict'

  var canvas = document.getElementById('starry-canvas')
  if (!canvas) return

  var ctx = canvas.getContext('2d')
  var stars = []
  var shootingStars = []
  var nebulae = []
  var STAR_COUNT = 280
  var NEBULA_COUNT = 3
  var SHOOTING_INTERVAL = 4500
  var animId = 0
  var shootInterval = null

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2)
    var w = window.innerWidth
    var h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    createStars(w, h)
    createNebulae(w, h)
  }

  function createStars(w, h) {
    stars = []
    for (var i = 0; i < STAR_COUNT; i++) {
      var hueRoll = Math.random()
      var hue = 0
      if (hueRoll > 0.85) {
        hue = 240 + Math.random() * 30
      } else if (hueRoll > 0.75) {
        hue = 260 + Math.random() * 20
      }
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.4 + 0.2,
        baseOpacity: Math.random() * 0.7 + 0.15,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        phase: Math.random() * Math.PI * 2,
        hue: hue
      })
    }
  }

  function createNebulae(w, h) {
    nebulae = []
    for (var i = 0; i < NEBULA_COUNT; i++) {
      nebulae.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radiusX: Math.random() * 250 + 150,
        radiusY: Math.random() * 200 + 100,
        hue: 250 + Math.random() * 40,
        opacity: 0.02 + Math.random() * 0.025,
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2
      })
    }
  }

  function createShootingStar() {
    var w = window.innerWidth
    var h = window.innerHeight
    var x = Math.random() * w * 0.8
    shootingStars.push({
      x: x,
      y: Math.random() * h * 0.4,
      cx: x,
      cy: Math.random() * h * 0.4,
      length: Math.random() * 100 + 50,
      speed: Math.random() * 7 + 5,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
      opacity: 1,
      life: 1
    })
  }

  function drawNebulae(time) {
    for (var i = 0; i < nebulae.length; i++) {
      var n = nebulae[i]
      var breathe = Math.sin(time * 0.0003 + n.phase) * 0.3 + 0.7
      var nx = n.x + Math.sin(time * 0.0002 + n.phase) * 30
      var ny = n.y + Math.cos(time * 0.00015 + n.phase) * 20

      ctx.save()
      ctx.beginPath()
      ctx.ellipse(nx, ny, n.radiusX, n.radiusY, 0, 0, Math.PI * 2)
      var grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.radiusX)
      grad.addColorStop(0, 'hsla(' + Math.round(n.hue) + ',60%,40%,' + (n.opacity * breathe).toFixed(4) + ')')
      grad.addColorStop(0.5, 'hsla(' + Math.round(n.hue) + ',50%,30%,' + (n.opacity * breathe * 0.5).toFixed(4) + ')')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }
  }

  function drawStars(time) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i]
      var flicker = Math.sin(time * s.twinkleSpeed + s.phase) * 0.35 + 0.65
      var opacity = s.baseOpacity * flicker

      ctx.beginPath()
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)

      if (s.hue > 0) {
        ctx.fillStyle = 'hsla(' + Math.round(s.hue) + ',50%,85%,' + opacity.toFixed(3) + ')'
      } else {
        ctx.fillStyle = 'rgba(255,255,255,' + opacity.toFixed(3) + ')'
      }
      ctx.fill()

      if (s.radius > 1 && opacity > 0.5) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,' + (opacity * 0.08).toFixed(4) + ')'
        ctx.fill()
      }
    }
  }

  function drawShootingStars() {
    for (var i = shootingStars.length - 1; i >= 0; i--) {
      var s = shootingStars[i]
      var tailX = s.cx - Math.cos(s.angle) * s.length
      var tailY = s.cy - Math.sin(s.angle) * s.length

      var grad = ctx.createLinearGradient(tailX, tailY, s.cx, s.cy)
      grad.addColorStop(0, 'rgba(255,255,255,0)')
      grad.addColorStop(0.6, 'rgba(200,210,255,' + (s.opacity * s.life * 0.5).toFixed(3) + ')')
      grad.addColorStop(1, 'rgba(255,255,255,' + (s.opacity * s.life).toFixed(3) + ')')

      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(s.cx, s.cy)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.8
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(s.cx, s.cy, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,' + (s.opacity * s.life).toFixed(3) + ')'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(s.cx, s.cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(123,92,255,' + (s.opacity * s.life * 0.15).toFixed(4) + ')'
      ctx.fill()

      s.cx += Math.cos(s.angle) * s.speed
      s.cy += Math.sin(s.angle) * s.speed
      s.life -= 0.012

      if (s.life <= 0) shootingStars.splice(i, 1)
    }
  }

  function animate(time) {
    var w = window.innerWidth
    var h = window.innerHeight
    ctx.clearRect(0, 0, w, h)

    drawNebulae(time)
    drawStars(time)
    drawShootingStars()

    animId = requestAnimationFrame(animate)
  }

  resize()
  animId = requestAnimationFrame(animate)

  shootInterval = setInterval(createShootingStar, SHOOTING_INTERVAL)

  window.addEventListener('resize', function () {
    resize()
  })
})()
