# Kamen Rider Pixel Fighters

Game fighting pixel (20 Rider Heisei): vs CPU atau **online 1v1** lawan temen. Jalan di browser HP maupun PC.

## Main online
Menu > MAIN ONLINE. Satu orang pilih BUAT ROOM (muncul kode 4 huruf), yang lain pilih GABUNG ROOM dan masukin kode itu. Masing-masing pilih Rider, host pilih arena, lalu tarung.
Teknis: WebRTC peer-to-peer lewat PeerJS (server sinyal gratis PeerJS Cloud, STUN Google). Host yang menjalankan game, tamu kirim input dan nerima snapshot, jadi tamu ngerasain delay sebesar ping. Tanpa server TURN, sebagian jaringan seluler/kantor (NAT ketat) bisa gagal tersambung; coba ganti ke WiFi atau tukar siapa yang jadi host.

## Publish lewat GitHub Pages
1. Buat repo baru di GitHub, upload **isi** folder ini (index.html harus ada di root repo).
2. Repo > Settings > Pages > Source: `Deploy from a branch` > Branch: `main` / `(root)` > Save.
3. Tunggu 1-2 menit, link game: `https://<username>.github.io/<nama-repo>/`. Kirim link itu ke temen, langsung bisa dimainkan tanpa install.

Lewat git:
```
git init && git add . && git commit -m "Kamen Rider Pixel Fighters"
git branch -M main && git remote add origin https://github.com/<username>/<nama-repo>.git && git push -u origin main
```
Main lokal (opsional): `python -m http.server 8080` lalu buka http://localhost:8080 (jangan buka lewat file://).

## Kontrol
Keyboard: WASD / panah gerak, J pukul, K tendang, L spesial, U ultimate, Shift tahan, Esc/P jeda.
HP: joystick + tombol layar (layar penuh + landscape otomatis setelah ketuk "TEKAN UNTUK MULAI").

## Rider
0 Kuuga, 1 Agito, 2 Ryuki, 3 Faiz, 4 Blade, 5 Hibiki, 6 Kabuto, 7 Den-O, 8 Kiva, 9 Decade, 10 W, 11 OOO, 12 Fourze, 13 Wizard, 14 Gaim, 15 Drive, 16 Ghost, 17 Ex-Aid, 18 Build, 19 Zi-O.
Jurus spesial = index % 3: Burst Shot, Dash Strike, Rising Kick.

## Sprite
Atlas di `assets/sprites/<nama>.png`, metadata frame di `js/sprites.js` (SMETA), keduanya **dihasilkan** oleh `tools/clean_sprites.py` dari file asli di `tools/original/`.
Skrip itu: membuang sisa background hijau chroma-key (termasuk "genangan" hijau di bawah kaki), membuang potongan frame tetangga, mengganti frame yang tercemar efek bawaan (pusaran api, teks "Obake!", dll) dengan frame bersih terdekat, lalu pack ulang atlas.
Jalankan ulang: `pip install pillow numpy scipy && python3 tools/clean_sprites.py` (selalu baca dari `tools/original/`, aman diulang).
Frame standar per animasi: IDLE 4, TURN 3, WALK 6, RUN 8, JUMP 3, CROUCH 2, GUARD 2, PUNCH 4, KICK 4, special 4, ULT 6-7, HIT 2, FALL 4, WIN 4, LOSE 2 (jumlah lain tetap jalan lewat frame cadangan).
