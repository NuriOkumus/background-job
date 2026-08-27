# Your first background job — To-Do (W4 · A7)

Kaynak: `W6 - Your first background job.pdf` (FlyRank Internship, Backend Track)

> Sıra önemli: aşamaları sırayla bitir, her aşama sonunda checkpoint'i doğrula ve commit at.
> Sadece Stage 3'e kadar bitirsen bile teslim et — çalışan bir yarım, bozuk bir bütünden iyidir.

## Hazırlık
- [ ] Lane seç: **JavaScript (Node.js + Express)** ya da **Python (FastAPI)** — ikisini karıştırma
- [ ] Inngest'i kur: `npm install inngest` ya da `pip install inngest`

## Stage 0 — Hello, server (~30 dk)
- [ ] `GET /health` → `{ "status": "ok" }` döndüren küçük bir server kur (A1'deki gibi)
- [ ] Express'i port 3000'de, FastAPI'yi port 8000'de başlat
- [ ] Checkpoint: `curl -i http://localhost:3000/health` → status 200 + JSON
- [ ] Commit: `Stage 0: hello server`

## Stage 1 — Inngest'i bağla (~1 sa)
- [ ] Inngest client oluştur (id: `report-api`)
- [ ] `say-hello` fonksiyonunu oluştur: `test/hello` event'i ile tetiklenir, içinde `step.sleep` ile 5 sn bekler, sonra `"Hello from the background!"` döner
- [ ] Fonksiyonu `/api/inngest` path'inde serve et
- [ ] İkinci terminalde Dev Server'ı başlat: `npx inngest-cli@latest dev -u http://localhost:3000/api/inngest`
- [ ] Dashboard'u aç (`http://localhost:8288`), `say-hello`'yu bul ve **Invoke** ile çalıştır
- [ ] Checkpoint: dashboard'da `say-hello` çalışması "Completed" olarak görünüyor
- [ ] Commit: `Stage 1: Inngest connected, first function runs`

## Stage 2 — Hızlı kapı: hemen kabul et, sonra işle (~1.5 sa)
- [ ] Bellek içi (in-memory) bir rapor deposu (dict/map) oluştur
- [ ] `POST /reports` endpoint'i ekle: id üretir, `{id, topic, status: "pending"}` kaydeder, `report/requested` event'ini gönderir, **202** + `{id, status: "pending"}` döner (yavaş iş burada yapılmaz)
- [ ] `make-report` adlı ikinci Inngest fonksiyonunu oluştur: `report/requested` ile tetiklenir, `step.sleep("do-the-slow-work", "8s")` sonra `step.run("build-report", ...)` ile sonucu üretip `status: "done"` yapar
- [ ] `GET /reports/:id` endpoint'i ekle: `pending` / `done` + sonucu döner, bilinmeyen id → `404`
- [ ] Checkpoint: `POST /reports` bir saniyeden kısa sürede 202 döner; ~10 sn sonra `GET /reports/:id` → `done`
- [ ] Commit: `Stage 2: 202 + background job + status endpoint`

## Stage 3 — İşler başarısız olur, retry'ı izle (~45 dk)
- [ ] `build-report` step'ine: topic `"fail"` ise hata fırlat
- [ ] Fonksiyon config'inde `retries: 2` ayarla
- [ ] `POST /reports` ile topic `"fail"` gönder, dashboard'da 3 denemeyi ve `Failed` sonucunu izle (backoff'a dikkat et)
- [ ] `POST /reports`'a validasyon ekle: topic eksikse → `400`, event gönderilmez
- [ ] README'ye retry vs. validation farkı hakkında bir cümle yaz
- [ ] Checkpoint: `make-report` çalışması 3 denemeyle `Failed` bitiyor; topic'siz `POST /reports` → `400`
- [ ] Commit: `Stage 3: retries seen, bad input rejected`

