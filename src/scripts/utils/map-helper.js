import L from 'leaflet';

class MapHelper {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markers = [];
    this.selectedLocation = null;
  }
  
  // Inisialisasi peta dan layer control
  initMap(center = [-2.5489, 118.0149], zoom = 5) {
    if (this.map) {
        this.destroy(); 
    }
    
    this.map = L.map(this.containerId).setView(center, zoom);
    
    // Layer Standard (Default)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    });
    osmLayer.addTo(this.map);
    
    // Layer Opsi Lain (untuk Advance Criteria)
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
    });
    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap © OpenTopoMap',
        maxZoom: 17,
    });
    
    // Layer Control
    const baseMaps = {
        'Standard Map': osmLayer,
        'Dark Mode': darkLayer,
        'Topographic': topoLayer,
    };
    L.control.layers(baseMaps).addTo(this.map);
    return this.map;
  }
  
  // Menambahkan marker dari cerita dan memasang listener
  addStoryMarkers(stories, onMarkerClick) {
    this.clearMarkers();
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon], {
            icon: this.createDefaultIcon()
        })
          .bindPopup(`
            <div class="map-popup">
              <img src="${story.photoUrl}" alt="${story.name}" class="popup-image" />
              <h4>${story.name}</h4>
              <p>${story.description.substring(0, 100)}...</p>
            </div>
          `)
          .addTo(this.map);
        
        // KRITIS: Event listener untuk klik marker (Sync ke List)
        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(story.id); 
          }
        });
        
        this.markers.push({ marker, storyId: story.id, lat: story.lat, lon: story.lon });
      }
    });
    
    // Mengatur batas peta agar semua marker terlihat
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers.map(m => m.marker));
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }
  
  // Mengatur highlight pada marker (Sync dari List)
  highlightMarker(storyId) {
    let targetMarker = null;
    
    this.markers.forEach(({ marker, storyId: id }) => {
      // Atur ulang semua marker ke icon default, kecuali yang diklik
      if (id === storyId) {
        marker.setIcon(this.createHighlightIcon());
        targetMarker = marker;
      } else {
        marker.setIcon(this.createDefaultIcon());
      }
    });

    // Fokuskan peta pada marker yang diklik
    if (targetMarker) {
        this.map.setView(targetMarker.getLatLng(), this.map.getZoom() < 8 ? 8 : this.map.getZoom());
        targetMarker.openPopup();
    }
  }

  // Membuat icon marker default
  createDefaultIcon() {
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }
  
  // Membuat icon marker highlight (Merah)
  createHighlightIcon() {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }
  
  // Mengaktifkan klik peta untuk mendapatkan lokasi (di halaman Tambah Story)
  enableClickForLocation(callback) {
    let marker = null;
    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      if (marker) {
        this.map.removeLayer(marker);
      }
      
      marker = L.marker([lat, lng], {
        icon: this.createHighlightIcon(),
      })
        .addTo(this.map)
        .bindPopup('📍 Lokasi dipilih')
        .openPopup();
      
      this.selectedLocation = { lat, lon: lng };
      if (callback) {
        callback(lat, lng);
      }
    });
  }

  // Menghapus semua marker
  clearMarkers() {
    this.markers.forEach(({ marker }) => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
  }
  
  // Mendapatkan lokasi yang dipilih
  getSelectedLocation() {
    return this.selectedLocation;
  }
  
  // Menghapus peta saat berpindah halaman
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

export default MapHelper;