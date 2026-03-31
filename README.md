# QR Analytics Dashboard MVP

Bu proje, Supabase destekli QR tarama analitiklerini gösteren bir Next.js 14 dashboard uygulamasıdır.

## Kullanılan Teknolojiler

- Next.js 14 App Router
- TypeScript
- Supabase SSR ve veritabanı
- Recharts

## Ortam Değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın ve şu değişkenleri doldurun:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Lokal Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. `supabase/migrations` içindeki migration dosyalarını çalıştırın.

3. Uygulamayı başlatın:

```bash
npm run dev
```

4. Tarayıcıda `http://localhost:3000/dashboard` adresini açın.

## Kimlik Doğrulama ve Tenant Varsayımları

- Dashboard, giriş yapmış bir Supabase kullanıcısı bekler.
- `organization_id` ve isteğe bağlı `organization_timezone` bilgileri `user_metadata` içinden okunur.
- Örnek metadata:

```json
{
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "organization_timezone": "Europe/Istanbul"
}
```

## Herkese Açık Tarama Kaydı

`POST /api/scan`

Örnek istek:

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{
    "qrCodeSlug": "summer-campaign",
    "city": "Istanbul",
    "country": "TR",
    "source": "poster"
  }'
```

Bu endpoint, ilgili QR kaydını çözümler, tenant bilgisini belirler ve `scan_events` tablosuna append-only mantığıyla yeni bir kayıt yazar.

## Doğrulama Kontrol Listesi

1. Geçerli bir `tenant_id` ve `slug` ile en az bir `qr_codes` kaydı ekleyin.
2. Aynı `slug` için `POST /api/scan` isteği atın ve `scan_events` tablosunda yeni kayıt oluştuğunu doğrulayın.
3. `organization_id` değeri ilgili tenant ile eşleşen bir kullanıcıyla giriş yapın.
4. `/dashboard` sayfasını açıp şunları kontrol edin:
   - toplam tarama sayısı seçilen aralıktaki kayıt sayısıyla eşleşiyor mu
   - zaman serisi günlük bucket'lar halinde çiziliyor mu
   - şehir grafiği `null` şehirleri dışlıyor mu
   - saatlik dağılım kullanıcı metadata'sındaki saat dilimini kullanıyor mu

## Notlar

- Ham tarama verileri UTC olarak saklanır.
- `city` ve `country` alanları nullable'dır, uydurma veri yazılmaz.
- Dashboard grafiklerinde hazır aggregate tablo değil, doğrudan ham event verileri kullanılır.
