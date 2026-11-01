/* =============================================
   BizBot AI — JavaScript Engine
   ============================================= */

// ============ STATE ============
const state = {
  currentScreen: 'chat',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  requirement: '',
  category: '',
  status: 'open',
  priority: 'medium',
  leads: JSON.parse(localStorage.getItem('bizbot_leads') || '[]'),
  tickets: JSON.parse(localStorage.getItem('bizbot_tickets') || '[]'),
  chatStep: 'greeting',
  awaitingField: null,
  selectedDate: null,
  sidebarOpen: false,
  inactivityTimer: null,
  lastOutputJSON: null,
  soundEnabled: localStorage.getItem('bizbot_sound') !== 'false',
  leadSearchQuery: '',
  leadCategoryFilter: 'all',
  uploadedFile: null
};

// ============ AI CONVERSATION ENGINE ============

const QUICK_ACTIONS = [
  { label: '🛍️ Products & Pricing', value: 'products and pricing' },
  { label: '📅 Book a Meeting', value: 'book a meeting' },
  { label: '🎧 Customer Support', value: 'customer support' },
  { label: '💼 About Us', value: 'about us' }
];

const GREETINGS = [
  "Hello! 👋 Welcome to **BizBot AI**! I'm your intelligent business assistant. How can I help you today?",
];

// Intent detection keywords
const INTENTS = {
  greeting: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy'],
  pricing: ['price', 'pricing', 'cost', 'rates', 'plans', 'packages', 'subscription', 'fee', 'charge', 'how much', 'budget', 'affordable'],
  booking: ['book', 'meeting', 'appointment', 'schedule', 'demo', 'consultation', 'call', 'session', 'reserve'],
  support: ['support', 'help', 'issue', 'problem', 'bug', 'error', 'complaint', 'not working', 'broken', 'trouble', 'ticket'],
  feedback: ['feedback', 'suggestion', 'complain', 'review', 'rating', 'bad experience', 'unhappy', 'dissatisfied', 'disappointed', 'not satisfied', 'improve'],
  products: ['product', 'service', 'feature', 'solution', 'what do you', 'what can you', 'capabilities'],
  offers: ['offer', 'discount', 'deal', 'promo', 'coupon', 'sale', 'save', 'reduction', 'special pricing'],
  availability: ['available', 'availability', 'open slot', 'free time', 'when are you free', 'timing', 'schedule time', 'operating hours'],
  about: ['about', 'company', 'who are you', 'team', 'contact', 'location', 'hours', 'business hours'],
  human: ['human', 'agent', 'person', 'representative', 'talk to someone', 'live agent', 'real person', 'escalate'],
  thanks: ['thank', 'thanks', 'appreciate', 'great', 'perfect', 'awesome', 'excellent', 'wonderful'],
  name: ['my name is', "i'm", "i am", "call me"],
  bye: ['bye', 'goodbye', 'see you', 'take care', 'ciao', 'quit', 'exit']
};

function detectIntent(text) {
  const lower = text.toLowerCase().trim();
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some(k => lower.includes(k))) return intent;
  }
  return 'general';
}

// ============ BOT RESPONSES ============