## Stage 4 — Saat çalıyor: ilk cron job (~45 dk)
- [ ] `heartbeat` adlı üçüncü Inngest fonksiyonunu oluştur, cron trigger ile (`* * * * *` — test için her dakika)
- [ ] İçinde `pending`/`done`/`failed` rapor sayılarını loglayan bir özet satırı yaz
- [ ] Dashboard'u 2 dakika izle, iki `heartbeat` çalışmasını doğrula
- [ ] README'ye: "her gün 08:00'de" ve "her Pazar 22:00'de" çalışacak cron ifadelerini yaz (crontab.guru ile oluştur)
- [ ] Checkpoint: dashboard'da bir dakika arayla iki `heartbeat` çalışması, her biri özet satırıyla
- [ ] Commit: `Stage 4: cron heartbeat`

## Stage 5 — GitHub'a yayınla (~45 dk)
- [ ] Kodu public bir GitHub reposuna koy (gerekirse `background-job/` gibi ayrı bir klasörde)
- [ ] README yaz: nasıl çalıştırılır (2 komut: API + Dev Server), endpoint/fonksiyon tablosu, 202 kanıtı + iki poll sonucu, Stage 3 & 4 cümleleri, dashboard ekran görüntüsü
- [ ] Checkpoint: README'yi takip eden biri 5 dakikadan kısa sürede iki terminali çalıştırıp rapor alabilmeli
- [ ] Commit: `Stage 5: publish and docs` — sonra push et

## Bonus / Stretch (opsiyonel)
- [ ] `GET /reports` — tüm raporları ve durumlarını listele
- [ ] "E-posta" simülasyonu: sonucu `outbox/<id>.txt` dosyasına da yaz
- [ ] Cleanup cron: 10 dakikadan eski `done` raporları silen ikinci bir scheduled fonksiyon
- [ ] Kendi cron zamanlamanı tasarla ve README'de açıkla
- [ ] Restart deneyi: rapor 8 saniyelik sleep'teyken API'yi durdur, tekrar başlat, dashboard'u izle, README'de 2 cümleyle "durable" olmanın ne demek olduğunu yaz
- [ ] Idempotency: aynı `report/requested` event'ini aynı id ile iki kez gönder, raporun yalnızca bir kez oluştuğunu doğrula
- [ ] Concurrency limit: aynı anda en fazla 2 rapor çalışacak şekilde ayarla, 5 tanesini kuyruğa al, 3'ünün beklediğini izle

## Stage 6 — Bonus: AI Rematch (~1 sa, opsiyonel)
- [ ] Dokümandan metin kopyalamadan, aynı sistemi inşa etmesi için bir AI asistana (Claude, ChatGPT, Gemini vb.) kendi prompt'unu yaz
- [ ] AI'nin kodunu ayrı bir klasörde/branch'te üret (`ai-version/`)
- [ ] Stage 2 ve Stage 3 checkpoint'lerini AI'nin koduna karşı çalıştır
- [ ] `git diff --no-index` ile karşılaştır, README'de "AI vs me" bölümü yaz: AI ne daha iyi yaptı, ne yanlış/es geçti, prompt'un neyi unuttu (en az 3 somut fark)
- [ ] Prompt'u iyileştirip yeniden üret, değişikliği bir cümlede not et
- [ ] Commit: `Stage 6: AI vs me`

## Teslim öncesi son kontrol (Requirements)
- [ ] API + Dev Server tek komutla başlıyor ve README'de belgeli
- [ ] `POST /reports` → 202 + id, bir saniyeden kısa
- [ ] `GET /reports/:id` → pending → done akışı, bilinmeyen id → 404, eksik topic → 400
- [ ] `make-report` en az iki step içeriyor ve dashboard'da görünüyor
- [ ] `"fail"` topic'i 3 denemeyle Failed sonuçlanıyor
- [ ] Cron fonksiyonu her dakika çalışıp özet logluyor
- [ ] Public repo, ≥6 anlamlı commit, eksiksiz README
