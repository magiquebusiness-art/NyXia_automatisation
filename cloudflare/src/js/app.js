/* ═══════════════════════════════════════════════════════════════
   NyXia Automatisation — Vanilla JavaScript
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Scroll Reveal ───────────────────────────────────────── */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('nx-visible');
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.nx-fade-up').forEach((el) => observer.observe(el));

  /* ── FAQ Accordion ───────────────────────────────────────── */
  document.querySelectorAll('.nx-faq-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const faq = trigger.parentElement;
      const content = faq.querySelector('.nx-faq-content');
      const isOpen = trigger.getAttribute('data-state') === 'open';

      if (isOpen) {
        trigger.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.display = 'none';
        content.setAttribute('data-state', 'closed');
      } else {
        trigger.setAttribute('data-state', 'open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.display = 'block';
        content.setAttribute('data-state', 'open');
      }
    });
  });

  /* ── Nyxia Chat Widget ───────────────────────────────────── */
  const chatBtn = document.getElementById('nyxia-chat-btn');
  const chatPanel = document.getElementById('nyxia-chat-panel');
  const chatClose = document.getElementById('nyxia-chat-close');
  const chatInput = document.getElementById('nyxia-chat-input');
  const chatSend = document.getElementById('nyxia-chat-send');
  const chatMessages = document.getElementById('nyxia-chat-messages');

  if (chatBtn && chatPanel) {
    chatBtn.addEventListener('click', () => {
      chatPanel.style.display = chatPanel.style.display === 'flex' ? 'none' : 'flex';
    });

    if (chatClose) {
      chatClose.addEventListener('click', () => {
        chatPanel.style.display = 'none';
      });
    }

    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'nyxia-chat-msg nyxia-chat-msg-user';
      userMsg.textContent = text;
      chatMessages.appendChild(userMsg);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Show typing
      const typing = document.createElement('div');
      typing.className = 'nyxia-chat-typing';
      typing.innerHTML = '<div class="nyxia-chat-typing-dot"></div><div class="nyxia-chat-typing-dot"></div><div class="nyxia-chat-typing-dot"></div>';
      chatMessages.appendChild(typing);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulate bot response
      setTimeout(() => {
        chatMessages.removeChild(typing);
        const botMsg = document.createElement('div');
        botMsg.className = 'nyxia-chat-msg nyxia-chat-msg-bot';
        botMsg.textContent = "Bonjour ! Je suis NyXia, ta collaboratrice IA. Comment puis-je t'aider aujourd'hui ?";
        chatMessages.appendChild(botMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1500);
    };

    if (chatSend) chatSend.addEventListener('click', sendMessage);
    if (chatInput) chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  /* ── Mobile Menu Toggle ──────────────────────────────────── */
  const menuBtn = document.getElementById('nx-mobile-menu-btn');
  const mobileMenu = document.getElementById('nx-mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('nx-mobile-menu-open');
    });
  }

  /* ── Smooth Scroll ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