function getBotReply(userMsg) {
  const intent = detectIntent(userMsg);
  const name = state.customerName ? `, ${state.customerName}` : '';

  // Handle awaiting field collection
  if (state.awaitingField) {
    return handleFieldCollection(userMsg);
  }

  switch (intent) {
    case 'greeting':
      return {
        text: `Hello${name}! 👋 Great to see you! I'm BizBot AI, your dedicated business assistant. I can help you with:\n\n• 🛍️ Products & Pricing\n• 📅 Meeting Bookings\n• 🎧 Customer Support\n• 💼 Company Information\n\nWhat can I help you with today?`,
        showQuickActions: true
      };

    case 'pricing':
      return {
        text: `Excellent choice${name}! Here's our pricing overview. We offer flexible plans to suit every business size:`,
        card: 'pricing',
        followUp: 'Would you like me to book a **free demo** to walk you through the features? Just say *"book a meeting"*! 📅'
      };

    case 'booking':
      state.status = 'booking';
      return {
        text: `Absolutely${name}! I'd love to schedule a meeting for you. 📅\n\nLet me collect a few details. First, could you share your **full name**?`,
        awaitField: 'booking_name'
      };

    case 'support':
      return {
        text: `I'm sorry to hear you're facing an issue${name}. 😔 I'll make sure this gets resolved quickly!\n\nYou can:\n• 📋 **Create a support ticket** — detailed help from our team\n• 👤 **Talk to a human agent** — for urgent issues\n• 🔍 **Describe your issue** — I'll try to help right away\n\nWhich would you prefer?`,
        action: { label: '📋 Create Support Ticket', screen: 'support' }
      };

    case 'products':
      return {
        text: `We offer a comprehensive suite of business solutions${name}! 🚀\n\n**Our Core Services:**\n• 💬 **AI Business Automation** — Automate customer interactions 24/7\n• 📊 **CRM Integration** — Seamlessly manage leads & customers\n• 📱 **WhatsApp Business API** — Reach customers on their favorite platform\n• 🤖 **Custom AI Chatbots** — Tailored to your brand & workflows\n• 📈 **Analytics Dashboard** — Real-time business insights\n\nInterested in a specific service? Ask me for pricing or book a demo!`,
        showQuickActions: true
      };

    case 'offers':
      return {
        text: `We have some exciting **special offers** running right now${name}! 🎁\n\n• **Launch Promo:** Get **20% off** on your first 3 months of our *Professional* or *Enterprise* plans using code **BIZBOT20**.\n• **Annual Discount:** Save **15%** instantly when you choose annual billing.\n• **Free Audit:** Book a consultation this week to receive a *complimentary AI Integration audit* for your website (valued at ₹15,000).\n\nWould you like me to book a demo or review our pricing?`
      };

    case 'availability':
      return {
        text: `Our team is available for slots **Monday to Saturday, 9:00 AM – 7:00 PM IST** (except public holidays). ⏰\n\nYou can schedule a session instantly via our **Book Meeting** tab in the sidebar, or I can help you record your meeting details right here in the chat.\n\nWhich option would you prefer?`
      };

    case 'about':
      return {
        text: `About us 🏢\n\n**BizBot AI** is a leading AI-powered business automation platform helping businesses grow smarter.\n\n📍 **Location:** Mumbai, India\n⏰ **Business Hours:** Mon–Sat, 9:00 AM – 7:00 PM IST\n📧 **Email:** hello@bizbot.ai\n📞 **Phone:** +91 98765 43210\n🌐 **Website:** www.bizbot.ai\n\nOur team of 50+ AI specialists is dedicated to transforming how businesses connect with customers. 💪`
      };

    case 'feedback':
      state.status = 'feedback';
      state.priority = 'high';
      return {
        text: `Thank you for taking the time to share your feedback${name}. 🙏 Your opinion truly matters to us!\n\nCould you please describe your experience or suggestion in a bit more detail? I'll make sure it's recorded and shared with our team for improvement.`,
        awaitField: 'feedback_details'
      };

    case 'human':
      saveLead({ requirement: 'Human agent requested', category: 'Escalation' });
      return {
        text: `Understood! Connecting you with a human representative. 👤\n\n**Our team will contact you shortly for further assistance.**\n\nExpected response time: **Within 30 minutes** during business hours.\n\n📞 For immediate help, call: **+91 98765 43210**`
      };

    case 'thanks':
      return {
        text: `You're very welcome${name}! 😊 It was my pleasure to assist you.\n\n**Is there anything else I can help you with today?** I'm always here! 🤖✨`
      };

    case 'bye':
      return {
        text: `Goodbye${name}! 👋 It was wonderful chatting with you. Have a fantastic day!\n\n*If you ever need help, BizBot AI is available 24/7.* Come back anytime! 🌟`
      };

    default:
      if (userMsg.toLowerCase().includes('my name is') || userMsg.toLowerCase().startsWith("i'm ") || userMsg.toLowerCase().startsWith("i am ")) {
        const nameMatch = userMsg.match(/(?:my name is|i'm|i am)\s+([a-zA-Z\s]+)/i);
        if (nameMatch) {
          state.customerName = nameMatch[1].trim();
          return { text: `Wonderful! Nice to meet you, **${state.customerName}**! 😊 How can I assist you today?`, showQuickActions: true };
        }
      }
      return {
        text: `Thank you for your message${name}! 🤖\n\nI'd be happy to help. Here's what I can assist you with:\n• **Pricing** — Our plans & packages\n• **Booking** — Schedule a meeting or demo\n• **Support** — Technical or billing help\n• **Products** — Learn about our services\n\nOr feel free to ask me anything specific!`,
        showQuickActions: true
      };
  }
}

// ============ FIELD COLLECTION (BOOKING / FEEDBACK FLOWS VIA CHAT) ============

function handleFieldCollection(userMsg) {
  const field = state.awaitingField;

  if (field === 'booking_name') {
    state.customerName = userMsg.trim();
    state.awaitingField = 'booking_phone';
    return { text: `Great, **${state.customerName}**! 👍\n\nCould you please share your **phone number**?` };
  }

  if (field === 'booking_phone') {
    state.customerPhone = userMsg.trim();
    state.awaitingField = 'booking_email';
    return { text: `Perfect! Now, what's your **email address**?` };
  }

  if (field === 'booking_email') {
    state.customerEmail = userMsg.trim();
    state.awaitingField = 'booking_requirement';
    return { text: `Excellent! What **service** are you interested in or what would you like to discuss in the meeting?` };
  }

  if (field === 'booking_requirement') {
    state.requirement = userMsg.trim();
    state.awaitingField = null;
    state.status = 'booking_confirmed';

    const ticketNum = 'BK-' + Date.now().toString().slice(-5);
    saveLead({ requirement: state.requirement, category: 'Booking', status: 'New' });

    const waMsg = `Hello BizBot AI! I booked a consultation:\n- Ref: ${ticketNum}\n- Name: ${state.customerName}\n- Service: ${state.requirement}\n- Email: ${state.customerEmail}\n- Phone: ${state.customerPhone}`;
    return {
      text: `✅ **Booking Request Received!**\n\n📋 **Reference:** ${ticketNum}\n👤 **Name:** ${state.customerName}\n📧 **Email:** ${state.customerEmail}\n📞 **Phone:** ${state.customerPhone}\n💼 **Service:** ${state.requirement}\n\nOur team will confirm your meeting within **24 hours** and send the calendar invite to your email. \n\n**Is there anything else I can help you with?** 😊`,
      whatsappAction: { phone: state.customerPhone, text: waMsg }
    };
  }

  if (field === 'feedback_details') {
    const feedbackText = userMsg.trim();
    state.requirement = feedbackText;
    state.awaitingField = null;
    const feedbackId = 'FB-' + Date.now().toString().slice(-5);
    saveLead({ requirement: feedbackText, category: 'Feedback', status: 'Recorded', priority: 'High' });
    return {
      text: `✅ **Feedback Recorded — Thank You!**\n\n📋 **Ref:** ${feedbackId}\n💬 Your feedback has been shared with our team.\n\nWe take every suggestion seriously and will work to improve. 🙏\n\n**Is there anything else I can help you with today?**`
    };
  }

  state.awaitingField = null;
  return getBotReply(userMsg);
}

// ============ CHAT UI ============

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function addBotMessage(content, opts = {}) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const wa = opts.whatsappAction || content.whatsappAction;
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg-bot';
  msgDiv.innerHTML = `
    <div class="msg-bot-avatar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="#6366f1"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
        <circle cx="8.5" cy="7.5" r="0.8" fill="#fff"/>
        <circle cx="15.5" cy="7.5" r="0.8" fill="#fff"/>
      </svg>
    </div>
    <div class="msg-bot-content">
      <div class="bubble-bot">${renderMarkdown(content.text || content)}</div>
      ${opts.card === 'pricing' ? renderPricingCard() : ''}
      ${opts.followUp ? `<div class="bubble-bot" style="margin-top:8px">${renderMarkdown(opts.followUp)}</div>` : ''}
      ${opts.action ? `<button class="quick-chip" style="margin-top:8px;" onclick="switchScreen('${opts.action.screen}')">${opts.action.label}</button>` : ''}
      ${wa ? `<button class="quick-chip wa-quick-chip" style="margin-top:8px;" onclick="openInWhatsApp('${escapeHtml(wa.phone || '')}', '${escapeHtml(wa.text || '')}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>Send via WhatsApp</button>` : ''}
      <span class="msg-time">${getTime()}</span>
    </div>
  `;
  container.appendChild(msgDiv);
  if (opts.showQuickActions) addQuickActions();
  container.scrollTop = container.scrollHeight;

  // Set awaiting field if specified
  if (content.awaitField) state.awaitingField = content.awaitField;
  
  playSound('receive');
  saveChatHistory();
}

function addUserMessage(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg-user';
  msgDiv.innerHTML = `
    <div class="bubble-user">${escapeHtml(text)}</div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  playSound('send');
  saveChatHistory();
}

function addTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const typing = document.createElement('div');
  typing.className = 'msg-bot';
  typing.id = 'typing-indicator';
  typing.innerHTML = `
    <div class="msg-bot-avatar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="#6366f1"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="bubble-bot typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function addQuickActions() {
  const container = document.getElementById('chat-messages');
  const qDiv = document.createElement('div');
  qDiv.className = 'quick-actions';
  qDiv.id = 'quick-actions-bar';
  QUICK_ACTIONS.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'quick-chip';
    btn.textContent = action.label;
    btn.onclick = () => {
      const old = document.getElementById('quick-actions-bar');
      if (old) old.remove();
      handleUserInput(action.value);
    };
    qDiv.appendChild(btn);
  });
  container.appendChild(qDiv);
  container.scrollTop = container.scrollHeight;
}

function renderPricingCard() {
  return `
    <div class="pricing-card" style="margin-top:10px">
      <div class="pricing-card-header">💰 Pricing Plans</div>
      <div class="pricing-tier">
        <span class="tier-name">🚀 Starter</span>
        <span>
          <span class="tier-price">₹4,999/mo</span>
        </span>
      </div>
      <div class="pricing-tier">
        <span class="tier-name">⭐ Professional</span>
        <span>
          <span class="tier-price">₹12,999/mo</span>
          <span class="tier-tag tag-pop">Popular</span>
        </span>
      </div>
      <div class="pricing-tier">
        <span class="tier-name">🏢 Enterprise</span>
        <span>
          <span class="tier-price">Custom</span>
          <span class="tier-tag tag-ent">Tailored</span>
        </span>
      </div>
    </div>
  `;
}

// ============ INACTIVITY FOLLOW-UP FLOW ============

const INACTIVITY_MS = 60000; // 60 seconds

function resetInactivityTimer() {
  if (state.inactivityTimer) clearTimeout(state.inactivityTimer);
  state.inactivityTimer = setTimeout(() => {
    // Only fire if on chat screen and chat has started
    if (state.currentScreen !== 'chat') return;
    const msgs = document.querySelectorAll('#chat-messages .msg-bot, #chat-messages .msg-user');
    if (msgs.length < 2) return; // Don't fire on greeting alone
    addBotMessage({
      text: `Hi 👋 Just checking in. Let us know if you need any assistance. We're happy to help!`,
      showQuickActions: true
    });
  }, INACTIVITY_MS);
}

