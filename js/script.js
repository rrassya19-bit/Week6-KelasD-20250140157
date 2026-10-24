const daftarProduk = document.querySelector('#daftarProduk');
const jumlahProduk = document.querySelector('#jumlahProduk');
const statusMemuat = document.querySelector('#statusMemuat');
const statusGagal = document.querySelector('#statusGagal');
const tombolCobaLagi = document.querySelector('#tombolCobaLagi');
const kepala = document.querySelector('#kepala');
const nota = document.querySelector('#nota');
const notaKosong = document.querySelector('#notaKosong');
const isiNota = document.querySelector('#isiNota');
const nomorNota = document.querySelector('#nomorNota');
const barangTerpilih = document.querySelector('#barangTerpilih');
const formPesanan = document.querySelector('#formPesanan');
const namaPemesan = document.querySelector('#namaPemesan');
const jumlah = document.querySelector('#jumlah');
const catatan = document.querySelector('#catatan');
const errorNama = document.querySelector('#errorNama');
const errorJumlah = document.querySelector('#errorJumlah');
const errorCatatan = document.querySelector('#errorCatatan');
const bantuanJumlah = document.querySelector('#bantuanJumlah');
const statusText = document.querySelector('#statusText');
const tombolKosongkan = document.querySelector('#tombolKosongkan');
const faktaBarang = document.querySelector('#faktaBarang');
const faktaKategori = document.querySelector('#faktaKategori');
const faktaHarga = document.querySelector('#faktaHarga');
const faktaBarangIsi = faktaBarang ? faktaBarang.querySelector('.fakta__nilai-isi') : null;
const faktaKategoriIsi = faktaKategori ? faktaKategori.querySelector('.fakta__nilai-isi') : null;
const faktaHargaIsi = faktaHarga ? faktaHarga.querySelector('.fakta__nilai-isi') : null;
const panggung = document.querySelector('#panggung');
const latarParallax = document.querySelector('#latarParallax');
const bentukParallax = document.querySelectorAll('.panggung__bentuk');
const latarHero = document.querySelector('#latarHero');
const dindingHero = document.querySelector('#dindingHero');
const hero = document.querySelector('.hero');
const judulHero = document.querySelector('#judulHero');
const fakta = document.querySelector('#fakta');
const marquee = document.querySelector('.marquee');

const ALAMAT_API = 'https://dummyjson.com/products';
const mediaKurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)');
const mediaMouseDesktop = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
const mediaHeroSempit = window.matchMedia('(max-width: 640px)');

// Kecepatan damping scroll berbasis waktu. Mulai dari 5; makin kecil makin
// lambat dan melayang, makin besar makin cepat menempel ke target.
const KECEPATAN = 5;

// dt dibatasi 0.05 detik supaya lompatan waktu (mis. tab kembali aktif)
// tidak membuat posisi scroll melompat.
const BATAS_DT = 0.05;

// Posisi dianggap sampai jika selisih target dan posisi di bawah 0.1 px.
const AMBANG_GULIR = 0.1;

// Faktor delta roda: 0.9 membuat gerakan roda lebih terkendali.
const FAKTOR_RODA = 0.9;

// Batas delta per event roda (px) supaya gerakan tidak melompat liar.
const BATAS_DELTA_RODA = 180;

// Durasi hitung naik statistik dalam milidetik.
const DURASI_HITUNG = 1600;

// Geser maksimum efek kursor pada dinding gambar dan blob (px).
const KEKUATAN_KURSOR = 14;

// Kecepatan interpolasi efek kursor: makin besar makin cepat mengejar.
const KECEPATAN_KURSOR = 8;

// Jumlah gambar unik per kolom dinding hero (3 x 3 di desktop, 3 x 2 di mobile).
const KARTU_PER_KOLOM_HERO = 3;

let kurangiGerak = mediaKurangiGerak.matches;

const state = {
  produk: [],
  terpilih: null,
  nomor: 0,
  fakta: {
    siap: false,
    barang: 0,
    kategori: 0,
    min: 0,
    max: 0,
    terlihat: false,
    frame: null,
  },
};

let katalogPertama = true;
let pengamat = null;
let pengamatHero = null;
let pengamatJudul = null;
let pengamatFakta = null;
let arahGulir = 'turun';
let posisiArahTerakhir = window.scrollY;
let gulirHalusAktif = false;
let targetGulir = window.scrollY;
let posisiGulir = window.scrollY;
let animasiGulirAktif = false;
let loopId = null;
let waktuLoop = 0;
let menungguUkur = false;
let geserParallaxTerakhir = null;

const ukuran = {
  lebarViewport: window.innerWidth,
  tinggiViewport: window.innerHeight,
  batasGulir: 0,
  atasPanggung: 0,
  tinggiPanggung: 0,
  tinggiLatar: 0,
  batasParallax: 0,
};

const kursor = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
};

const formatUangAngka = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatUang(nilai) {
  return '$' + formatUangAngka.format(nilai);
}

function buatEl(tag, kelas, teks) {
  const el = document.createElement(tag);
  if (kelas) el.className = kelas;
  if (teks !== undefined) el.textContent = teks;
  return el;
}

