import Story from '../../models/story-model.js';

const createStoryCard = (story) => {
  const storyModel = new Story(story);
  
  return `
    <article class="story-card" data-story-id="${storyModel.id}">
      <div class="story-image-container">
        <img 
          data-src="${storyModel.photoUrl}" 
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          alt="Foto story dari ${storyModel.name}"
          class="story-image lazy-load"
        />
      </div>
      <div class="story-content">
        <h3 class="story-title">${storyModel.name}</h3>
        <p class="story-description">${storyModel.description}</p>
        <div class="story-meta">
          <span class="story-date">📅 ${storyModel.getFormattedDate()}</span>
          ${storyModel.hasLocation() ? `
            <span class="story-location">📍 Lat: ${storyModel.lat.toFixed(4)}, Lon: ${storyModel.lon.toFixed(4)}</span>
          ` : '<span class="story-location">📍 Lokasi tidak tersedia</span>'}
        </div>
        <div class="story-actions">
          <button class="btn btn-primary btn-save" data-story-id="${storyModel.id}">Save Offline</button>
          <button class="btn btn-danger btn-delete" data-story-id="${storyModel.id}">Delete Offline</button>
        </div>
      </div>
    </article>
  `;
};

const createStoryListHTML = (stories) => {
  if (!stories || stories.length === 0) {
    return `
      <div class="empty-state">
        <p>📭 Belum ada story yang dibagikan.</p>
        <a href="#/add" class="btn btn-primary">Tambah Story Pertama</a>
      </div>
    `;
  }

  return stories.map((story) => createStoryCard(story)).join('');
};

export { createStoryCard, createStoryListHTML };