// ============ SEND MESSAGE ============

function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;

  // Remove old quick actions
  const oldQA = document.getElementById('quick-actions-bar');
  if (oldQA) oldQA.remove();

  input.value = '';
  input.focus();
  addUserMessage(text);
  resetInactivityTimer(); // Reset on every user message
  handleUserInput(text);
}

function handleUserInput(text) {
  addTypingIndicator();

  const delay = 700 + Math.random() * 600;
  setTimeout(() => {
    removeTypingIndicator();
    const reply = getBotReply(text);

    if (typeof reply === 'string') {
      addBotMessage({ text: reply });
    } else {
      addBotMessage(reply, {
        card: reply.card,
        followUp: reply.followUp,
        action: reply.action,
        showQuickActions: reply.showQuickActions
      });
    }

    // Trigger booking screen if booking flow confirmed
    if (state.status === 'booking' && !state.awaitingField) {
      // Handled by field collection
    }

    // Generate output JSON
    updateOutputJSON(text, reply);
  }, delay);
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ============ OUTPUT JSON ============

function updateOutputJSON(userMsg, reply) {
  const output = {
    customer_name: state.customerName || '',
    phone: state.customerPhone || '',
    email: state.customerEmail || '',
    requirement: state.requirement || userMsg,
    category: getCategoryFromMsg(userMsg),
    status: state.status || 'active',
    priority: state.priority || 'medium',
    reply: typeof reply === 'string' ? reply : (reply.text || '')
  };
  state.lastOutputJSON = output;
  console.log('📊 BizBot Output:', JSON.stringify(output, null, 2));
  renderOutputPanel(output);
  return output;
}

function renderOutputPanel(output) {
  let panel = document.getElementById('output-panel');
  if (!panel) return;
  const hasData = output.customer_name || output.phone || output.email || output.requirement;
  if (!hasData) return;

  // Show notification badge if the panel is currently hidden
  if (panel.classList.contains('hidden')) {
    const badge = document.getElementById('json-dot');
    if (badge) badge.classList.remove('hidden');
  }

  document.getElementById('out-name').textContent   = output.customer_name || '—';
  document.getElementById('out-phone').textContent  = output.phone        || '—';
  document.getElementById('out-email').textContent  = output.email        || '—';
  document.getElementById('out-req').textContent    = output.requirement  || '—';
  document.getElementById('out-cat').textContent    = output.category     || '—';
  document.getElementById('out-status').textContent = output.status       || '—';
  document.getElementById('out-pri').textContent    = output.priority     || '—';
}

function toggleOutputPanel() {
  const panel = document.getElementById('output-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');
  
  // Hide notification badge when user opens/toggles the panel
  const badge = document.getElementById('json-dot');
  if (badge) badge.classList.add('hidden');
}

function getCategoryFromMsg(msg) {
  const intent = detectIntent(msg);
  const map = {
    pricing:      'Sales Inquiry',
    booking:      'Booking',
    support:      'Customer Support',
    feedback:     'Feedback',
    products:     'Product Inquiry',
    about:        'Company Info',
    human:        'Escalation',
    greeting:     'Greeting',
    thanks:       'Appreciation',
    bye:          'Session End',
    offers:       'Sales Inquiry',
    availability: 'Booking Info'
  };
  return map[intent] || 'General';
}

// ============ CLEAR CHAT ============

function clearChat() {
  localStorage.removeItem('bizbot_chat_html');
  localStorage.removeItem('bizbot_chat_state');
  const container = document.getElementById('chat-messages');
  if (container) container.innerHTML = '';
  state.customerName = '';
  state.customerPhone = '';
  state.customerEmail = '';
  state.requirement = '';
  state.awaitingField = null;
  state.chatStep = 'greeting';
  state.status = 'open';
  initChat();
  showToast('✨ Chat refreshed');
}

// ============ SCREEN NAVIGATION ============

function switchScreen(screenName) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const screen = document.getElementById(`screen-${screenName}`);
  if (screen) screen.classList.add('active');

  const navItem = document.querySelector(`[data-screen="${screenName}"]`);
  if (navItem) navItem.classList.add('active');

  state.currentScreen = screenName;

  if (screenName === 'leads') renderLeadsTable();

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.add('hidden');
    state.sidebarOpen = false;
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  state.sidebarOpen = !state.sidebarOpen;
  sidebar.classList.toggle('open', state.sidebarOpen);
  overlay.classList.toggle('hidden', !state.sidebarOpen);
}

