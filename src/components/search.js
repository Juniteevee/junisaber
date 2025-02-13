var algoliasearch = require('algoliasearch/lite');
var bindEvent = require('aframe-event-decorators').bindEvent;
var _ = require('lodash');
const BeatSaverAPI = require('beatsaver-api');
const api = new BeatSaverAPI({
  AppName: 'Application Name',
  Version: '1.0.0'
});
const zip = require("@zip.js/zip.js/dist/zip");

var client = algoliasearch('QULTOY3ZWU', 'be07164192471df7e97e6fa70c1d041d');
var algolia = client.initIndex('supersaber');

/**
 * Search (including the initial list of popular searches).
 * Attached to super-keyboard.
 */
AFRAME.registerComponent('search', {
  init: function () {
    this.eventDetail = {query: '', results: []};
    this.popularHits = null;
    this.queryObject = {hitsPerPage: 100, query: ''};

    // Populate popular.
    this.search('');

    // Less hits on normal searches.
    this.queryObject.hitsPerPage = 30;

    this.el.sceneEl.addEventListener('searchclear', () => { this.search(''); });
  },

  superkeyboardchange: bindEvent(function (evt) {
    if (evt.target !== this.el) { return; }
    this.search(evt.detail.value);
  }),

  search: function (query) {
    // Use cached for popular hits.
    console.log(query);
    if (!query && this.popularHits) {
      this.eventDetail.results = this.popularHits;
      this.eventDetail.query = '';
      this.el.sceneEl.emit('searchresults', this.eventDetail);
      return;
    }

    this.eventDetail.query = query;
    this.queryObject.query = query;
    api.searchMaps({q:query}).then((results)=>{
      console.log(results);
      Promise.all(_.map(results.docs, async (result) => {
        let zipBlob = await fetch(result.versions[0].downloadURL).then(r => r.blob());
        const zipFileReader = new zip.BlobReader(zipBlob);
        const zipReader = new zip.ZipReader(zipFileReader);
        const files = await zipReader.getEntries();
        console.log(files);
        const info = _.find(files, {filename: "Info.dat"}) || _.find(files, {filename: "info.dat"});
        const infoBlob = await info.getData(new zip.BlobWriter());
        const infoJson = JSON.parse(await infoBlob.text());
        console.log(infoJson);
        const songFile = _.find(files, {filename: infoJson._songFilename});
        const songBlob = await songFile.getData(new zip.BlobWriter());
        const songUrl = URL.createObjectURL(songBlob);
        const coverFile = _.find(files, {filename: infoJson._coverImageFilename});
        let coverUrl="";
        if(coverFile){
          const coverBlob = await coverFile.getData(new zip.BlobWriter());
          coverUrl = URL.createObjectURL(coverBlob);
        }
        const difficultyInfo = infoJson._difficultyBeatmapSets[0]._difficultyBeatmaps;
        const difficultyFiles = {};
        difficultyInfo.forEach(async (d) => {
          const file = _.find(files, {filename: d._beatmapFilename});
          const fileBlob = await file.getData(new zip.BlobWriter());
          const fileJson = JSON.parse(await fileBlob.text());
          fileJson._beatsPerMinute = infoJson._beatsPerMinute;
          difficultyFiles[d._difficulty] = fileJson;
        });
        return {
          songName: result.metadata.songName,
          songSubName: result.metadata.songAuthorName,
          imageUrl: coverUrl,
          songUrl: songUrl,
          id: result.id,
          data: result,
          difficulties: _.map(difficultyInfo, '_difficulty'),
          numBeats: result.metadata.duration,
          difficultyFiles: difficultyFiles,
        }
      })).then((tmpResults) => {
        this.eventDetail.results = tmpResults;
        console.log(tmpResults);
        this.el.sceneEl.emit('searchresults', this.eventDetail);
      });
    })
    // algolia.search(this.queryObject, (err, content) => {
    //   // Cache popular hits.
    //   if (err) {
    //     this.el.sceneEl.emit('searcherror', null, false);
    //     console.error(err);
    //     return;
    //   }

    //   if (!query) { this.popularHits = content.hits; }
    //   this.eventDetail.results = content.hits;
    //   this.el.sceneEl.emit('searchresults', this.eventDetail);
    // });
  }
});

/**
 * Select genre filter.
 */
AFRAME.registerComponent('search-genre', {
  init: function () {
    this.eventDetail = {isGenreSearch: true, genre: '', results: []};
    this.queryObject = {
      filters: '',
      hitsPerPage: 100
    };

    this.el.addEventListener('click', evt => {
      this.search(evt.target.closest('.genre').dataset.bindForKey);
    });
  },

  search: function (genre) {
    if (genre === 'Video Games') {
      this.queryObject.filters = `genre:"Video Game" OR genre:"Video Games"`;
    } else {
      this.queryObject.filters = `genre:"${genre}"`;
    }
    algolia.search(this.queryObject, (err, content) => {
      if (err) {
        this.el.sceneEl.emit('searcherror', null, false);
        console.error(err);
        return;
      }

      this.eventDetail.genre = genre;
      this.eventDetail.results = content.hits;
      this.el.sceneEl.emit('searchresults', this.eventDetail);
    });
  }
});

/**
 * Click listener for search result.
 */
AFRAME.registerComponent('search-result-list', {
  init: function () {
    const obv = new MutationObserver(mutations => {
      for (let i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'data-index') {
          this.refreshLayout();
        }
      }
    });
    obv.observe(this.el, {attributes: true, childList: false, subtree: true});
  },

  refreshLayout: function () {
    this.el.emit('layoutrefresh', null, false);
  },

  click: bindEvent(function (evt) {
    this.el.sceneEl.emit('menuchallengeselect',
                         evt.target.closest('.searchResult').dataset.id,
                         false);
  })
});

AFRAME.registerComponent('search-song-name-selected', {
  schema: {
    anchor: {default: 0},
    index: {default: 0},
    offset: {default: 0},
    selectedChallengeId: {default: ''}
  },

  update: function () {
    const data = this.data;
    const el = this.el;
    el.object3D.visible = !!data.selectedChallengeId && data.index !== -1;
    el.object3D.position.y = data.index * data.offset + data.anchor;
  }
});
