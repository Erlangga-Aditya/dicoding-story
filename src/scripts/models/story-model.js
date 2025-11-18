class Story {
  constructor({
    id,
    name,
    description,
    photoUrl,
    createdAt,
    lat,
    lon,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.photoUrl = photoUrl;
    this.createdAt = createdAt;
    this.lat = lat;
    this.lon = lon;
  }

  // Format tanggal ke format yang lebih readable
  getFormattedDate() {
    const date = new Date(this.createdAt);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  // Check apakah story memiliki lokasi
  hasLocation() {
    return this.lat !== null && this.lon !== null && this.lat !== undefined && this.lon !== undefined;
  }

  // Get coordinate untuk peta
  getCoordinates() {
    if (this.hasLocation()) {
      return [this.lat, this.lon];
    }
    return null;
  }
}

export default Story;