// ============ BOOKING SUBMISSION ============

function submitBooking() {
  const name = document.getElementById('book-name').value.trim();
  const phone = document.getElementById('book-phone').value.trim();
  const email = document.getElementById('book-email').value.trim();
  const service = document.getElementById('book-service').value;

  if (!name || !phone || !email || !service) {
    showToast('⚠️ Please fill in all required fields.');
    return;
  }

  state.customerName = name;
  state.customerPhone = phone;
  state.customerEmail = email;
  state.requirement = service;

  const selectedTime = document.querySelector('#time-chips .chip.active')?.textContent || '';
  const selectedDate = document.querySelector('.date-day.selected .date-num')?.textContent || '';
  const budget = document.getElementById('book-budget').value;
  const notes = document.getElementById('book-requirement').value;

  const lead = {
    id: 'BK-' + Date.now().toString().slice(-5),
    name, phone, email,
    requirement: service,
    category: 'Booking',
    date: new Date().toLocaleDateString('en-IN'),
    status: 'New',
    priority: 'Medium',
    notes: `Date: ${selectedDate}, Time: ${selectedTime}, Budget: ${budget}, Notes: ${notes}`
  };

  saveLead(lead);
  showToast(`✅ Meeting booked! Ref: ${lead.id}`);

  const waBookingMsg = `Hello BizBot AI Team! 📅\nI have scheduled a meeting consultation:\n- Ref: ${lead.id}\n- Name: ${name}\n- Service: ${service}\n- Date: ${selectedDate} at ${selectedTime}\n- Phone: ${phone}\n- Email: ${email}\n- Budget: ${budget || 'Not specified'}`;

  // Inject confirmation into chat
  switchScreen('chat');
  setTimeout(() => {
    addBotMessage({
      text: `🎉 **Booking Confirmed!**\n\n📋 **Ref:** ${lead.id}\n👤 **${name}**\n📞 ${phone}\n📧 ${email}\n💼 **Service:** ${service}\n📅 Preferred: ${selectedDate} at ${selectedTime}\n\nWe'll send a **calendar invite** to your email shortly. Is there anything else I can help with?`,
      whatsappAction: { phone, text: waBookingMsg }
    });
  }, 300);

  // Reset form
  document.getElementById('book-name').value = '';
  document.getElementById('book-phone').value = '';
  document.getElementById('book-email').value = '';
  document.getElementById('book-service').value = '';
  document.getElementById('book-budget').value = '';
  document.getElementById('book-requirement').value = '';
}