function gambarProduk(produk) {
  if (Array.isArray(produk.images) && produk.images.length > 0) {
    return produk.images[0];
  }
  return produk.thumbnail;
}

/* ---------- animasi masuk ---------- */

function tandaiArahReveal(el) {
  const dariAtas = arahGulir === 'naik';
  el.classList.toggle('reveal--dari-atas', dariAtas);
  el.classList.toggle('reveal--dari-bawah', !dariAtas);
}

function siapkanPengamat() {
  if (kurangiGerak || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      tandaiArahReveal(el);
      el.classList.add('is-visible');
    });
    return;
  }

  if (pengamat) return;

  pengamat = new IntersectionObserver(
    function (entri) {
      entri.forEach(function (item) {
        if (item.isIntersecting) {
          tandaiArahReveal(item.target);
          item.target.classList.add('is-visible');
        } else {
          item.target.classList.remove('is-visible');
        }
      });
    },
    { rootMargin: '0px 0px -4% 0px', threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    tandaiArahReveal(el);
    pengamat.observe(el);
  });
}

function amatiKartu(kartu, urutan) {
  kartu.classList.add('reveal');
  kartu.style.setProperty('--jeda', (urutan % 4) * 45 + 'ms');
  tandaiArahReveal(kartu);
  if (pengamat) {
    pengamat.observe(kartu);
  } else {
    kartu.classList.add('is-visible');
  }
}

function siapkanHero() {
  if (!hero) return;

  if (kurangiGerak || !('IntersectionObserver' in window)) {
    hero.classList.add('hero--tampil', 'hero--judul');
    return;
  }

  if (!pengamatHero) {
    pengamatHero = new IntersectionObserver(
      function (entri) {
        entri.forEach(function (item) {
          hero.classList.toggle('hero--tampil', item.isIntersecting);
        });
      },
      { threshold: 0.08 }
    );

    pengamatHero.observe(hero);
  }

  if (!pengamatJudul && judulHero) {
    pengamatJudul = new IntersectionObserver(
      function (entri) {
        entri.forEach(function (item) {
          hero.classList.toggle('hero--judul', item.isIntersecting);
        });
      },
      { threshold: 0.12 }
    );

    pengamatJudul.observe(judulHero);
  }
}

function siapkanFakta() {
  if (!fakta) return;

  if (kurangiGerak || !('IntersectionObserver' in window)) {
    aturVisibilitasFakta(true);
    return;
  }

  if (pengamatFakta) return;

  pengamatFakta = new IntersectionObserver(
    function (entri) {
      entri.forEach(function (item) {
        aturVisibilitasFakta(item.isIntersecting);
      });
    },
    { threshold: 0.2 }
  );

  pengamatFakta.observe(fakta);
}

function siapkanJedaMarquee() {
  if (!marquee || !('IntersectionObserver' in window)) return;

  const pengamatMarquee = new IntersectionObserver(
    function (entri) {
      marquee.classList.toggle('marquee--jeda', !entri[0].isIntersecting);
    },
    { threshold: 0.01 }
  );

  pengamatMarquee.observe(marquee);
}

/* ---------- dinding gambar hero ---------- */

function buatKartuHero(produk) {
  const kartu = buatEl('div', 'hero__kartu');
  const dalam = buatEl('div', 'hero__kartu-dalam');
  const sumber = gambarProduk(produk);

  if (!sumber) {
    kartu.classList.add('hero__kartu--kosong');
  } else {
    const gambar = buatEl('img');
    gambar.src = sumber;
    gambar.alt = '';
    gambar.loading = 'eager';
    gambar.decoding = 'async';
    gambar.draggable = false;
    gambar.addEventListener(
      'error',
      function () {
        gambar.remove();
        kartu.classList.add('hero__kartu--kosong');
      },
      { once: true }
    );
    dalam.append(gambar);
  }

  kartu.append(dalam);
  return kartu;
}

function isiDindingHero() {
  if (!dindingHero) return;

  dindingHero.replaceChildren();
  if (state.produk.length === 0) return;

  const jumlahKolom = mediaHeroSempit.matches ? 2 : 3;
  const jumlahSumber = jumlahKolom * KARTU_PER_KOLOM_HERO;
  const langkah = Math.max(1, Math.floor(state.produk.length / jumlahSumber));
  const sumber = [];

  for (let i = 0; i < state.produk.length && sumber.length < jumlahSumber; i += langkah) {
    sumber.push(state.produk[i]);
  }

  for (let i = 0; i < state.produk.length && sumber.length < jumlahSumber; i += 1) {
    if (!sumber.includes(state.produk[i])) sumber.push(state.produk[i]);
  }

  const kolom = Array.from({ length: jumlahKolom }, function () {
    return [];
  });

  sumber.forEach(function (item, index) {
    kolom[index % jumlahKolom].push(item);
  });

  kolom.forEach(function (items, index) {
    if (items.length === 0) return;

    const kolomEl = buatEl('div', 'hero__kolom');
    if (index === 1) kolomEl.classList.add('hero__kolom--turun');

    const jalur = buatEl('div', 'hero__jalur');
    items.concat(items).forEach(function (produk) {
      jalur.append(buatKartuHero(produk));
    });

    kolomEl.append(jalur);
    dindingHero.append(kolomEl);
  });
}

