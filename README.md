# Chessbot

Bu proje, bir satranç botu uygulamasıdır.

## Kurulum

Projenin bağımlılıklarını yüklemek için aşağıdaki komutları kullanın:

```bash
npm install
```

Ardından, `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli ortam değişkenlerini doldurun:

```bash
cp .env.example .env
# editor .env
```

Veritabanı geçişlerini çalıştırın:

```bash
npm run knex migrate:latest
```

## Çalıştırma

Uygulamayı başlatmak için:

```bash
npm start
```

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.