// ============ SUPPORT TICKET ============

function selectCategory(category) {
  document.querySelectorAll('.category-card').forEach(c => c.style.borderTopColor = '');
  document.getElementById('sup-title').value = category + ' — ';
  document.getElementById('sup-title').focus();
  showToast(`📁 Category: ${category}`);
}

function submitTicket() {
  const name = document.getElementById('sup-name').value.trim();
  const email = document.getElementById('sup-email').value.trim();
  const title = document.getElementById('sup-title').value.trim();
  const desc = document.getElementById('sup-desc').value.trim();

  if (!name || !email || !title || !desc) {
    showToast('⚠️ Please fill in all required fields.');
    return;
  }

  const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 8999);
  const priority = document.querySelector('.priority-chips .chip.active')?.textContent?.replace(/[^\w\s]/g, '').trim() || 'Medium';

  const ticket = {
    id: ticketId, name, email,
    title, desc, priority,
    attachment: state.uploadedFile ? state.uploadedFile.name : null,
    date: new Date().toLocaleDateString('en-IN'),
    status: 'Open'
  };

  state.tickets.push(ticket);
  localStorage.setItem('bizbot_tickets', JSON.stringify(state.tickets));

  // Also record as a support lead
  saveLead({
    id: ticketId,
    name,
    email,
    requirement: `${title}: ${desc}`,
    category: 'Customer Support',
    status: 'Open',
    priority
  });

  // Show confirmation
  const confirmEl = document.getElementById('ticket-confirm');
  document.getElementById('ticket-id-display').textContent = `Ticket #${ticketId} Created`;
  confirmEl.classList.remove('hidden');
  confirmEl.scrollIntoView({ behavior: 'smooth' });

  showToast(`✅ Ticket #${ticketId} submitted!`);

  const waTicketMsg = `Hello BizBot Support! 🛠️\nI opened a support ticket:\n- Ticket: #${ticketId}\n- Name: ${name}\n- Issue: ${title}\n- Priority: ${priority}\n- Details: ${desc}`;

  // Inject into chat after delay
  setTimeout(() => {
    switchScreen('chat');
    addBotMessage({
      text: `✅ **Support Ticket Created!**\n\n📋 **Ticket:** #${ticketId}\n👤 **${name}**\n📧 ${email}\n🔖 **Issue:** ${title}\n⚡ **Priority:** ${priority}${state.uploadedFile ? `\n📎 **Attachment:** ${state.uploadedFile.name}` : ''}\n\nOur support team will contact you within **2 business hours**. Thank you for your patience! 🙏`,
      whatsappAction: { phone: state.customerPhone || '919876543210', text: waTicketMsg }
    });
    removeUploadedFile();
  }, 1200);

  // Reset
  document.getElementById('sup-name').value = '';
  document.getElementById('sup-email').value = '';
  document.getElementById('sup-title').value = '';
  document.getElementById('sup-desc').value = '';
}