function siapkanJedaHero() {
  if (!latarHero || !('IntersectionObserver' in window)) return;

  const seksiHero = latarHero.closest('.hero');
  if (!seksiHero) return;

  const pengamatHero = new IntersectionObserver(
    function (entri) {
      latarHero.classList.toggle('hero__latar--jeda', !entri[0].isIntersecting);
    },
    { threshold: 0.02 }
  );

  pengamatHero.observe(seksiHero);
}

function pantauKepala() {
  kepala.classList.toggle('kepala--gulir', window.scrollY > 8);
}

function perbaruiParallax(posisi) {
  if (!panggung || !latarParallax) return;

  if (kurangiGerak) {
    if (geserParallaxTerakhir !== 0) {
      latarParallax.style.setProperty('--geser', '0px');
      bentukParallax.forEach(function (bentuk) {
        bentuk.style.setProperty('--geser-bentuk', '0px');
      });
      geserParallaxTerakhir = 0;
    }
    return;
  }

  const tinggi = ukuran.tinggiPanggung;
  if (!tinggi) return;

  const atas = ukuran.atasPanggung - posisi;
  const progres = (ukuran.tinggiViewport - atas) / (ukuran.tinggiViewport + tinggi);
  const faktorLebar = ukuran.lebarViewport < 640 ? 0.55 : 1;
  const geser = jepit(
    (progres - 0.5) * 2 * ukuran.batasParallax * faktorLebar,
    -ukuran.batasParallax,
    ukuran.batasParallax
  );

  if (geserParallaxTerakhir !== null && Math.abs(geser - geserParallaxTerakhir) < 0.05) return;

  geserParallaxTerakhir = geser;
  latarParallax.style.setProperty('--geser', geser.toFixed(2) + 'px');
  bentukParallax.forEach(function (bentuk) {
    const kecepatan = Number(bentuk.dataset.kecepatan) || 1;
    bentuk.style.setProperty('--geser-bentuk', (geser * kecepatan).toFixed(2) + 'px');
  });
}

/* ---------- efek kursor ---------- */

function perbaruiTargetKursor(event) {
  if (!mediaMouseDesktop.matches || kurangiGerak) return;
  if (event.pointerType && event.pointerType !== 'mouse') return;

  const lebar = window.innerWidth || 1;
  const tinggi = window.innerHeight || 1;
  const nx = event.clientX / lebar - 0.5;
  const ny = event.clientY / tinggi - 0.5;

  kursor.targetX = -nx * 2 * KEKUATAN_KURSOR;
  kursor.targetY = -ny * 2 * KEKUATAN_KURSOR;
  mulaiLoop();
}

function resetTargetKursor() {
  kursor.targetX = 0;
  kursor.targetY = 0;
  mulaiLoop();
}

function perbaruiKursor(dt) {
  if (!latarHero) return false;

  if (!mediaMouseDesktop.matches || kurangiGerak) {
    kursor.x = 0;
    kursor.y = 0;
    latarHero.style.setProperty('--kursor-x', '0');
    latarHero.style.setProperty('--kursor-y', '0');
    return false;
  }

  const faktor = 1 - Math.exp(-KECEPATAN_KURSOR * dt);
  kursor.x += (kursor.targetX - kursor.x) * faktor;
  kursor.y += (kursor.targetY - kursor.y) * faktor;

  if (Math.abs(kursor.targetX - kursor.x) < 0.02) kursor.x = kursor.targetX;
  if (Math.abs(kursor.targetY - kursor.y) < 0.02) kursor.y = kursor.targetY;

  latarHero.style.setProperty('--kursor-x', kursor.x.toFixed(2));
  latarHero.style.setProperty('--kursor-y', kursor.y.toFixed(2));

  return kursor.x !== kursor.targetX || kursor.y !== kursor.targetY;
}

/* ---------- scroll halus, parallax, dan kursor dalam satu loop ---------- */

function jepit(nilai, minimum, maksimum) {
  return Math.min(maksimum, Math.max(minimum, nilai));
}

function batasGulir() {
  return ukuran.batasGulir;
}

function perbaruiArahGulir() {
  const posisi = window.scrollY;

  if (posisi > posisiArahTerakhir + 1) {
    arahGulir = 'turun';
  } else if (posisi < posisiArahTerakhir - 1) {
    arahGulir = 'naik';
  }

  posisiArahTerakhir = posisi;
}

function targetBisaGulirSendiri(target) {
  let el = target instanceof Element ? target : null;

  while (el && el !== document.body && el !== document.documentElement) {
    if (el.matches('textarea, select')) return true;

    const gaya = window.getComputedStyle(el);
    const bisaGulir = /(auto|scroll|overlay)/.test(gaya.overflowY);

    if (bisaGulir && el.scrollHeight > el.clientHeight + 1) return true;
    el = el.parentElement;
  }

  return false;
}

