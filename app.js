(function () {
  "use strict";

  var STORAGE_REVIEWED = "rf_reviewed";
  var STORAGE_CHAT = "rf_chat";

  var reviewed = loadJSON(STORAGE_REVIEWED, {});
  var chats = loadJSON(STORAGE_CHAT, {});
  var activeStreamId = STREAMS[0].id;

  var streamNav = document.getElementById("streamNav");
  var streamHeader = document.getElementById("streamHeader");
  var resourceList = document.getElementById("resourceList");
  var overallFill = document.getElementById("overallFill");
  var overallCount = document.getElementById("overallCount");
  var backdrop = document.getElementById("backdrop");
  var sidePane = document.getElementById("sidePane");
  var paneBody = document.getElementById("paneBody");
  var paneClose = document.getElementById("paneClose");

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function findStream(id) {
    for (var i = 0; i < STREAMS.length; i++) if (STREAMS[i].id === id) return STREAMS[i];
    return STREAMS[0];
  }

  function streamCounts(stream) {
    var total = stream.resources.length, done = 0;
    stream.resources.forEach(function (r) { if (reviewed[r.id]) done++; });
    return { total: total, done: done };
  }

  function renderStreamNav() {
    streamNav.innerHTML = "";
    STREAMS.forEach(function (stream) {
      var counts = streamCounts(stream);
      var btn = document.createElement("button");
      btn.className = "stream-tab" + (stream.id === activeStreamId ? " active" : "");
      btn.setAttribute("data-stream", stream.id);
      btn.innerHTML =
        '<span class="num">' + stream.num + '</span>' +
        '<span class="meta">' +
          '<span class="name">' + stream.name + '</span>' +
          '<span class="count mono">' + counts.done + '/' + counts.total + ' reviewed</span>' +
        '</span>';
      btn.addEventListener("click", function () {
        activeStreamId = stream.id;
        renderAll();
      });
      streamNav.appendChild(btn);
    });
  }

  function renderOverall() {
    var total = 0, done = 0;
    STREAMS.forEach(function (s) {
      s.resources.forEach(function (r) {
        total++;
        if (reviewed[r.id]) done++;
      });
    });
    overallFill.style.width = (total ? (done / total) * 100 : 0) + "%";
    overallCount.textContent = done + " / " + total + " reviewed";
  }

  function renderHeader(stream) {
    streamHeader.innerHTML =
      '<div class="eyebrow">File ' + stream.num + ' · ' + stream.tagline + '</div>' +
      '<h1>' + stream.name + '</h1>' +
      '<p class="mandate">' + stream.mandate + '</p>';
  }

  function renderList(stream) {
    resourceList.innerHTML = "";
    stream.resources.forEach(function (res) {
      var li = document.createElement("li");
      li.className = "resource-item" + (reviewed[res.id] ? " reviewed" : "");
      li.setAttribute("data-id", res.id);
      li.innerHTML =
        '<span class="r-check" aria-hidden="true"></span>' +
        '<span class="r-body">' +
          '<span class="r-title">' + escapeHTML(res.title) + '</span>' +
          '<span class="r-meta">' + escapeHTML(res.source) + '</span>' +
          '<span class="r-desc">' + escapeHTML(res.description) + '</span>' +
        '</span>';
      li.addEventListener("click", function () { openPane(stream, res); });
      resourceList.appendChild(li);
    });
  }

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Chat check ----------

  function saveChatState(res) {
    saveJSON(STORAGE_CHAT, chats);
  }

  var FALLBACK_NOTE = "Couldn't generate topical questions (no working Claude connection yet) — showing this section's default questions for now. Fix the API key and reopen this resource to get topical ones.";

  // Resource-specific topical questions, generated once by Claude and cached
  // per resource so reopening it never re-spends an API call. A resource that
  // fell back to generic questions and never got past Q1 retries on next open,
  // so fixing the API key is enough without clearing localStorage by hand.
  function loadOrInitChat(stream, res) {
    var existing = chats[res.id];
    // Detect "stuck on fallback" from the transcript itself, not just the
    // usedFallback flag: older cached chats (saved before that flag existed)
    // still open with a leading error message and no progress made.
    var stuckOnFallback = existing && existing.qIndex === 0 &&
      existing.transcript && existing.transcript[0] && existing.transcript[0].kind === "error";
    if (existing && existing.questions && !stuckOnFallback) {
      renderChat(stream, res);
      return;
    }

    document.getElementById("chatProgress").textContent = "Writing questions about this resource…";
    document.getElementById("chatLog").innerHTML = renderMessage({ role: "assistant", kind: "pending" });
    document.getElementById("chatQuestions").innerHTML = "";
    document.getElementById("chatForm").hidden = true;
    document.getElementById("chatHint").hidden = true;

    fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        streamName: stream.name,
        resourceTitle: res.title,
        resourceSource: res.source,
        resourceDescription: res.description
      })
    })
      .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body }; }); })
      .then(function (result) {
        var questions = result.body && result.body.questions;
        if (!result.ok || result.body.error || !Array.isArray(questions) || questions.length !== 3) {
          initChatState(res, QUESTION_TEMPLATES[stream.id] || [], FALLBACK_NOTE, true);
        } else {
          initChatState(res, questions, null, false);
        }
        renderChat(stream, res);
      })
      .catch(function () {
        initChatState(res, QUESTION_TEMPLATES[stream.id] || [], FALLBACK_NOTE, true);
        renderChat(stream, res);
      });
  }

  function initChatState(res, questions, warning, usedFallback) {
    var transcript = [];
    if (warning) transcript.push({ role: "assistant", kind: "error", text: warning });
    if (questions.length) transcript.push({ role: "assistant", kind: "question", text: questions[0] });
    chats[res.id] = { questions: questions, qIndex: 0, transcript: transcript, usedFallback: !!usedFallback };
    saveJSON(STORAGE_CHAT, chats);
  }

  function renderChat(stream, res) {
    var state = chats[res.id];
    var questions = state.questions;
    var total = questions.length;
    var finished = state.qIndex >= total;

    var log = document.getElementById("chatLog");
    log.innerHTML = state.transcript.map(renderMessage).join("");
    log.scrollTop = log.scrollHeight;

    var progress = document.getElementById("chatProgress");
    progress.textContent = finished
      ? "All " + total + " cleared"
      : "Question " + (state.qIndex + 1) + " of " + total;

    renderQuestionTracker(questions, state.qIndex);

    var form = document.getElementById("chatForm");
    var input = document.getElementById("chatInput");
    var sendBtn = document.getElementById("chatSend");
    var hint = document.getElementById("chatHint");
    if (finished) {
      form.hidden = true;
      hint.hidden = true;
    } else {
      form.hidden = false;
      hint.hidden = false;
      input.disabled = false;
      sendBtn.disabled = false;
      input.value = "";
      input.style.height = "auto";
      input.focus();
    }
  }

  function renderQuestionTracker(questions, qIndex) {
    var el = document.getElementById("chatQuestions");
    if (!el) return;
    el.innerHTML =
      '<div class="cq-label">This check &middot; ' + questions.length + ' questions</div>' +
      '<ol class="cq-list">' +
        questions.map(function (q, i) {
          var status = i < qIndex ? "done" : i === qIndex ? "current" : "upcoming";
          var num = status === "done" ? "✓" : String(i + 1);
          return (
            '<li class="cq-item ' + status + '">' +
              '<span class="cq-num">' + num + '</span>' +
              '<span class="cq-text">' + escapeHTML(q) + '</span>' +
            '</li>'
          );
        }).join("") +
      '</ol>';
  }

  var NO_KEY_TEXT = "No Anthropic API key configured on the server yet — this response is a placeholder. Add a key and try again.";

  // Old saved chats (localStorage) can still hold a raw SDK/exception string
  // from before error messages were cleaned up server-side. Sanitize at
  // render time so a fix here also heals every already-saved chat, not just
  // new ones.
  function sanitizeErrorText(text) {
    if (!text) return text;
    if (/could not resolve authentication method/i.test(text) || /api[- ]?key/i.test(text)) {
      return NO_KEY_TEXT;
    }
    if (/^(request|verification) failed:/i.test(text)) {
      return "Something went wrong reaching Claude. Try sending your answer again.";
    }
    return text;
  }

  function renderMessage(m) {
    var who = m.role === "user" ? "You" : (m.kind === "error" ? "System" : "Claude");
    var cls = "msg " + m.role + (m.kind ? " " + m.kind : "");
    var body = m.kind === "pending"
      ? '<span class="typing"><span></span><span></span><span></span></span>'
      : escapeHTML(m.kind === "error" ? sanitizeErrorText(m.text) : m.text);
    return (
      '<div class="' + cls + '">' +
        '<div class="who">' + who + '</div>' +
        '<div class="text">' + body + '</div>' +
      '</div>'
    );
  }

  function submitAnswer(stream, res) {
    var state = chats[res.id];
    var questions = state.questions;
    var input = document.getElementById("chatInput");
    var answer = input.value.trim();
    if (!answer || state.qIndex >= questions.length) return;

    var question = questions[state.qIndex];
    state.transcript.push({ role: "user", text: answer });
    state.transcript.push({ role: "assistant", kind: "pending", text: "Checking your answer…" });
    saveChatState(res);
    renderChat(stream, res);

    document.getElementById("chatInput").disabled = true;
    document.getElementById("chatSend").disabled = true;

    fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceTitle: res.title,
        resourceSource: res.source,
        resourceDescription: res.description,
        question: question,
        answer: answer
      })
    })
      .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body }; }); })
      .then(function (result) {
        state.transcript.pop(); // drop the "Checking…" placeholder

        if (!result.ok || result.body.error) {
          state.transcript.push({ role: "assistant", kind: "error", text: result.body.error || "Verification failed." });
        } else {
          var verdict = result.body.verdict === "pass" ? "pass" : "retry";
          state.transcript.push({ role: "assistant", kind: "feedback-" + verdict, text: result.body.feedback });
          if (verdict === "pass") {
            state.qIndex++;
            if (state.qIndex < questions.length) {
              state.transcript.push({ role: "assistant", kind: "question", text: questions[state.qIndex] });
            } else {
              reviewed[res.id] = true;
              saveJSON(STORAGE_REVIEWED, reviewed);
              renderStreamNav();
              renderOverall();
              renderList(stream);
              var check = document.getElementById("reviewedCheck");
              if (check) check.checked = true;
            }
          }
        }

        saveChatState(res);
        renderChat(stream, res);
      })
      .catch(function (err) {
        state.transcript.pop();
        state.transcript.push({ role: "assistant", kind: "error", text: "Could not reach the server: " + err.message });
        saveChatState(res);
        renderChat(stream, res);
      });
  }

  function openPane(stream, res) {
    paneBody.innerHTML =
      '<div class="pane-eyebrow">File ' + stream.num + ' · ' + escapeHTML(stream.name) + '</div>' +
      '<h2>' + escapeHTML(res.title) + '</h2>' +
      '<div class="pane-source">' + escapeHTML(res.source) + '</div>' +
      '<p class="pane-desc">' + escapeHTML(res.description) + '</p>' +
      '<a class="pane-open-link" href="' + res.url + '" target="_blank" rel="noopener">Open resource ↗</a>' +
      '<label class="pane-reviewed">' +
        '<input type="checkbox" id="reviewedCheck" ' + (reviewed[res.id] ? "checked" : "") + '>' +
        '<span>Mark as reviewed</span>' +
      '</label>' +
      '<div class="chat">' +
        '<div class="chat-top">' +
          '<h3>Chat check</h3>' +
          '<span class="chat-progress" id="chatProgress"></span>' +
        '</div>' +
        '<div class="chat-log" id="chatLog"></div>' +
        '<div class="chat-questions" id="chatQuestions"></div>' +
        '<form class="chat-form" id="chatForm">' +
          '<textarea id="chatInput" placeholder="Type your answer…" rows="1"></textarea>' +
          '<button type="submit" id="chatSend" aria-label="Send"></button>' +
        '</form>' +
        '<div class="chat-hint" id="chatHint">Enter to send &middot; Shift+Enter for a new line</div>' +
      '</div>';

    var reviewedCheck = document.getElementById("reviewedCheck");
    reviewedCheck.addEventListener("change", function () {
      reviewed[res.id] = reviewedCheck.checked;
      saveJSON(STORAGE_REVIEWED, reviewed);
      renderStreamNav();
      renderOverall();
      renderList(stream);
    });

    loadOrInitChat(stream, res);

    var form = document.getElementById("chatForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitAnswer(stream, res);
    });
    var chatInput = document.getElementById("chatInput");
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitAnswer(stream, res);
      }
    });
    chatInput.addEventListener("input", function () {
      chatInput.style.height = "auto";
      chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + "px";
    });

    backdrop.classList.add("open");
    sidePane.classList.add("open");
    sidePane.setAttribute("aria-hidden", "false");
  }

  function closePane() {
    backdrop.classList.remove("open");
    sidePane.classList.remove("open");
    sidePane.setAttribute("aria-hidden", "true");
  }

  paneClose.addEventListener("click", closePane);
  backdrop.addEventListener("click", closePane);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePane();
  });

  function renderAll() {
    var stream = findStream(activeStreamId);
    renderStreamNav();
    renderOverall();
    renderHeader(stream);
    renderList(stream);
  }

  renderAll();
})();