// ============ LEADS TABLE ============

function saveLead(extraData = {}) {
  const lead = {
    id: 'LD-' + Date.now().toString().slice(-5),
    name: state.customerName || extraData.name || 'Unknown',
    phone: state.customerPhone || extraData.phone || '—',
    email: state.customerEmail || extraData.email || '—',
    requirement: state.requirement || extraData.requirement || '—',
    category: extraData.category || getCategoryFromMsg(state.requirement || ''),
    status: extraData.status || 'New',
    priority: state.priority || 'Medium',
    date: new Date().toLocaleDateString('en-IN'),
    timestamp: Date.now()
  };
  state.leads.push(lead);
  localStorage.setItem('bizbot_leads', JSON.stringify(state.leads));
}

function renderLeadsTable() {
  const container = document.getElementById('leads-table-container');
  if (!container) return;

  let filtered = [...state.leads];

  // Category filter
  if (state.leadCategoryFilter && state.leadCategoryFilter !== 'all') {
    filtered = filtered.filter(l => 
      (l.category || '').toLowerCase().includes(state.leadCategoryFilter.toLowerCase())
    );
  }

  // Search filter
  if (state.leadSearchQuery) {
    const q = state.leadSearchQuery.toLowerCase();
    filtered = filtered.filter(l => 
      (l.name || '').toLowerCase().includes(q) ||
      (l.phone || '').toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q) ||
      (l.requirement || '').toLowerCase().includes(q) ||
      (l.id || '').toLowerCase().includes(q)
    );
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div class="leads-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p>${state.leads.length ? 'No matching leads found.' : 'No leads collected yet.'}</p>
        <p style="font-size:12px;color:var(--text-dim)">${state.leads.length ? 'Try adjusting your search query or category filters.' : 'Interact with BizBot AI or schedule meetings to collect customer leads.'}</p>
      </div>
    `;
    return;
  }

  const rows = filtered.map(lead => {
    const waText = `Hi ${lead.name}, thank you for contacting BizBot AI! Re: ${lead.category} inquiry (Ref: ${lead.id}). How can we assist you today?`;
    const cleanPhone = (lead.phone || '').replace(/[^\d+]/g, '');
    const phoneDisplay = cleanPhone ? `<a href="javascript:void(0)" class="table-phone-link" onclick="openInWhatsApp('${escapeHtml(cleanPhone)}', '${escapeHtml(waText)}')">${escapeHtml(lead.phone)}</a>` : escapeHtml(lead.phone);

    return `
      <tr>
        <td><code class="lead-id-code">${lead.id}</code></td>
        <td><strong>${escapeHtml(lead.name)}</strong></td>
        <td>${phoneDisplay}</td>
        <td><a href="mailto:${escapeHtml(lead.email)}" class="table-email-link">${escapeHtml(lead.email)}</a></td>
        <td class="lead-req-cell" title="${escapeHtml(lead.requirement)}">${escapeHtml(lead.requirement)}</td>
        <td><span class="lead-cat-tag">${escapeHtml(lead.category)}</span></td>
        <td>
          <select class="status-select status-${(lead.status || 'new').toLowerCase().replace(/\s+/g, '-')}" onchange="updateLeadStatus('${lead.id}', this.value)">
            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Qualified" ${lead.status === 'Qualified' ? 'selected' : ''}>Qualified</option>
            <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
        <td style="color:var(--text-dim);font-size:12px">${lead.date}</td>
        <td>
          <div class="table-action-btns">
            <button class="btn-table-action wa-action" title="Open WhatsApp Chat" onclick="openInWhatsApp('${escapeHtml(lead.phone)}', '${escapeHtml(waText)}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </button>
            <button class="btn-table-action del-action" title="Delete Lead" onclick="deleteLead('${lead.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="leads-table-wrap">
      <table class="leads-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Phone</th><th>Email</th>
            <th>Requirement</th><th>Category</th><th>Status</th><th>Date</th><th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function handleLeadSearch(val) {
  state.leadSearchQuery = val.trim();
  renderLeadsTable();
}

function filterLeadsByCategory(cat, btnEl) {
  state.leadCategoryFilter = cat;
  document.querySelectorAll('.lead-filter-chip').forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderLeadsTable();
}

function updateLeadStatus(id, newStatus) {
  const target = state.leads.find(l => l.id === id);
  if (target) {
    target.status = newStatus;
    localStorage.setItem('bizbot_leads', JSON.stringify(state.leads));
    showToast(`Lead ${id} updated to ${newStatus}`);
  }
}

function deleteLead(id) {
  state.leads = state.leads.filter(l => l.id !== id);
  localStorage.setItem('bizbot_leads', JSON.stringify(state.leads));
  showToast(`🗑️ Lead ${id} deleted.`);
  renderLeadsTable();
}

function clearAllLeads() {
  if (!state.leads.length) {
    showToast('⚠️ No leads to clear.');
    return;
  }
  if (confirm('Are you sure you want to clear all collected leads?')) {
    state.leads = [];
    localStorage.setItem('bizbot_leads', JSON.stringify([]));
    showToast('🗑️ All leads cleared.');
    renderLeadsTable();
  }
}

function exportLeads() {
  if (!state.leads.length) { showToast('⚠️ No leads to export.'); return; }
  const headers = ['ID', 'Name', 'Phone', 'Email', 'Requirement', 'Category', 'Status', 'Date'];
  const rows = state.leads.map(l => [l.id, l.name, l.phone, l.email, l.requirement, l.category, l.status, l.date]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'bizbot_leads.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Leads exported successfully!');
}

function escalateToHuman() {
  showToast('👤 Connecting you to a human agent...');
  switchScreen('chat');
  setTimeout(() => {
    addBotMessage({
      text: 'Our team will contact you shortly for further assistance. 📞\n\nExpected response: **Within 30 minutes** during business hours.\nFor urgent help: **+91 98765 43210**',
      whatsappAction: { phone: '919876543210', text: 'Hello! I need assistance from a human support representative.' }
    });
  }, 300);
}

// ============ WHATSAPP INTEGRATION ENGINE ============

function openInWhatsApp(phone, message = '') {
  let cleanPhone = String(phone || '').replace(/[^\d]/g, '');
  if (!cleanPhone || cleanPhone.length < 7) {
    cleanPhone = '919876543210'; // Default business support WhatsApp
  }
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || 'Hello BizBot AI team!')}`;
  window.open(url, '_blank');
}

function testDirectWhatsApp() {
  const name = state.customerName || 'Customer';
  const req = state.requirement || 'General Business Automation Inquiry';
  const msg = `Hello BizBot AI Team! 👋\n\nI am contacting you from the BizBot AI web portal.\n👤 Name: ${name}\n💼 Requirement: ${req}\n\nPlease share further details.`;
  openInWhatsApp('919876543210', msg);
  closeWhatsAppModal();
}

function openWhatsAppModal() {
  const modal = document.getElementById('wa-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeWhatsAppModal(e) {
  if (e && e.target !== e.currentTarget) return;
  const modal = document.getElementById('wa-modal');
  if (modal) modal.classList.add('hidden');
}

// ============ SOUND SYNTHESIZER ============
let audioCtx = null;

function playSound(type) {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'receive') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.07); // A5
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch (e) {
    // AudioContext blocked
  }
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  localStorage.setItem('bizbot_sound', state.soundEnabled);
  const iconOn = document.getElementById('sound-icon-on');
  const iconOff = document.getElementById('sound-icon-off');
  if (state.soundEnabled) {
    iconOn?.classList.remove('hidden');
    iconOff?.classList.add('hidden');
    showToast('🔔 Sound effects enabled');
    playSound('receive');
  } else {
    iconOn?.classList.add('hidden');
    iconOff?.classList.remove('hidden');
    showToast('🔕 Sound effects muted');
  }
}

// ============ FILE UPLOAD HANDLER ============

function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  state.uploadedFile = file;
  const preview = document.getElementById('sup-file-preview');
  const nameEl = document.getElementById('sup-file-name');
  const label = document.getElementById('sup-file-label');
  if (preview && nameEl) {
    nameEl.textContent = `📎 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    preview.classList.remove('hidden');
    if (label) label.textContent = 'Change Screenshot';
  }
  showToast(`📎 Attached: ${file.name}`);
}