function perluScrollNative(target, tombol) {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
  if (tombol === ' ' || tombol === 'Spacebar') {
    return Boolean(target.closest('button, a'));
  }
  return false;
}

function ukurUlang() {
  ukuran.lebarViewport = window.innerWidth;
  ukuran.tinggiViewport = window.innerHeight;
  ukuran.batasGulir = Math.max(0, document.documentElement.scrollHeight - ukuran.tinggiViewport);

  if (panggung && latarParallax) {
    const kotak = panggung.getBoundingClientRect();
    ukuran.atasPanggung = kotak.top + window.scrollY;
    ukuran.tinggiPanggung = panggung.offsetHeight;
    ukuran.tinggiLatar = latarParallax.offsetHeight;
    ukuran.batasParallax = Math.max(0, (ukuran.tinggiLatar - ukuran.tinggiPanggung) / 2);
  }

  targetGulir = jepit(targetGulir, 0, ukuran.batasGulir);
  posisiGulir = jepit(posisiGulir, 0, ukuran.batasGulir);

  geserParallaxTerakhir = null;
  perbaruiParallax(gulirHalusAktif ? posisiGulir : window.scrollY);
}

function sinkronkanPosisiGulir() {
  if (Math.abs(window.scrollY - posisiGulir) > 2.5) {
    posisiGulir = window.scrollY;
    targetGulir = window.scrollY;
    animasiGulirAktif = false;
  }
}

function periksaGulirHalus() {
  const aktif = mediaMouseDesktop.matches && !kurangiGerak;

  if (aktif === gulirHalusAktif) return;

  gulirHalusAktif = aktif;
  document.documentElement.classList.toggle('gulir-halus', aktif);

  posisiGulir = window.scrollY;
  targetGulir = window.scrollY;
  animasiGulirAktif = false;

  if (aktif) mulaiLoop();
}

function mulaiLoop() {
  if (loopId !== null) return;
  waktuLoop = performance.now();
  loopId = window.requestAnimationFrame(langkahLoop);
}

function langkahLoop(sekarang) {
  loopId = null;

  let dt = (sekarang - waktuLoop) / 1000;
  waktuLoop = sekarang;

  if (!Number.isFinite(dt) || dt <= 0) dt = 1 / 60;
  if (dt > BATAS_DT) dt = BATAS_DT;

  let lanjut = false;

  if (gulirHalusAktif) {
    const selisih = targetGulir - posisiGulir;

    if (Math.abs(selisih) < AMBANG_GULIR) {
      posisiGulir = targetGulir;
      animasiGulirAktif = false;

      const bulat = Math.round(posisiGulir);
      if (Math.round(window.scrollY) !== bulat) {
        window.scrollTo(0, bulat);
      }
    } else {
      posisiGulir += selisih * (1 - Math.exp(-KECEPATAN * dt));
      animasiGulirAktif = true;
      window.scrollTo(0, posisiGulir);
      lanjut = true;
    }
  } else {
    posisiGulir = window.scrollY;
  }

  perbaruiParallax(gulirHalusAktif ? posisiGulir : window.scrollY);

  if (perbaruiKursor(dt)) lanjut = true;

  if (lanjut) {
    loopId = window.requestAnimationFrame(langkahLoop);
  }
}

function tanganiRoda(event) {
  if (!gulirHalusAktif || event.ctrlKey) return;

  let delta = event.deltaY;
  if (!delta) return;

  if (targetBisaGulirSendiri(event.target)) return;

  event.preventDefault();

  if (event.deltaMode === 1) {
    delta *= 16;
  } else if (event.deltaMode === 2) {
    delta *= ukuran.tinggiViewport;
  }

  delta *= FAKTOR_RODA;
  delta = jepit(delta, -BATAS_DELTA_RODA, BATAS_DELTA_RODA);

  if (!animasiGulirAktif) {
    posisiGulir = window.scrollY;
    targetGulir = window.scrollY;
  }

  targetGulir = jepit(targetGulir + delta, 0, ukuran.batasGulir);
  animasiGulirAktif = true;
  mulaiLoop();
}

