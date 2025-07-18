# Chessbot

Bu proje, Telegram için geliştirilmiş bir PvP satranç botudur. Kullanıcıların Telegram üzerinden arkadaşlarıyla satranç oynamasına olanak tanır.

## Özellikler

*   **Inline Sorgu ile Başlatma:** Oyunu başlatmak için `@chessy_bot[BOŞLUK]` yazarak kolayca başlatabilirsiniz.
*   **PvP Modu:** Arkadaşlarınızla karşılıklı satranç oynayın.
*   **Grup ve Özel Sohbet Uyumluluğu:** Bot, hem grup sohbetlerinde hem de özel sohbetlerde sorunsuz çalışır.
*   **Çoklu Oyun Desteği:** Tüm hamleler veritabanında saklandığı için aynı anda birden fazla oyun oynayabilirsiniz.

## Kurulum

Projeyi yerel makinenize kurmak ve çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu Klonlayın:**

    ```bash
    git clone https://github.com/king0din/chessbot.git
    cd chessbot
    ```

2.  **Bağımlılıkları Yükleyin:**

    ```bash
    npm install
    ```

3.  **Ortam Değişkenlerini Yapılandırın:**

    `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli ortam değişkenlerini (API anahtarları, veritabanı bilgileri vb.) doldurun:

    ```bash
    cp .env.example .env
    # editor .env
    ```

4.  **Veritabanı Geçişlerini Çalıştırın:**

    ```bash
    npm run knex migrate:latest
    ```

## Kullanım

Botu kullanmak oldukça basittir. Telegram'da herhangi bir sohbette `@chessy_bot` yazarak botu çağırın ve ardından oynamak istediğiniz tarafı seçin. Satranç tahtası ve "Oyuna Katıl" butonu ile bir inline mesaj göreceksiniz. Birisi oyununuza katıldığında, durum mesajı güncellenecek ve "Oyuna Katıl" butonu "Ayarlar" olarak değişecektir.

Parçalarınızı hareket ettirmek için, taşımak istediğiniz parçayı seçin ve ardından mevcut hareket karelerinden birini seçin.

> **UYARI!!!**
> Tahta varsayılan olarak her turda döner! Aktif oyuncu her zaman altta yer alır!

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.