function removeUploadedFile() {
  state.uploadedFile = null;
  const fileInput = document.getElementById('sup-file-input');
  if (fileInput) fileInput.value = '';
  const preview = document.getElementById('sup-file-preview');
  const label = document.getElementById('sup-file-label');
  if (preview) preview.classList.add('hidden');
  if (label) label.textContent = 'Add Screenshot (Optional)';
}

// ============ CHAT PERSISTENCE ============

function saveChatHistory() {
  const container = document.getElementById('chat-messages');
  if (container) {
    localStorage.setItem('bizbot_chat_html', container.innerHTML);
    localStorage.setItem('bizbot_chat_state', JSON.stringify({
      customerName: state.customerName,
      customerPhone: state.customerPhone,
      customerEmail: state.customerEmail,
      requirement: state.requirement,
      status: state.status,
      awaitingField: state.awaitingField
    }));
  }
}

function loadChatHistory() {
  const savedHtml = localStorage.getItem('bizbot_chat_html');
  const savedState = localStorage.getItem('bizbot_chat_state');
  if (savedHtml && savedHtml.trim().length > 0) {
    const container = document.getElementById('chat-messages');
    if (container) {
      container.innerHTML = savedHtml;
      container.scrollTop = container.scrollHeight;
    }
    if (savedState) {
      try {
        const s = JSON.parse(savedState);
        Object.assign(state, s);
      } catch (e) {}
    }
    return true;
  }
  return false;
}