function tanganiTombol(event) {
  if (!gulirHalusAktif || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  const tombol = event.key;
  let delta = 0;
  let tujuanLangsung = null;

  if (tombol === 'ArrowDown') {
    delta = 90;
  } else if (tombol === 'ArrowUp') {
    delta = -90;
  } else if (tombol === 'PageDown') {
    delta = ukuran.tinggiViewport * 0.82;
  } else if (tombol === 'PageUp') {
    delta = -ukuran.tinggiViewport * 0.82;
  } else if (tombol === ' ' || tombol === 'Spacebar') {
    delta = (event.shiftKey ? -1 : 1) * ukuran.tinggiViewport * 0.82;
  } else if (tombol === 'Home') {
    tujuanLangsung = 0;
  } else if (tombol === 'End') {
    tujuanLangsung = ukuran.batasGulir;
  } else {
    return;
  }

  if (perluScrollNative(event.target, tombol) || targetBisaGulirSendiri(event.target)) return;

  event.preventDefault();

  if (!animasiGulirAktif) {
    posisiGulir = window.scrollY;
    targetGulir = window.scrollY;
  }

  if (tujuanLangsung !== null) {
    targetGulir = jepit(tujuanLangsung, 0, ukuran.batasGulir);
  } else {
    targetGulir = jepit(targetGulir + delta, 0, ukuran.batasGulir);
  }

  animasiGulirAktif = true;
  mulaiLoop();
}

function tanganiKlikAnchor(event) {
  if (!gulirHalusAktif) return;
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const tautan = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!tautan) return;

  const href = tautan.getAttribute('href');
  if (!href || href === '#') return;

  const tujuan = document.getElementById(href.slice(1));
  if (!tujuan) return;

  event.preventDefault();

  const tinggiKepala = kepala ? kepala.offsetHeight : 0;
  let atas = 0;

  if (tujuan.id !== 'atas') {
    atas = window.scrollY + tujuan.getBoundingClientRect().top - tinggiKepala;
  }

  ukuran.batasGulir = Math.max(0, document.documentElement.scrollHeight - ukuran.tinggiViewport);
  targetGulir = jepit(atas, 0, ukuran.batasGulir);

  if (!animasiGulirAktif) posisiGulir = window.scrollY;

  animasiGulirAktif = true;
  mulaiLoop();

  try {
    history.pushState(null, '', href);
  } catch (error) {
    // Abaikan bila history tidak bisa diubah (misalnya saat pratinjau sandbox).
  }
}

window.addEventListener('wheel', tanganiRoda, { passive: false });
window.addEventListener('keydown', tanganiTombol);
document.addEventListener('click', tanganiKlikAnchor);

window.addEventListener(
  'scroll',
  function () {
    perbaruiArahGulir();
    sinkronkanPosisiGulir();
    pantauKepala();
    mulaiLoop();
  },
  { passive: true }
);

function tanganiUkuran() {
  if (menungguUkur) return;
  menungguUkur = true;

  window.requestAnimationFrame(function () {
    menungguUkur = false;
    targetGulir = window.scrollY;
    posisiGulir = window.scrollY;
    animasiGulirAktif = false;
    ukurUlang();
    periksaGulirHalus();
    mulaiLoop();
  });
}

window.addEventListener('resize', tanganiUkuran, { passive: true });

if ('ResizeObserver' in window) {
  const pengamatUkuran = new ResizeObserver(function () {
    if (menungguUkur) return;
    menungguUkur = true;

    window.requestAnimationFrame(function () {
      menungguUkur = false;
      ukurUlang();
    });
  });

  pengamatUkuran.observe(document.body);
}

if (hero) {
  hero.addEventListener('pointermove', perbaruiTargetKursor, { passive: true });
  hero.addEventListener('pointerleave', resetTargetKursor, { passive: true });
  hero.addEventListener('pointercancel', resetTargetKursor, { passive: true });
}

if (typeof mediaKurangiGerak.addEventListener === 'function') {
  mediaKurangiGerak.addEventListener('change', function (event) {
    kurangiGerak = event.matches;
    periksaGulirHalus();

    if (kurangiGerak) {
      hentikanHitungFakta();
      if (state.fakta.siap) {
        tulisFakta(state.fakta.barang, state.fakta.kategori, state.fakta.min, state.fakta.max);
      }
    } else {
      if (!pengamat && 'IntersectionObserver' in window) siapkanPengamat();
      if (!pengamatHero || !pengamatJudul) siapkanHero();
      if (!pengamatFakta) siapkanFakta();
    }

    resetTargetKursor();
    geserParallaxTerakhir = null;
    perbaruiParallax(gulirHalusAktif ? posisiGulir : window.scrollY);
    mulaiLoop();
  });
}

if (typeof mediaMouseDesktop.addEventListener === 'function') {
  mediaMouseDesktop.addEventListener('change', function () {
    periksaGulirHalus();
    if (!mediaMouseDesktop.matches) resetTargetKursor();
  });
}

if (typeof mediaHeroSempit.addEventListener === 'function') {
  mediaHeroSempit.addEventListener('change', function () {
    isiDindingHero();
    ukurUlang();
    mulaiLoop();
  });
}

/* ---------- katalog ---------- */

function renderKerangka() {
  if (pengamat) {
    daftarProduk.querySelectorAll('.reveal').forEach(function (el) {
      pengamat.unobserve(el);
    });
  }

  daftarProduk.replaceChildren();

  for (let i = 0; i < 8; i += 1) {
    const kerangka = buatEl('div', 'kerangka');
    kerangka.append(buatEl('div', 'kerangka__media'));
    const isi = buatEl('div', 'kerangka__isi');
    isi.append(buatEl('div', 'kerangka__baris'));
    isi.append(buatEl('div', 'kerangka__baris kerangka__baris--pendek'));
    kerangka.append(isi);
    kerangka.setAttribute('aria-hidden', 'true');
    daftarProduk.append(kerangka);
  }
}

