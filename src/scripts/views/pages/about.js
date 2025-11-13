const AboutPage = {
  async render() {
    return `
      <div class="container">
        <section class="about-section">
          <div class="about-header">
            <h2 class="about-title">Tentang Dicoding Story 📖</h2>
          </div>

          <div class="about-content">
            <div class="about-card">
              <h3>🎯 Apa itu Dicoding Story?</h3>
              <p>
                Dicoding Story adalah platform berbagi cerita dan pengalaman dari komunitas Dicoding. 
                Aplikasi ini memungkinkan Anda untuk membagikan momen, pembelajaran, dan inspirasi 
                kepada sesama learner di seluruh Indonesia.
              </p>
            </div>

            <div class="about-card">
              <h3>✨ Fitur Unggulan</h3>
              <ul class="feature-list">
                <li>📍 <strong>Peta Interaktif</strong> - Lihat lokasi cerita dari seluruh Indonesia</li>
                <li>🗺️ <strong>Multiple Map Layers</strong> - Pilih tampilan peta sesuai preferensi</li>
                <li>📸 <strong>Upload & Camera</strong> - Tambah foto dari galeri atau kamera langsung</li>
                <li>🔄 <strong>Sync List & Map</strong> - Sinkronisasi tampilan list dan peta</li>
                <li>🎨 <strong>Dark Theme</strong> - Desain modern dengan gradient gelap</li>
                <li>♿ <strong>Accessible</strong> - Memenuhi standar WCAG untuk semua pengguna</li>
              </ul>
            </div>

            <div class="about-card">
              <h3>🛠️ Teknologi yang Digunakan</h3>
              <ul class="tech-list">
                <li><strong>Vanilla JavaScript</strong> - SPA dengan arsitektur MVP</li>
                <li><strong>Leaflet.js</strong> - Library peta interaktif</li>
                <li><strong>MediaStream API</strong> - Akses kamera untuk foto</li>
                <li><strong>Fetch API</strong> - Komunikasi dengan backend</li>
                <li><strong>CSS3</strong> - Styling dengan gradient modern</li>
                <li><strong>Webpack</strong> - Module bundler</li>
              </ul>
            </div>

            <div class="about-card">
              <h3>👨‍💻 Developer</h3>
              <p>
                Aplikasi ini dibuat sebagai submission untuk kelas 
                <strong>"Menjadi Front-End Web Developer Expert"</strong> di Dicoding Indonesia.
              </p>
             
            </div>

            <div class="about-card">
              <h3>📚 Kriteria yang Dipenuhi</h3>
              <ul class="criteria-list">
                <li>✅ SPA dengan Hash Routing & MVP Architecture</li>
                <li>✅ Custom View Transitions</li>
                <li>✅ Peta dengan Marker & Popup</li>
                <li>✅ Multiple Tile Layers</li>
                <li>✅ Interactive Features (Sync, Highlight, Filter)</li>
                <li>✅ Form dengan Validasi</li>
                <li>✅ Upload & Camera Access</li>
                <li>✅ Responsive Design (Mobile, Tablet, Desktop)</li>
                <li>✅ Accessibility (WCAG Standards)</li>
                <li>✅ Skip to Content</li>
              </ul>
            </div>

            <div class="cta-section">
              <a href="#/" class="btn btn-primary btn-large">🏠 Kembali ke Home</a>
              <a href="#/add" class="btn btn-secondary btn-large">➕ Tambah Story</a>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  async afterRender() {
    // No special logic needed for about page
  },
};

export default AboutPage;