// ============ CHIP SELECTION ============

function selectChip(el, group) {
  const parent = el.closest('.chip-group');
  parent.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

// ============ DATE STRIP ============

function buildDateStrip() {
  const strip = document.getElementById('date-strip');
  if (!strip) return;
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date();
  strip.innerHTML = '';
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const div = document.createElement('div');
    div.className = 'date-day' + (i === 2 ? ' selected' : '');
    div.innerHTML = `<span class="date-name">${days[d.getDay()]}</span><span class="date-num">${d.getDate()}</span>`;
    div.onclick = () => {
      document.querySelectorAll('.date-day').forEach(x => x.classList.remove('selected'));
      div.classList.add('selected');
      state.selectedDate = d.toDateString();
    };
    strip.appendChild(div);
  }
}

// ============ TOAST ============

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), duration);
}

// ============ UTILITIES ============

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============ INIT ============

function initChat() {
  if (!loadChatHistory()) {
    setTimeout(() => {
      addBotMessage(
        { text: GREETINGS[0], showQuickActions: true }
      );
      resetInactivityTimer();
    }, 400);
  } else {
    resetInactivityTimer();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initChat();
  buildDateStrip();
  renderLeadsTable();

  // Initialize sound icon state
  if (!state.soundEnabled) {
    document.getElementById('sound-icon-on')?.classList.add('hidden');
    document.getElementById('sound-icon-off')?.classList.remove('hidden');
  }
});

// ============ VOICE SPEECH-TO-TEXT ============
let recognition = null;

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("⚠️ Speech recognition is not supported in this browser.");
    return;
  }

  const voiceBtn = document.getElementById('voice-btn');
  const inputEl = document.getElementById('user-input');

  if (recognition) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onstart = () => {
    voiceBtn.classList.add('recording');
    showToast("🎙️ Listening... Speak now.");
  };

  recognition.onerror = (e) => {
    console.error("Speech Recognition Error:", e);
    showToast("⚠️ Could not hear you. Please try again.");
    stopSpeech();
  };

  recognition.onend = () => {
    stopSpeech();
  };

  recognition.onresult = (event) => {
    const resultText = event.results[0][0].transcript;
    if (resultText) {
      inputEl.value = resultText;
      inputEl.focus();
    }
  };

  recognition.start();

  function stopSpeech() {
    if (voiceBtn) voiceBtn.classList.remove('recording');
    recognition = null;
  }
}