function buatKartu(produk) {
  const terpilih = state.terpilih !== null && state.terpilih.id === produk.id;
  const kartu = buatEl('article', 'kartu');
  kartu.dataset.id = String(produk.id);
  if (terpilih) kartu.classList.add('kartu--terpilih');

  const media = buatEl('div', 'kartu__media');

  const gambar = buatEl('img', 'kartu__gambar');
  gambar.src = gambarProduk(produk);
  gambar.alt = produk.title;
  gambar.width = 1000;
  gambar.height = 1000;
  gambar.loading = 'lazy';
  gambar.decoding = 'async';
  media.append(gambar);

  if (terpilih) media.append(buatEl('p', 'kartu__tanda', 'Dipilih'));

  const menipis = produk.stock <= 10;
  media.append(
    buatEl(
      'p',
      menipis ? 'kartu__stok kartu__stok--menipis' : 'kartu__stok',
      menipis ? 'Stok menipis' : 'Stok ' + produk.stock
    )
  );

  const isi = buatEl('div', 'kartu__isi');
  isi.append(buatEl('p', 'kartu__kategori', produk.category));
  isi.append(buatEl('h3', 'kartu__judul', produk.title));
  isi.append(buatEl('p', 'kartu__merek', produk.brand ? produk.brand : '-'));

  const kaki = buatEl('div', 'kartu__kaki');
  kaki.append(buatEl('p', 'kartu__harga', formatUang(produk.price)));

  const tombol = buatEl('button', 'tombol kartu__tombol', terpilih ? 'Ganti' : 'Pesan');
  tombol.type = 'button';
  tombol.addEventListener('click', function () {
    pilihProduk(produk.id);
  });
  kaki.append(tombol);

  isi.append(kaki);
  kartu.append(media, isi);
  return kartu;
}

function renderKatalog(produk) {
  if (pengamat) {
    daftarProduk.querySelectorAll('.reveal').forEach(function (el) {
      pengamat.unobserve(el);
    });
  }

  daftarProduk.replaceChildren();

  if (produk.length === 0) {
    daftarProduk.append(buatEl('p', 'kartu__kategori', 'Tidak ada barang yang bisa ditampilkan.'));
    return;
  }

  const wadah = document.createDocumentFragment();
  produk.forEach(function (item, urutan) {
    const kartu = buatKartu(item);
    amatiKartu(kartu, urutan);
    wadah.append(kartu);
  });
  daftarProduk.append(wadah);

  if (!katalogPertama) {
    daftarProduk.querySelectorAll('.kartu.reveal:not(.is-visible)').forEach(function (kartu) {
      const kotak = kartu.getBoundingClientRect();
      if (kotak.top < window.innerHeight && kotak.bottom > 0) {
        kartu.classList.add('is-visible');
      }
    });
  }

  katalogPertama = false;
}

/* ---------- statistik ---------- */

function tulisFakta(barang, kategori, min, max) {
  if (faktaBarangIsi) faktaBarangIsi.textContent = String(Math.round(barang));
  if (faktaKategoriIsi) faktaKategoriIsi.textContent = String(Math.round(kategori));
  if (faktaHargaIsi) faktaHargaIsi.textContent = formatUang(min) + ' - ' + formatUang(max);
}

function tulisLabelFakta() {
  const data = state.fakta;
  if (!data.siap) return;

  if (faktaBarang) faktaBarang.setAttribute('aria-label', String(data.barang));
  if (faktaKategori) faktaKategori.setAttribute('aria-label', String(data.kategori));
  if (faktaHarga) {
    faktaHarga.setAttribute('aria-label', formatUang(data.min) + ' - ' + formatUang(data.max));
  }
}

function kosongkanFakta() {
  if (faktaBarangIsi) faktaBarangIsi.textContent = '—';
  if (faktaKategoriIsi) faktaKategoriIsi.textContent = '—';
  if (faktaHargaIsi) faktaHargaIsi.textContent = '—';
}

function gagalFakta() {
  state.fakta.siap = false;
  hentikanHitungFakta();
  kosongkanFakta();

  [faktaBarang, faktaKategori, faktaHarga].forEach(function (el) {
    if (el) el.setAttribute('aria-label', 'Tidak tersedia');
  });
}

function hentikanHitungFakta() {
  if (state.fakta.frame !== null) {
    window.cancelAnimationFrame(state.fakta.frame);
    state.fakta.frame = null;
  }
}

function mulaiHitungFakta() {
  hentikanHitungFakta();

  const data = state.fakta;

  if (!data.siap) {
    kosongkanFakta();
    return;
  }

  if (kurangiGerak) {
    tulisFakta(data.barang, data.kategori, data.min, data.max);
    return;
  }

  const mulai = performance.now();
  tulisFakta(0, 0, 0, 0);

  function langkah(sekarang) {
    const progres = Math.min(1, (sekarang - mulai) / DURASI_HITUNG);
    const halus = progres >= 1 ? 1 : 1 - Math.pow(2, -10 * progres);

    tulisFakta(data.barang * halus, data.kategori * halus, data.min * halus, data.max * halus);

    if (progres < 1) {
      data.frame = window.requestAnimationFrame(langkah);
    } else {
      data.frame = null;
      tulisFakta(data.barang, data.kategori, data.min, data.max);
    }
  }

  data.frame = window.requestAnimationFrame(langkah);
}

function aturVisibilitasFakta(terlihat) {
  state.fakta.terlihat = terlihat;

  if (fakta) fakta.classList.toggle('fakta--tampil', terlihat);

  if (terlihat) {
    mulaiHitungFakta();
  } else {
    hentikanHitungFakta();
  }
}

function isiFakta() {
  if (!faktaBarang || !faktaKategori || !faktaHarga) return;

  const kategori = new Set(
    state.produk.map(function (item) {
      return item.category;
    })
  );
  const harga = state.produk.map(function (item) {
    return item.price;
  });

  const min = harga.length > 0 ? Math.min.apply(null, harga) : 0;
  const max = harga.length > 0 ? Math.max.apply(null, harga) : 0;
  const data = state.fakta;

  data.siap = true;
  data.barang = state.produk.length;
  data.kategori = kategori.size;
  data.min = min;
  data.max = max;

  tulisLabelFakta();

  if (data.terlihat) {
    mulaiHitungFakta();
  } else {
    tulisFakta(0, 0, 0, 0);
  }
}

async function ambilProduk() {
  statusGagal.hidden = true;
  statusMemuat.hidden = false;
  jumlahProduk.textContent = '';
  renderKerangka();

  try {
    const response = await fetch(ALAMAT_API);
    if (!response.ok) {
      throw new Error('Permintaan gagal dengan status ' + response.status);
    }

    const data = await response.json();
    if (!Array.isArray(data.products)) {
      throw new Error('Bentuk data tidak dikenal');
    }

    state.produk = data.products;
    katalogPertama = true;
    isiDindingHero();
    renderKatalog(state.produk);
    jumlahProduk.textContent = state.produk.length + ' barang';
    isiFakta();
  } catch (error) {
    daftarProduk.replaceChildren();
    if (dindingHero) dindingHero.replaceChildren();
    statusGagal.hidden = false;
    jumlahProduk.textContent = '';
    gagalFakta();
  } finally {
    statusMemuat.hidden = true;
    ukurUlang();
    mulaiLoop();
  }
}

/* ---------- pilihan barang ---------- */

function pilihProduk(id) {
  const produk = state.produk.find(function (item) {
    return item.id === id;
  });
  if (!produk) return;

  state.terpilih = {
    id: produk.id,
    title: produk.title,
    price: produk.price,
    stock: produk.stock,
    minimumOrderQuantity: produk.minimumOrderQuantity || 1,
  };

  renderKatalog(state.produk);
  renderPilihan();

  jumlah.value = String(state.terpilih.minimumOrderQuantity);
  bantuanJumlah.textContent =
    'Minimal ' + state.terpilih.minimumOrderQuantity + ' unit, stok ' + state.terpilih.stock + ' unit.';
  hapusError(jumlah, errorJumlah);

  namaPemesan.focus();
}

function renderPilihan() {
  barangTerpilih.replaceChildren();

  if (!state.terpilih) {
    barangTerpilih.append(buatEl('p', 'pilihan__kosong', 'Belum ada barang dipilih.'));
    bantuanJumlah.textContent = 'Pilih barang dulu untuk melihat batas jumlah.';
    return;
  }

  const baris = buatEl('div', 'pilihan__baris');
  baris.append(buatEl('p', 'pilihan__judul', state.terpilih.title));
  baris.append(buatEl('p', 'pilihan__harga', formatUang(state.terpilih.price)));
  barangTerpilih.append(baris);

  barangTerpilih.append(
    buatEl(
      'p',
      'pilihan__ket',
      'Stok ' +
        state.terpilih.stock +
        ' unit, minimal ' +
        state.terpilih.minimumOrderQuantity +
        ' unit.'
    )
  );
}

/* ---------- validasi ---------- */

function tampilkanError(input, elemenPesan, pesan) {
  elemenPesan.textContent = pesan;
  input.setAttribute('aria-invalid', 'true');
  input.closest('.field').classList.add('field--salah');
}

function hapusError(input, elemenPesan) {
  if (!elemenPesan.textContent) return;
  elemenPesan.textContent = '';
  input.removeAttribute('aria-invalid');
  input.closest('.field').classList.remove('field--salah');
}

function hapusSemuaError() {
  hapusError(namaPemesan, errorNama);
  hapusError(jumlah, errorJumlah);
  hapusError(catatan, errorCatatan);
}

function validasiForm() {
  let pertama = null;

  const nama = namaPemesan.value.trim();
  let pesanNama = '';
  if (nama.length < 3) {
    pesanNama = 'Nama pemesan minimal 3 karakter.';
  } else if (nama.length > 60) {
    pesanNama = 'Nama pemesan maksimal 60 karakter.';
  }
  if (pesanNama) {
    tampilkanError(namaPemesan, errorNama, pesanNama);
    pertama = pertama || namaPemesan;
  } else {
    hapusError(namaPemesan, errorNama);
  }

  const minimal = state.terpilih ? state.terpilih.minimumOrderQuantity : 1;
  const stok = state.terpilih ? state.terpilih.stock : 0;
  const isiJumlah = jumlah.value.trim();
  const angka = Number(isiJumlah);
  let pesanJumlah = '';

  if (!isiJumlah) {
    pesanJumlah = 'Jumlah minimal ' + minimal + ' unit.';
  } else if (!Number.isInteger(angka)) {
    pesanJumlah = 'Isi jumlah dengan angka bulat.';
  } else if (angka < minimal) {
    pesanJumlah = 'Jumlah minimal ' + minimal + ' unit.';
  } else if (angka > stok) {
    pesanJumlah = 'Stok tersisa ' + stok + ' unit.';
  }

  if (pesanJumlah) {
    tampilkanError(jumlah, errorJumlah, pesanJumlah);
    pertama = pertama || jumlah;
  } else {
    hapusError(jumlah, errorJumlah);
  }

  const isiCatatan = catatan.value.trim();
  if (isiCatatan.length > 120) {
    tampilkanError(catatan, errorCatatan, 'Catatan maksimal 120 karakter.');
    pertama = pertama || catatan;
  } else {
    hapusError(catatan, errorCatatan);
  }

  return { valid: pertama === null, pertama: pertama };
}

/* ---------- nota ---------- */

function aturStatus(pesan, jenis) {
  statusText.textContent = pesan;
  statusText.className = 'kartu-form__status';
  if (jenis) statusText.classList.add('kartu-form__status--' + jenis);
}

function buatNota(nama) {
  const barang = state.terpilih;
  const banyak = Number(jumlah.value);
  const total = barang.price * banyak;

  state.nomor += 1;
  const nomor = 'No. ' + String(state.nomor).padStart(3, '0');

  isiNota.replaceChildren();

  isiNota.append(
    buatEl(
      'p',
      'nota__tanggal',
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    )
  );
  isiNota.append(buatEl('p', 'nota__barang', barang.title));

  const hitung = buatEl('div', 'nota__baris');
  hitung.append(buatEl('span', null, banyak + ' x ' + formatUang(barang.price)));
  hitung.append(buatEl('span', null, formatUang(total)));
  isiNota.append(hitung);

  const barisTotal = buatEl('div', 'nota__baris nota__baris--total');
  barisTotal.append(buatEl('span', null, 'Total'));
  barisTotal.append(buatEl('span', null, formatUang(total)));
  isiNota.append(barisTotal);

  const rincian = buatEl('dl', 'nota__rincian');
  rincian.append(buatEl('dt', null, 'Pemesan'));
  rincian.append(buatEl('dd', null, nama));

  const pesan = catatan.value.trim();
  if (pesan) {
    rincian.append(buatEl('dt', null, 'Catatan'));
    rincian.append(buatEl('dd', null, pesan));
  }
  isiNota.append(rincian);

  notaKosong.hidden = true;
  isiNota.hidden = false;
  nomorNota.textContent = nomor;
}

/* ---------- event ---------- */

formPesanan.addEventListener('submit', function (event) {
  event.preventDefault();

  if (!state.terpilih) {
    aturStatus('Pilih barang dari katalog dulu.', 'gagal');
    daftarProduk.scrollIntoView({ block: 'start' });
    return;
  }

  const hasil = validasiForm();
  if (!hasil.valid) {
    aturStatus('Periksa lagi isian yang ditandai.', 'gagal');
    if (hasil.pertama) hasil.pertama.focus();
    return;
  }

  const nama = namaPemesan.value.trim();
  buatNota(nama);
  aturStatus('Nota untuk ' + nama + ' sudah dibuat.', 'sukses');

  if (window.matchMedia('(max-width: 900px)').matches) {
    nota.scrollIntoView({ block: 'start', behavior: kurangiGerak ? 'auto' : 'smooth' });
  }
});

namaPemesan.addEventListener('input', function () {
  hapusError(namaPemesan, errorNama);
});

jumlah.addEventListener('input', function () {
  hapusError(jumlah, errorJumlah);
});

catatan.addEventListener('input', function () {
  hapusError(catatan, errorCatatan);
});

tombolKosongkan.addEventListener('click', function () {
  formPesanan.reset();
  state.terpilih = null;
  hapusSemuaError();
  renderPilihan();
  renderKatalog(state.produk);
  isiNota.replaceChildren();
  isiNota.hidden = true;
  notaKosong.hidden = false;
  nomorNota.textContent = '';
  aturStatus('', null);
});

tombolCobaLagi.addEventListener('click', function () {
  ambilProduk();
});

/* ---------- mulai ---------- */

siapkanPengamat();
siapkanHero();
siapkanFakta();
siapkanJedaHero();
siapkanJedaMarquee();
periksaGulirHalus();
pantauKepala();
ukurUlang();
mulaiLoop();

window.addEventListener(
  'load',
  function () {
    ukurUlang();
    mulaiLoop();
  },
  { once: true }
);

ambilProduk();
